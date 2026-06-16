# Trusted Bums Performance Monitoring

The app now supports two no-cost performance monitoring paths:

- `VITE_CLOUDFLARE_WEB_ANALYTICS_TOKEN`: loads Cloudflare Web Analytics when a free Cloudflare token is provided.
- `VITE_GOOGLE_ANALYTICS_MEASUREMENT_ID`: loads Google Analytics only after a visitor opts into the optional Analytics consent category.
- `VITE_MICROSOFT_CLARITY_PROJECT_ID`: loads Microsoft Clarity only after a visitor opts into the optional Analytics consent category. Production defaults to project `x7nevilplm`.
- `VITE_PERFORMANCE_BEACON_URL`: sends lightweight Web Vitals-style browser metrics to an endpoint you control.

Metrics currently captured in browsers that support them:

- LCP
- FCP
- INP
- CLS
- TTFB

Trusted Bums classifies this telemetry as necessary operational monitoring for reliability, troubleshooting, and performance regression detection. Optional product analytics and marketing measurement remain consent-controlled separately.

The production Google Analytics web stream is `Trusted Bums Web` for `https://trustedbums.com` with measurement ID `G-P6B5EYQMVN`. Microsoft Clarity is configured for `https://trustedbums.com` with project ID `x7nevilplm`; its dashboard integration shows Google Analytics connected to `Trusted Bums` and active as of 2026-06-15. Clarity receives the same consent-gated outcome event names as GA plus aggregate route tags (`portal_area`, `route_group`, `auth_gate`, and `is_portal_route`) so recordings and heatmaps can be filtered without sending protected IDs, names, emails, notes, or company details.

No real keys or tokens should be committed. The repo contains placeholder variable names in the env templates; add real values through the deployment provider or local QA env file.

For Trusted Bums, the no-cost custom beacon endpoint is the Supabase Edge Function:

`https://vaoqvtxqvbptyxddpoju.supabase.co/functions/v1/performance-beacon`

It records validated browser metrics in `public.performance_metric_events`. The table has RLS enabled; admins can read the stored events and browser clients cannot write directly to the table.

Admins can review recent samples in the Admin Portal at `/admin/performance`.
