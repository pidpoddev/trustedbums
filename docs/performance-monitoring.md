# Trusted Bums Performance Monitoring

The app now supports two no-cost performance monitoring paths:

- `VITE_CLOUDFLARE_WEB_ANALYTICS_TOKEN`: loads Cloudflare Web Analytics when a free Cloudflare token is provided.
- `VITE_PERFORMANCE_BEACON_URL`: sends lightweight Web Vitals-style browser metrics to an endpoint you control.

Metrics currently captured in browsers that support them:

- LCP
- FCP
- INP
- CLS
- TTFB

Trusted Bums classifies this telemetry as necessary operational monitoring for reliability, troubleshooting, and performance regression detection. Optional product analytics and marketing measurement remain consent-controlled separately.

No real keys or tokens should be committed. The repo contains placeholder variable names in the env templates; add real values through the deployment provider or local QA env file.

For Trusted Bums, the no-cost custom beacon endpoint is the Supabase Edge Function:

`https://vaoqvtxqvbptyxddpoju.supabase.co/functions/v1/performance-beacon`

It records validated browser metrics in `public.performance_metric_events`. The table has RLS enabled; admins can read the stored events and browser clients cannot write directly to the table.

Admins can review recent samples in the Admin Portal at `/admin/performance`.
