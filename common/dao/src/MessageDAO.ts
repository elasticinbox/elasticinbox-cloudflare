import Message from "./models/Message.model";
import Mailbox from "./models/Mailbox.model";

/**
 * Interface for Message operations
 */
export interface MessageDAO {
    /**
     * Generate a unique message ID.
     */
    generateId(): string;

    /**
     * Get parsed message. This method only retrieves data available in the
     * metadata store and return it as a {@link Message} object.
     * 
     * @param string The mailbox to retrieve the message from.
     * @param string The ID of the message to retrieve.
     * @return The parsed {@link Message} object.
     */
    getParsed(mailbox: Mailbox, messageId: string): Promise<Message>;

    /**
     * Get raw message. This method returns {@link ArrayBuffer} for
     * the message source from the blob store.
     * 
     * @param mailbox The mailbox to retrieve the message from.
     * @param messageId The ID of the message to retrieve.
     * @return The {@link BlobDataSource} representing the raw message source.
     */
    getRaw(mailbox: Mailbox, messageId: string): Promise<ArrayBuffer>;

    /**
     * Store message metadata and source.
     * 
     * <p>First, the message source is stored in the blob store. Then, the blob URI together
     * with other metadata is stored in the metadata store and added to indexes.</p>
     * 
     * @param mailbox The mailbox to store the message in.
     * @param messageId The unique message ID. If a message with the given ID already exists,
     *                  the original message will be overwritten.
     * @param partialMessage Partial message metadata that will be added to the parsed message.
     * @param raw The message source as an {@link ArrayBuffer}.
     */
    put(mailbox: Mailbox, messageId: string, partialMessage: Message, raw: Promise<string | ArrayBuffer | Blob>): void;

    /**
     * Get message IDs from the given label.
     * 
     * @param mailbox The mailbox to retrieve the messages from.
     * @param labelId The label ID where to lookup messages.
     * @param offset The pagination offset. If set to <code>null</code>, it will start from the most recent message.
     * @param limit The number of messages to retrieve.
     * @param reverse Defines the order of the retrieval.
     * @return A {@link List} of message IDs.
     */
    getMessageIds(mailbox: Mailbox, labelId: number, offset: string, limit: number, reverse: boolean): Promise<Array<string>>;

    /**
     * Get message IDs and metadata such as email headers from the given label.
     * 
     * @param mailbox The mailbox to retrieve the messages from.
     * @param labelId The label ID where to lookup messages.
     * @param offset The pagination offset. If set to <code>null</code>, it will start from the most recent message.
     * @param limit The number of messages to retrieve.
     * @param reverse Defines the order of the retrieval.
     * @param includeBody If true, returns text and html emails as a part of the metadata.
     * @return An {@link Array} of {@link Message} objects.
     */
    getMessagesWithMetadata(mailbox: Mailbox, labelId: number, offset?: string, limit?: number, reverse?: boolean, includeBody?: boolean): Promise<MessageMetadataResponse>;

    /**
     * Modify message labels and markers.
     * 
     * @param mailbox The mailbox to modify the message in.
     * @param messageId The ID of the message to modify.
     * @param modification The {@link MessageModification} object containing the modifications to apply.
     */
    // modify(mailbox: Mailbox, messageId: string, modification: MessageModification): void;

    /**
     * Modify message labels and markers.
     * 
     * @param mailbox The mailbox to modify the messages in.
     * @param messageIds The IDs of the messages to modify.
     * @param modification The {@link MessageModification} object containing the modifications to apply.
     */
    // modify(mailbox: Mailbox, messageIds: Array<string>, modification: MessageModification): void;

    /**
     * Delete multiple messages.
     * 
     * @param mailbox The mailbox to delete the messages from.
     * @param messageIds The IDs of the messages to delete.
     */
    // delete(mailbox: Mailbox, messageIds: Array<string>): void;

    /**
     * Delete a single message.
     * 
     * @param mailbox The mailbox to delete the message from.
     * @param messageId The ID of the message to delete.
     */
    delete(mailbox: Mailbox, messageId: string): void;

    /**
     * Purge deleted messages older than the given age (aka empty bin)
     * 
     * @param mailbox The mailbox to purge the messages from.
     * @param age The age specifying the threshold for deletion.
     */
    // purge(mailbox: Mailbox, age: Date): void;
}

export type MessageMetadataResponse = {
    messages: Array<Message>,
    pagination: {
        next: string | null,
    }
}
