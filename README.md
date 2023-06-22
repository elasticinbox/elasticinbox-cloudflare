Warning: This is PoC project.

## Deploy

Before you begin:
1. Make sure you have `wrangler` installed and you are logged in:
   ```
   npm install -g wrangler
   wrangler login
   ```
2. [Enable Email Workers](https://developers.cloudflare.com/email-routing/email-workers/enable-email-workers/)
3. You can create R2 databases (requires card details for free tier)

To initialise all necessary infrastructure (KV, R2, routes) and deploy Workers, run the following commands. Replace `ROUTE_ZONE` and `ROUTE_DOMAIN` with your Cloudflare zone/domain.
```
make create ROUTE_ZONE=example.com ROUTE_DOMAIN=api.example.com
make deploy
```

Finally, configure [catch-all email routing](https://developers.cloudflare.com/email-routing/setup/email-routing-addresses/#catch-all-address) to send all emails to `elasticinbox-mda` worker.

## Usage

After successful deployment:

1. Send test email to your configured zone (`ROUTE_ZONE`), e.g. `test@example.com`.
2. Access OpenAPI UI on `{ROUTE_DOMAIN}/docs`, e.g. `api.example.com/docs`.

## Other Command

```
make help

create                 Create all Cloudflare infrastructure. Requires ROUTE_ZONE and ROUTE_DOMAIN for API Worker.
delete                 Delete Cloudflare Workers
deploy                 Deploy Cloudflare Workers
destroy-preview        Destroy only preview Cloudflare infrastructure
destroy                Destroy all Cloudflare infrastructure
```

## Local Development

```
cd worker-api
wrangler dev
```

## Todo

- [ ] Exception handling and input validation
- [ ] Integration tests
- [ ] APIs for Label and Mailbox operations
