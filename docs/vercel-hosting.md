# Vercel and the production payment service

Vercel runs `api/site-proxy.mjs`, a Node gateway to the existing application at
https://tamandareclub.com.br. The Next/Vinext application uses Cloudflare D1 and
cannot be deployed with `next build` on Vercel as an independent database copy.
The gateway keeps menu orders, Exclusive subscriptions and administration on
the same existing system. The custom domain still belongs to that origin; do
not point it back at this proxy, which would create a loop.

Vercel reads `vercel.json`; no dependency installation is needed for its Node
function. `SITE_PROXY_SECRET` must match the secret in the origin runtime. It
authenticates the original customer IP for rate limiting. Never commit it.
Cookies and request bodies are forwarded, same-origin POST checks are retained,
and private API responses are never cached. The gateway depends on the origin's
availability. Publish application changes to that origin as well as recording
the source in GitHub; a GitHub push deploys the gateway configuration on Vercel.

Run `node --test tests/vercel-proxy.test.mjs` and
`node --experimental-strip-types --test tests/proxy-identity.test.mjs tests/order-recovery.test.mjs`.
The complete application suite is `npm test`.

The Asaas Edge Function sources are maintained in Professional Commerce and
mirrored under `supabase/functions` in GitHub for review. They are deployed to
Supabase separately from the Vercel gateway. Definitive provider rejections
allow recovery of the same order/subscription. Timeouts, incomplete successful
responses, 409, 429 and server failures retain the reconciliation lock. Existing
ambiguous transactions must be checked against Asaas before any reset.

The storefront source in this GitHub repository predates the active payment
integration. Its existing homepage/event changes are preserved. The exact
storefront patch applied to Sites source e59b1ae0ca064bde8cd349bee8488171b92758e9
is recorded in `patches/sites-payment-recovery.patch`; deployed Sites source
is ad19d89229950e5ea7f542832321f36e756bf3ea. Vercel serves that live application,
not the older root Next pages. An independent native Vercel migration still
requires a portable database/runtime adapter.
