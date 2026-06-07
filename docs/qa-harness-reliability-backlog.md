# Trusted Bums QA Harness Reliability Backlog

_Last updated: 2026-06-07 by Codex agent setup._

## Executive Read

QA Harness Reliability Agent has been added and scheduled. Its first priority is to turn the known Deep QA client timeout and browser-state failure trail into smaller, deterministic route/role/workflow checks instead of retrying one broad brittle audit.

## Active Harness Fixes

### P0 - Split Deep QA client coverage into reliable slices
- Evidence: Prior release evidence recorded Deep QA client cancellation around `tests/e2e/deep-workflow-hotfix-audit.spec.ts`, the client `Lead Dev hotfix candidates` path, page-navigation timeouts, and a `chrome-error://chromewebdata/` localStorage exception.
- Why it matters: A cancelled Deep QA client pass keeps release evidence from being clean even when other checks pass.
- Recommendation: Split Deep QA by role, route, or workflow; harden auth/navigation helpers; preserve artifacts for each slice; and record product defects separately from harness failures.
- Acceptance criteria: Deep QA client coverage produces pass/fail/skip evidence per slice, and one route failure no longer cancels unrelated role coverage without artifacts.

### P1 - Keep `.env.qa` contract state current before carrying stale access blockers
- Evidence: Several specialist backlogs were written before `.env.qa` was restored to this local workspace. In this setup session, `.env.qa` was present and `qa:env` passed after sourcing it without printing secrets.
- Why it matters: Stale env-gap claims can cause agents to skip authenticated preflight even when credentials are now available locally.
- Recommendation: Each QA-facing run should distinguish `.env.qa` file presence, exported shell state, `qa:env` result, and authenticated browser-smoke result.
- Acceptance criteria: Agent Inputs separate env-file presence, env-contract pass/fail, and authenticated workflow pass/fail instead of collapsing them into one access blocker.

## Deep QA Split Plan

- Initial split target: client route/workflow slice, admin route/workflow slice, Bum route/workflow slice.
- Known brittle path: client `Lead Dev hotfix candidates` route in `deep-workflow-hotfix-audit.spec.ts`.
- Required evidence: GitHub workflow run id, artifact name, role slice, failed selector/helper if any, and whether the failure is harness or product behavior.

## Product Defect Handoffs

- None yet from this setup pass.

## Agent Inputs

- Date of run: 2026-06-07 setup only.
- Files reviewed: agent setup request, prior release memory, new QA harness prompt, current QA and lead rules.
- Checks that could not run and why: no QA harness run was requested during setup.
