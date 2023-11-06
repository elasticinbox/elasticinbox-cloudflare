import DAOFactory from '../../common/dao/src/DAOFactory'
import Mailbox from '../../common/dao/src/models/Mailbox.model'
import Message, { ReservedLabel } from '../../common/dao/src/models/Message.model'

export interface Env {
	MessageMetadata: KVNamespace
	IndexLabels: KVNamespace
	MessageBlob: R2Bucket
}

export default {
	async email(message: ForwardableEmailMessage, env: Env, ctx: ExecutionContext) {
		const rawEmail = streamToArrayBuffer(message.raw, message.rawSize);
		const messageId = DAOFactory.getMessageDAO(DAOFactory.CLOUDFLARE_KV, env).generateId();

		const messageMetadata = new Message(messageId);
		messageMetadata.labels.add(ReservedLabel.All).add(ReservedLabel.Inbox);

		try {
			const mailbox = new Mailbox(message.to.split("@")[0], message.to.split("@")[1]);
			await DAOFactory.getMessageDAO(DAOFactory.CLOUDFLARE_KV, env).
				put(mailbox, messageId, messageMetadata, rawEmail);
		} catch (error) {
			console.log(error);
			message.setReject("Error processing message");
		}
	}
}

async function streamToArrayBuffer(stream: ReadableStream, streamSize: number) {
	let result = new Uint8Array(streamSize)
	let bytesRead = 0
	const reader = stream.getReader()

	while (true) {
		const { done, value } = await reader.read()
		if (done) {
			break
		}
		result.set(value, bytesRead)
		bytesRead += value.length
	}

	return result;
}
