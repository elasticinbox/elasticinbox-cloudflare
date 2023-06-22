import { OpenAPIRouter } from '@cloudflare/itty-router-openapi'
import { GetMessage, GetRawMessage, ListMessages, AddMessage, UpdateMessage, DeleteMessage } from './messageRoutes'

export interface Env {
	MessageMetadata: KVNamespace
	IndexLabels: KVNamespace
	MessageBlob: R2Bucket
}

const router = OpenAPIRouter({
	schema: {
		info: {
			title: 'ElasticInbox REST API',
			version: '3.0',
		}
	}
});

router.get('/domains/:domain/accounts/:account/mailbox/messages', ListMessages);
router.get('/domains/:domain/accounts/:account/mailbox/messages/:messageId', GetMessage);
router.get('/domains/:domain/accounts/:account/mailbox/messages/:messageId/raw', GetRawMessage);
// router.get('/domains/:domain/accounts/:account/mailbox/messages/:messageId/parts/:partId', GetMessage);
// router.get('/domains/:domain/accounts/:account/mailbox/messages/:messageId/parts/:contentId', GetMessage);
router.post('/domains/:domain/accounts/:account/mailbox/messages', AddMessage);
router.post('/domains/:domain/accounts/:account/mailbox/messages/:messageId', UpdateMessage);
router.delete('/domains/:domain/accounts/:account/mailbox/messages/:messageId', DeleteMessage);

// 404 for everything else
router.all('*', () => new Response('Not Found.', { status: 404 }));

export default {
	fetch: router.handle,
};
