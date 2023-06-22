import { CloudflareKVMessageDAO } from './cloudflare-kv/MessageDAO'
import { MessageDAO } from './MessageDAO'

export interface Env {
	MessageMetadata: KVNamespace
	IndexLabels: KVNamespace
	MessageBlob: R2Bucket
}

export default class DAOFactory {
    public static readonly CLOUDFLARE_KV  = 'cloudflare_kv'
    public static readonly AWS_DYNAMODB   = 'dynamodb' // Example only, not implemented
    public static readonly DATASTAX_ASTRA = 'astradb'  // Example only, not implemented

    public static getMessageDAO(storageDriver: string, env: Env): MessageDAO {
        // Currently only Cloudflare KV supported, ignore storageDriver config
        return new CloudflareKVMessageDAO(env)
    }
}
