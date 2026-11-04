# Payment correction — 2026-11-04

The production Asaas response identified the Pix failure: the static QR description exceeded the provider's 37-character maximum. Descriptions now use the short order reference; the full identifier remains in externalReference. The regression fixture rejects descriptions exceeding this limit.

A controlled R$ 1 QR was generated successfully against production, then canceled through the provider. It was never paid; no money was moved. Exclusive setup also returned configured=true in production. Paid confirmation remains covered by isolated canonical-payment tests, not a real purchase.

The gateway transport credential was renewed as COMMERCE_GATEWAY_TOKEN in Professional Commerce, with the matching token_hash in tamandare_gateway_keys. COMMERCE_PAYMENT_TOKEN remains unchanged for existing Exclusive identity seals. Webhook credentials and the Asaas API key were not changed. Never store secret values here.

Current service source: c0b8c4b8a442faa9447c94ad02816cbd8c47e6cf in the Professional Commerce Sites repository. The gateway transport patch is recorded in patches/commerce-gateway-credential.patch; the storefront patch is in patches/sites-payment-recovery.patch. Runtime payment Edge Functions are mirrored under supabase/functions.

Validation: 37 storefront tests and 30 commerce tests passed. Vercel serves the same live origin and database, using the Node gateway in api/site-proxy.mjs. External GET navigation is accepted; cross-site writes are rejected.

Historical orders stuck in creating without a provider ID are still reconciliation cases. They are not automatically reset: first verify them in Asaas before allowing a replacement payment. New definitive rejections are recoverable on the same order, while ambiguous results retain their lock.
