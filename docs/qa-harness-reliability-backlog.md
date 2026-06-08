# Trusted Bums QA Harness Reliability Backlog

_Last updated: 2026-06-08 by Codex._

## Executive Read

Hosted evidence proves the Deep QA shards can pass, but the harness still needs to separate true target-preflight misses from later authenticated product or environment failures. GitHub `E2E Smoke` run `27109958355` passed smoke plus `Deep QA (admin|client|bum)` on 2026-06-08. The next run `27110095517` failed only `Deep QA (client)` before route work started, logging `FAIL HTTPS: fetch failed` and `FAIL App shell` while smoke, admin, and Bum still passed. Later June 8 runs then failed after successful setup and auth navigation across multiple roles. The Supabase helper qualification fix in `8fa0796` now has local hosted role-smoke proof plus current-head GitHub smoke, admin deep QA, client deep QA, and Bum deep QA success.

## Active Harness Fixes

### P0 - Split Deep QA client coverage into reliable slices
- Evidence: GitHub `E2E Smoke` run `27109958355` passed `Deep QA (client)` on 2026-06-08, but the next run `27110095517` failed the same shard before navigation with `FAIL HTTPS: fetch failed` and `FAIL App shell`. Earlier evidence also recorded client cancellation around `tests/e2e/deep-workflow-hotfix-audit.spec.ts`, the client `Lead Dev hotfix candidates` path, page-navigation timeouts, and a `chrome-error://chromewebdata/` localStorage exception.
- Why it matters: A cancelled Deep QA client pass keeps release evidence from being clean even when other checks pass.
- Recommendation: Split Deep QA by role, route, or workflow; harden auth/navigation helpers; preserve artifacts for each slice; and record product defects separately from harness failures.
- Acceptance criteria: Deep QA client coverage produces pass/fail/skip evidence per slice, and one route failure no longer cancels unrelated role coverage without artifacts.

### P1 - Classify hosted target-preflight flakes separately from product failures
- Evidence: In GitHub run `27110095517`, `Deep QA (client)` never reached route assertions. The failed shard logged `PASS DNS`, then `FAIL HTTPS: fetch failed`, `FAIL App shell`, and exited from `qa:target-preflight`, while the same workflow's smoke job and the `admin` and `bum` deep shards still passed. The adjacent prior run `27109958355` fully passed on `main`.
- Why it matters: Without a separate harness classification, release docs can carry a transient hosted target miss as if the client workflow regressed in product code.
- Recommendation: Emit a distinct target-preflight failure summary per shard, retain artifacts even when Playwright does not start, and require either a repeat on rerun or an independent reproduction before a hosted preflight miss becomes a product backlog item.
- Acceptance criteria: Hosted shard failures clearly state whether they died in DNS, HTTPS, app shell, Clerk, extension env, or route audit; release and QA docs can cite those categories directly; and a one-off preflight miss no longer creates a product defect by default.

### P1 - Keep `.env.qa` contract state current before carrying stale access blockers
- Evidence: The current local shell still starts with no exported QA contract, so raw `corepack pnpm run qa:env` fails on the base variables. After sourcing `.env.qa`, the same command now fails only on `QA_EXTENSION_API_TOKEN`, and sourced `corepack pnpm run qa:target-preflight` reaches `https://trustedbums.com` successfully through DNS, HTTPS, app shell, and Clerk.
- Why it matters: Stale env-gap claims can cause agents to skip authenticated preflight even when credentials are now available locally.
- Recommendation: Each QA-facing run should distinguish `.env.qa` file presence, exported shell state, `qa:env` result, and authenticated browser-smoke result.
- Acceptance criteria: Agent Inputs separate env-file presence, env-contract pass/fail, and authenticated workflow pass/fail instead of collapsing them into one access blocker.

## Deep QA Split Plan

- Initial split target: client route/workflow slice, admin route/workflow slice, Bum route/workflow slice.
- Known brittle path: client `Lead Dev hotfix candidates` route in `deep-workflow-hotfix-audit.spec.ts`.
- Required evidence: GitHub workflow run id, artifact name, role slice, failed selector/helper if any, and whether the failure is harness or product behavior.

## Product Defect Handoffs

- Lead Developer:
  Evidence: GitHub `E2E Smoke` run `27110216996` failed completed `Deep QA (admin)` and `Deep QA (bum)` jobs after setup because requested routes redirected to `/login` with `Authorization required` and `Unable to bootstrap this profile.` GitHub `E2E Smoke` run `27110329150` then failed the smoke job itself with 13 authenticated failures across admin, client, client finance, and Bum flows showing the same redirect-to-login/bootstrap pattern. After the `8fa0796` helper fix, sourced local hosted role smoke passed all five roles; GitHub `27110757594` passed smoke plus `Deep QA (admin|client|bum)`.
  Requested action: Treat any future repeat bootstrap failure in current-head GitHub logs as product or environment evidence rather than a harness issue, but keep the older bootstrap failure closed as verified by the local and hosted pass.

## Agent Inputs

- Date of run: 2026-06-08.
- Files reviewed: `docs/qa-harness-reliability-backlog.md`, `docs/qa-test-backlog.md`, `docs/release-verification-backlog.md`, `docs/lead-developer-recommendations.md`, `package.json`, `playwright.config.ts`, `.github/workflows/e2e-smoke.yml`, `.github/workflows/deep-qa-hotfix-audit.yml`, `tests/e2e/deep-workflow-hotfix-audit.spec.ts`, `tests/e2e/helpers/auth.ts`, `tests/e2e/helpers/deepQa.ts`, and `scripts/qa-target-preflight.mjs`.
- Commands reviewed: `corepack pnpm run qa:env`, `corepack pnpm run qa:target-preflight`, `gh run list --repo pidpoddev/trustedbums --workflow e2e-smoke.yml --limit 8`, `gh run view 27109958355 --json jobs`, `gh run view 27110095517 --json jobs`, `gh run view 27110095517 --job 80006521915 --log-failed`, and `gh run download 27110095517 --repo pidpoddev/trustedbums`.
- Checks that could not run and why: no local Playwright harness reproduction was run in this update because GitHub-hosted evidence already showed both the older harness-first preflight miss and the newer cross-role bootstrap failures, and current-head `27110757594` provided the final hosted pass.
