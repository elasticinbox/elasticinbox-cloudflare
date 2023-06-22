// @ts-ignore
import { OpenAPIRoute, Query, Path, Str, Int } from '@cloudflare/itty-router-openapi'
import { Serializer, Paginator, PaginationOf } from 'ts-japi'

import DAOFactory from '../../common/dao/src/DAOFactory'
import Mailbox from '../../common/dao/src/models/Mailbox.model'
import Message, { ReservedLabel } from '../../common/dao/src/models/Message.model'
// import MimePart from '../../common/dao/src/models/MimePart.model'

export class ListMessages extends OpenAPIRoute {
    static schema = {
        tags: ['Messages'],
        summary: 'List all messages in the mailbox',
        parameters: {
            domain: Path(Str, {
                description: 'Domain',
                required: true,
            }),
            account: Path(Str, {
                description: 'Account',
                required: true,
            }),
            offset: Query(Str, {
                description: 'Pagination start position (aka offset)',
                required: false
            }),
            limit: Query(Int, {
                description: 'Pagination limit (default 50)',
                default: 50,
                required: false
            }),
        },
        responses: {
            '200': {
                schema: {
                    jsonapi: {
                        version: "1.0"
                    },
                    links: {
                        next: "https://api.example.com/domains/example.com/accounts/test/mailbox/messages?limit=50&cursor=1234567890"
                    },
                    data: [
                        {
                            type: 'message',
                            id: 'Message UUID/ULID',
                            attributes: {
                                from: {
                                    address: "from@example.com",
                                    name: "From Name",
                                },
                                to: {
                                    address: "to@example.com",
                                    name: "To Name",
                                },
                                subject: "Hello world",
                                date: "2023-01-01T00:00:00.010Z",
                                labels: [0, 1],
                            },
                        }
                    ]
                },
            },
        },
    }

    async handle(request: Request, env: any, context: any, data: Record<string, any>) {
        const mailbox = new Mailbox(data.account, data.domain);
        const messagesData = await DAOFactory.getMessageDAO(DAOFactory.CLOUDFLARE_KV, env).
            getMessagesWithMetadata(mailbox, ReservedLabel.Inbox, data.offset, data.limit);

        const MessagePaginator = new Paginator<Message>(() => {

            if (messagesData.pagination.next) {
                const nextURL = new URL(request.url)
                nextURL.searchParams.set("offset", messagesData.pagination.next)
                nextURL.searchParams.set("limit", data.limit)

                const pagination: PaginationOf<any> = { // using any due to the conflict between URL and string
                    next: nextURL,
                    first: undefined,
                    last: undefined,
                    prev: undefined
                }

                return pagination;
            }
        });

        const MessageSerializer = new Serializer<Message>('message', {
            linkers: {
                paginator: MessagePaginator
            }
        })

        const jsonApiResponse = await MessageSerializer.serialize(messagesData.messages)
        return Response.json(jsonApiResponse, { status: 200 })
    }
}

export class GetMessage extends OpenAPIRoute {
    static schema = {
        tags: ['Messages'],
        summary: 'Get parsed message',
        parameters: {
            domain: Path(Str, {
                description: 'Domain',
                required: true,
            }),
            account: Path(Str, {
                description: 'Account',
                required: true,
            }),
            messageId: Path(Str, {
                description: 'MessageID',
                required: true,
            }),
        },
        responses: {
            '200': {
                schema: {
                    jsonapi: {
                        version: "1.0"
                    },
                    data: {
                        type: 'message',
                        id: 'Message UUID/ULID',
                        attributes: {
                            from: {
                                address: "from@example.com",
                                name: "From Name",
                            },
                            to: {
                                address: "to@example.com",
                                name: "To Name",
                            },
                            subject: "Hello world",
                            date: "2023-01-01T00:00:00.010Z",
                            labels: [0, 1],
                        },
                    },
                },
            },
        },
    }

    async handle(request: Request, env: any, context: any, data: Record<string, any>) {
        const mailbox = new Mailbox(data.account, data.domain);
        const message = await DAOFactory.getMessageDAO(DAOFactory.CLOUDFLARE_KV, env).
            getParsed(mailbox, data.messageId);

        var MessageSerializer = new Serializer<Message>('message')
        var jsonApiResponse = await MessageSerializer.serialize(message)

        return Response.json(jsonApiResponse, { status: 200 })
    }
}

export class GetRawMessage extends OpenAPIRoute {
    static schema = {
        tags: ['Messages'],
        summary: 'Get raw message',
        description: 'Get raw message from the mailbox.',
        parameters: {
            domain: Path(Str, {
                description: 'Domain',
                required: true,
            }),
            account: Path(Str, {
                description: 'Account',
                required: true,
            }),
            messageId: Path(Str, {
                description: 'MessageID',
                required: true,
            }),
        },
        responses: {
            '200': {
                contentType: 'application/octet-stream',
                schema: new Str({ format: 'binary' }),
            },
        },
    }

    async handle(request: Request, env: any, context: any, data: Record<string, any>) {
        const mailbox = new Mailbox(data.account, data.domain);
        const message = await DAOFactory.getMessageDAO(DAOFactory.CLOUDFLARE_KV, env).
            getRaw(mailbox, data.messageId);

        return new Response(message, {
            status: 200,
            headers: {
                'Content-Type': 'application/octet-stream'
            }
        })
    }
}

export class AddMessage extends OpenAPIRoute {
    static schema = {
        tags: ['Messages'],
        summary: 'Add a message',
        description: 'Add a message to the mailbox. Content type should be `application/octet-stream` and request body should contain email in RFC5322 format.',
        parameters: {
            domain: Path(Str, {
                description: 'Domain',
                example: 'example.com',
                required: true,
            }),
            account: Path(Str, {
                description: 'Account',
                example: 'test',
                required: true,
            }),
        },
        // TODO: Uncomment when this issue is fixed: https://github.com/cloudflare/itty-router-openapi/issues/64
        // requestBody: {
        //     contentType: 'application/octet-stream'
        // },
        responses: {
            '201': {
                schema: {
                    data: {
                        id: "Message UUID/ULID"
                    },
                },
            },
        },
    }

    async handle(request: Request, env: any, context: any, data: Record<string, any>) {
        const mailbox = new Mailbox(data.account, data.domain);
        const messageId = DAOFactory.getMessageDAO(DAOFactory.CLOUDFLARE_KV, env).generateId();

        const messageMetadata = new Message(messageId);
        messageMetadata.labels.add(ReservedLabel.All).add(ReservedLabel.Inbox);

        await DAOFactory.getMessageDAO(DAOFactory.CLOUDFLARE_KV, env).
            put(mailbox, messageId, messageMetadata, request.arrayBuffer());

        return Response.json({ 'data': { 'id': messageId } }, { status: 201 });
    }
}

export class UpdateMessage extends OpenAPIRoute {
    static schema = {
        tags: ['Messages'],
        summary: 'Update a message',
        parameters: {
            domain: Path(Str, {
                description: 'Domain',
                example: 'example.com',
                required: true,
            }),
            account: Path(Str, {
                description: 'Account',
                example: 'test',
                required: true,
            }),
            messageId: Path(Str, {
                description: 'Existing MessageID',
                required: true,
            }),
        },
        // TODO: Uncomment when this issue is fixed: https://github.com/cloudflare/itty-router-openapi/issues/64
        // requestBody: {
        //     contentType: 'application/octet-stream'
        // },
        responses: {
            '201': {
                schema: {
                    data: {
                        id: "Message UUID/ULID"
                    },
                },
            },
        },
    }

    async handle(request: Request, env: any, context: any, data: Record<string, any>) {
        const messageId = data.messageId
        const messageMetadata = new Message(messageId)

        const mailbox = new Mailbox(data.account, data.domain);
        await DAOFactory.getMessageDAO(DAOFactory.CLOUDFLARE_KV, env).
            put(mailbox, messageId, messageMetadata, request.arrayBuffer());

        return Response.json({ 'data': { 'id': messageId } }, { status: 201 });
    }
}

export class DeleteMessage extends OpenAPIRoute {
    static schema = {
        tags: ['Messages'],
        summary: 'Delete a message',
        parameters: {
            domain: Path(Str, {
                description: 'Domain',
                example: 'example.com',
                required: true,
            }),
            account: Path(Str, {
                description: 'Account',
                example: 'test',
                required: true,
            }),
            messageId: Path(Str, {
                description: 'Existing MessageID',
                required: true,
            }),
        },
        responses: {
            '204': {
                schema: {
                    
                },
            },
        },
    }

    async handle(request: Request, env: any, context: any, data: Record<string, any>) {
        const messageId = data.messageId
        const mailbox = new Mailbox(data.account, data.domain);
        DAOFactory.getMessageDAO(DAOFactory.CLOUDFLARE_KV, env).delete(mailbox, messageId);
        return new Response("", { status: 204 });
    }
}