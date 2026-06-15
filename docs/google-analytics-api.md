# Google Analytics API Access

_Last updated: 2026-06-15 by Codex._

This project uses the Google Analytics Data API for read-only aggregate reporting and the Google Analytics Admin API for one-time GA4 custom-dimension setup. Use this path instead of automating the Google Analytics web UI.

## What This Enables

- Pull aggregate GA4 reports for `Trusted Bums Web` without opening `analytics.google.com`.
- Query public route, portal route, event, and realtime aggregates from scripts.
- Create the four event-scoped portal dimensions needed for standard GA reports:
  - `portal_area`
  - `route_group`
  - `auth_gate`
  - `is_portal_route`

## Google Setup

1. In Google Cloud, create or choose a project for Trusted Bums analytics access.
2. Enable these APIs for that Cloud project:
   - Google Analytics Data API
   - Google Analytics Admin API
3. Authenticate `gcloud` locally as `bums@trustedbums.com` or another approved GA user:

```bash
gcloud auth login
gcloud auth application-default login
gcloud config set project project-d45d35fc-184a-43c2-889
gcloud auth application-default set-quota-project project-d45d35fc-184a-43c2-889
```

4. Confirm that authenticated Google user has GA property access:
   - `Viewer` is enough for reports.
   - `Editor` is needed temporarily to create custom dimensions.

Service-account JSON keys are not required for local Codex agent work. The Trusted Bums Google Cloud organization currently blocks new service-account key creation with `constraints/iam.disableServiceAccountKeyCreation`, so the preferred local path is either authenticated `gcloud` Application Default Credentials or keyless service-account impersonation.

## Keyless Service Account Impersonation

The local Google Cloud project now has a service account for this workflow:

```text
trusted-bums-ga4-agent@project-d45d35fc-184a-43c2-889.iam.gserviceaccount.com
```

The account `bums@trustedbums.com` has `roles/iam.serviceAccountTokenCreator` on that service account. To use it for GA, add the service-account email above to the GA4 `Trusted Bums` property:

- `Viewer` for read-only aggregate reports.
- `Editor` temporarily for `pnpm ga4:setup-custom-dimensions`.

Then set:

```bash
export GA4_PROPERTY_ID=540873763
export GOOGLE_CLOUD_PROJECT=project-d45d35fc-184a-43c2-889
export GA4_IMPERSONATE_SERVICE_ACCOUNT=trusted-bums-ga4-agent@project-d45d35fc-184a-43c2-889.iam.gserviceaccount.com
```

## Optional Service Account Key Path

If Google org policy later allows service-account keys, store the JSON key outside git, for example:

```bash
mkdir -p .secrets
mv ~/Downloads/YOUR_KEY.json .secrets/google-analytics-service-account.json
```

Do not commit the JSON key. `.secrets/`, `google-analytics-service-account*.json`, and `ga4-service-account*.json` are ignored by git.

## Local Environment

Set these values in your shell or local env file:

```bash
export GA4_PROPERTY_ID=540873763
export GOOGLE_CLOUD_PROJECT=project-d45d35fc-184a-43c2-889
```

`GA4_PROPERTY_ID` is the numeric GA4 property id, not the measurement id. The measurement id remains `G-P6B5EYQMVN`.

If using an optional service-account key later, also set:

```bash
export GOOGLE_APPLICATION_CREDENTIALS=/Users/macdaddy/CodexWork/TrustedBums/trustedbums/.secrets/google-analytics-service-account.json
```

## Create Portal Custom Dimensions

Run this once after the service account has GA property `Editor` access:

```bash
pnpm ga4:setup-custom-dimensions
```

Expected result: JSON showing each dimension as either `created` or `exists`.

After setup, downgrade the service account to `Viewer` unless future Admin API maintenance is needed.

## Pull Reports

Read-only aggregate reports use the Data API and require only `Viewer` access.

```bash
pnpm ga4:report -- --preset=overview --start-date=7daysAgo --end-date=today
pnpm ga4:report -- --preset=routes --limit=25
pnpm ga4:report -- --preset=events
pnpm ga4:report -- --preset=portal
pnpm ga4:report -- --preset=realtime
```

The `portal` preset uses the custom dimensions as `customEvent:portal_area`, `customEvent:route_group`, `customEvent:auth_gate`, and `customEvent:is_portal_route`, filtered to `trustedbums_route_view`.

## Agent Rules

- Use aggregate API output only. Do not export or paste visitor-level data into repo docs.
- Cite the command, preset, date range, and property id in Agent Inputs.
- If the script fails with `403`, check that the authenticated `gcloud` account or service-account email has access to the GA property and that the relevant API is enabled.
- If the `portal` preset fails because custom dimensions are missing, run `pnpm ga4:setup-custom-dimensions` with temporary `Editor` access, then retry the report after GA has processed the definitions.

## References

- Google says the Analytics API quickstart supports the Data API or Admin API, service-account authentication, API enablement, and SDK/REST calls.
- The Data API quickstart uses the GA4 property id and can run reports with metrics such as active users.
- The Admin API custom-dimension resource requires `parameterName`, `displayName`, and immutable `scope`; event-scoped dimensions use the event parameter name.
