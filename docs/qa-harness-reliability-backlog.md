# Trusted Bums QA Harness Reliability Backlog

_Last updated: 2026-06-08 by Codex daily QA harness reliability automation._

## Executive Read

The role split is now proven and should stop being tracked as unfinished implementation work. GitHub `E2E Smoke` run `27110757594` on commit `8fa0796` completed green on 2026-06-08 with smoke plus `Deep QA (admin|client|bum)`, so the earlier auth/bootstrap regression is no longer an active harness item. The remaining harness work is narrower: preserve downloadable evidence when `qa:target-preflight` fails before Playwright starts, make the GitHub deep-shard env contract match the standalone deep-audit contract, and stop silently skipping extension coverage in hosted preflight when the workflow leaves `QA_EXTENSION_API_BASE_URL` unset.

## Active Harness Fixes

### P0 - Persist target-preflight evidence as a downloadable artifact even when Playwright never starts
- Evidence: GitHub `E2E Smoke` run `27110095517` failed only `Deep QA (client)` in `qa:target-preflight` with `FAIL HTTPS: fetch failed` and `FAIL App shell`. Downloading that run produced `playwright-report`, `deep-qa-hotfix-audit-admin`, and `deep-qa-hotfix-audit-bum`, but no `deep-qa-hotfix-audit-client` files because the workflow only uploads `playwright-report/` and `test-results/`.
- Why it matters: When preflight fails before Playwright generates output, the only durable evidence is buried in job logs instead of the artifact set that QA and Release Verification are expected to review.
- Recommendation: Make `scripts/qa-target-preflight.mjs` write a small text or JSON summary into a deterministic file under `test-results/` or a dedicated `qa-preflight/` directory, then upload that path in both `E2E Smoke` and `Deep QA Hotfix Audit`.
- Acceptance criteria: A shard that dies in preflight still uploads a downloadable artifact naming each PASS/FAIL step and the exact failure category.

### P1 - Align deep-shard env-contract enforcement between `E2E Smoke` and standalone `Deep QA Hotfix Audit`
- Evidence: `.github/workflows/deep-qa-hotfix-audit.yml` runs `pnpm run qa:target-preflight && pnpm run qa:env && pnpm run qa:deep`, but `.github/workflows/e2e-smoke.yml` runs only `pnpm run qa:target-preflight && pnpm run qa:deep` for the deep shards. In the current local shell, raw `corepack pnpm run qa:env` fails on the base QA variables, while sourced `.env.qa` narrows the failure to `QA_EXTENSION_API_TOKEN`.
- Why it matters: The same deep audit currently validates different env contracts depending on which workflow invoked it, which weakens failure classification and makes CI/local comparisons harder to trust.
- Recommendation: Run `qa:env` before `qa:deep` in the `E2E Smoke` deep-shard job too, or replace both chains with one shared script that enforces the same contract in both workflows.
- Acceptance criteria: A missing required QA variable fails both deep-audit workflows in the same stage with the same message.

### P1 - Stop treating extension coverage as silently optional in hosted preflight
- Evidence: The failed `Deep QA (client)` log from run `27110095517` shows both `QA_EXTENSION_API_BASE_URL` and `QA_EXTENSION_API_TOKEN` empty in GitHub, and `qa:target-preflight` reported `PASS Extension API: QA_EXTENSION_API_BASE_URL is not set; extension API suites should be skipped`. Locally, after sourcing `.env.qa`, `qa:env` and `qa:target-preflight` both fail only on missing `QA_EXTENSION_API_TOKEN`, which means the local contract and hosted contract are no longer equivalent.
- Why it matters: Hosted green runs can still omit extension authorization coverage without making that omission obvious in the artifact set or release summary.
- Recommendation: Add an explicit hosted expectation flag for extension coverage, or require `QA_EXTENSION_API_BASE_URL` in workflows that are supposed to exercise extension-adjacent release evidence. If extension coverage is intentionally out of scope for a run, record that as a skip category rather than a generic PASS.
- Acceptance criteria: Hosted preflight distinguishes `verified`, `intentionally skipped`, and `misconfigured` extension coverage states, and release docs no longer infer extension readiness from a green run that never had extension inputs.

### P2 - Keep env-state reporting split into raw shell, sourced `.env.qa`, and hosted workflow contract
- Evidence: This local run found `.env.qa` present, raw `corepack pnpm run qa:env` failing on the base contract, sourced `corepack pnpm run qa:env` failing only on `QA_EXTENSION_API_TOKEN`, and sourced `corepack pnpm run qa:target-preflight` passing DNS, HTTPS, app shell, and Clerk for `https://trustedbums.com`.
- Why it matters: Harness docs become noisy and stale when they collapse file presence, exported shell state, and workflow-secret state into one blanket “env missing” claim.
- Recommendation: Keep every QA-facing backlog and handoff separating local raw shell state, sourced `.env.qa` state, and GitHub workflow env state.
- Acceptance criteria: Agent Inputs and release notes clearly show which env contract was checked, how it was loaded, and which variable names were still missing.

## Deep QA Split Plan

- Current split: `admin`, `client`, and `bum` shards in both `.github/workflows/e2e-smoke.yml` and `.github/workflows/deep-qa-hotfix-audit.yml`.
- Current proof: GitHub `E2E Smoke` run `27110757594` passed smoke plus all three deep shards on commit `8fa0796`.
- Escalation rule: keep the role split as the default. Split a shard further by workflow or route only if a specific shard fails repeatedly after `qa:target-preflight` passes.
- Next candidate sub-slices if the client shard regresses again: `/client/dashboard` plus search, `/client/targets` plus opportunity registration, `/client/payments` plus `/client/exports`, and `/client/team`.
- Required evidence per slice: workflow run id, shard or sub-slice name, downloadable preflight summary, Playwright report or `lead-dev-hotfix-report`, route results, and a harness-versus-product classification.

## Product Defect Handoffs

- QA Test Engineer and Lead Developer:
  Evidence: GitHub `E2E Smoke` runs `27110216996` and `27110329150` exposed a real authenticated redirect-to-`/login` regression with `Authorization required` and `Unable to bootstrap this profile.` That defect now has closure evidence: commit `8fa0796` plus GitHub run `27110757594` passed smoke and all three deep shards.
  Requested action: Keep the June 8 auth/bootstrap incident in historical release notes, not the active harness queue. Reopen it only if a newer current-head hosted run repeats the redirect pattern after preflight passes.

## Agent Inputs

- Date of run: 2026-06-08
- Workflows, artifacts, tests, helpers, scripts, env checks, GitHub runs, and commands reviewed: `docs/qa-harness-reliability-backlog.md`, `docs/qa-test-backlog.md`, `docs/release-verification-backlog.md`, `docs/lead-developer-recommendations.md`, `package.json`, `playwright.config.ts`, `.github/workflows/e2e-smoke.yml`, `.github/workflows/deep-qa-hotfix-audit.yml`, `.github/workflows/qa.yml`, `.github/workflows/visual-ui-audit.yml`, `tests/e2e/deep-workflow-hotfix-audit.spec.ts`, `tests/e2e/authenticated-role-smoke.spec.ts`, `tests/e2e/extension-api.spec.ts`, `tests/e2e/helpers/auth.ts`, `tests/e2e/helpers/deepQa.ts`, `scripts/verify-qa-env.mjs`, `scripts/qa-target-preflight.mjs`, raw and sourced `corepack pnpm run qa:env`, sourced `corepack pnpm run qa:target-preflight`, `/Users/macdaddy/bin/gh-trustedbums run list --repo Pidpoddev/trustedbums --limit 12 --json ...`, `/Users/macdaddy/bin/gh-trustedbums run view 27110757594 --json ...`, `/Users/macdaddy/bin/gh-trustedbums run view 27110095517 --json jobs`, `/Users/macdaddy/bin/gh-trustedbums run view 27110095517 --job 80006521915 --log-failed`, and `/Users/macdaddy/bin/gh-trustedbums run download` for runs `27110095517` and `27110757594`.
- Checks that could not run and why: no local Playwright deep-audit reproduction was needed because current-head GitHub evidence already showed the shard split passing and the remaining issues were workflow or artifact-contract gaps; no direct live Supabase log inspection was needed because the latest hosted E2E run already cleared the earlier product bootstrap defect.
