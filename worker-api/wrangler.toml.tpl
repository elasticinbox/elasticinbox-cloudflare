name = "elasticinbox-api"
main = "src/worker.ts"
compatibility_date = "2023-05-18"
node_compat = true

kv_namespaces = [
  { binding = "MessageMetadata", id = "%KV_MM%", preview_id = "%KV_MM_PREVIEW%" },
  { binding = "IndexLabels", id = "%KV_IL%", preview_id = "%KV_IL_PREVIEW%" }
]

r2_buckets = [
  { binding = "MessageBlob", bucket_name = "elasticinbox-blob", preview_bucket_name="elasticinbox-blob-preview" }
]

routes = [
	{ pattern = "%ROUTE_DOMAIN%/*", zone_name = "%ROUTE_ZONE%" }
]
