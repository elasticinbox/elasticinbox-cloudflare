# Should have used Terraform
BASEDIR=$(CURDIR)
API_DIR=$(BASEDIR)/worker-api
MDA_DIR=$(BASEDIR)/worker-mda
ndef = $(if $(value $(1)),,$(error $(1) not set))

EXECUTABLES = wrangler jq sed awk
K := $(foreach exec,$(EXECUTABLES),\
        $(if $(shell which $(exec)),some string,$(error Unable to find "$(exec)" tool. Please make sure it's installed and in PATH)))

.PHONY: help
help:	## This help.
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

test:  ## Run tests
	echo Tests are not implemented

create: ## Create all Cloudflare infrastructure. Requires ROUTE_ZONE and ROUTE_DOMAIN for API Worker.
	$(call ndef,ROUTE_ZONE)
	$(call ndef,ROUTE_DOMAIN)

	echo 'name = "elasticinbox-api"' > $(API_DIR)/wrangler.toml
	echo 'name = "elasticinbox-mda"' > $(MDA_DIR)/wrangler.toml

	-wrangler -c worker-mda/wrangler.toml kv:namespace create MessageMetadata
	-wrangler -c worker-mda/wrangler.toml kv:namespace create MessageMetadata --preview
	-wrangler -c worker-mda/wrangler.toml kv:namespace create IndexLabels
	-wrangler -c worker-mda/wrangler.toml kv:namespace create IndexLabels --preview
	-wrangler r2 bucket create elasticinbox-blob
	-wrangler r2 bucket create elasticinbox-blob-preview

	KVLIST=$$(wrangler kv:namespace list); \
	KV_MM=$$(echo $${KVLIST} | jq -r '.[] | select(.title|endswith("-MessageMetadata"))| .id'); \
	KV_IL=$$(echo $${KVLIST} | jq -r '.[] | select(.title|endswith("-IndexLabels"))| .id'); \
	KV_MM_PREVIEW=$$(echo $${KVLIST} | jq -r '.[] | select(.title|endswith("-MessageMetadata_preview"))| .id'); \
	KV_IL_PREVIEW=$$(echo $${KVLIST} | jq -r '.[] | select(.title|endswith("-IndexLabels_preview"))| .id'); \
	sed -e "s;%KV_MM%;$${KV_MM};g" -e "s;%KV_MM_PREVIEW%;$${KV_MM_PREVIEW};g" \
	    -e "s;%KV_IL%;$${KV_IL};g" -e "s;%KV_IL_PREVIEW%;$${KV_IL_PREVIEW};g" $(MDA_DIR)/wrangler.toml.tpl > $(MDA_DIR)/wrangler.toml; \
	sed -e "s;%KV_MM%;$${KV_MM};g" -e "s;%KV_MM_PREVIEW%;$${KV_MM_PREVIEW};g" \
	    -e "s;%KV_IL%;$${KV_IL};g" -e "s;%KV_IL_PREVIEW%;$${KV_IL_PREVIEW};g" \
		-e "s;%ROUTE_ZONE%;$${ROUTE_ZONE};g" -e "s;%ROUTE_DOMAIN%;$${ROUTE_DOMAIN};g" \
		$(API_DIR)/wrangler.toml.tpl > $(API_DIR)/wrangler.toml;

destroy: delete destroy-preview ## Destroy all Cloudflare infrastructure
	-wrangler -c worker-mda/wrangler.toml kv:namespace delete --binding MessageMetadata --preview=false
	-wrangler -c worker-mda/wrangler.toml kv:namespace delete --binding IndexLabels --preview=false
	-wrangler r2 bucket delete elasticinbox-blob
	-wrangler r2 bucket delete elasticinbox-blob-preview
	echo 'name = "elasticinbox-api"' > $(API_DIR)/wrangler.toml
	echo 'name = "elasticinbox-mda"' > $(MDA_DIR)/wrangler.toml

destroy-preview: ## Destroy only preview Cloudflare infrastructure
	-wrangler -c worker-mda/wrangler.toml kv:namespace delete --binding MessageMetadata --preview
	-wrangler -c worker-mda/wrangler.toml kv:namespace delete --binding IndexLabels --preview
	-wrangler r2 bucket delete elasticinbox-blob-preview

deploy: ## Deploy Cloudflare Workers
	-cd $(API_DIR); wrangler deploy
	-cd $(MDA_DIR); wrangler deploy

delete: ## Delete Cloudflare Workers
	-cd $(API_DIR); wrangler delete
	-cd $(MDA_DIR); wrangler delete 
