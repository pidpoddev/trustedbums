# Trusted Bums Release Verification Backlog

_Last updated: 2026-06-07 by Codex agent setup._

## Release Decision

Decision: UNKNOWN.

## Evidence Summary

Release Verification Agent has been added and scheduled, but has not completed its first evidence pass yet.

## Failed Or Missing Checks

### P1 - First release evidence pass pending
- Evidence: New Release Verification Agent prompt and automation were created after the latest specialist backlogs.
- Impact: Release status still depends on the prior QA, Lead Developer, and Code Review evidence until the first release verification run completes.
- Recommendation: First scheduled run should inspect GitHub QA/E2E/Visual/Deep QA evidence, deployment/function drift, `.env.qa` preflight state, Supabase live evidence, and public-site smoke.
- Acceptance criteria: Backlog includes a current GO/NO-GO/HOLD/HOTFIX/ROLLBACK decision with source evidence and skipped-check reasons.

## Cross-Agent Follow-Ups

- First run should treat older `.env.qa` absence claims as stale because `.env.qa` now exists locally and `qa:env` passed after sourcing it in this setup session. Authenticated browser and GitHub-hosted evidence still need fresh verification.
- First run should hand QA infrastructure failures to QA Harness Reliability rather than treating them as product failures.

## Agent Inputs

- Date of run: 2026-06-07 setup only.
- Files reviewed: agent setup request, new release verification prompt, current agent operating rules.
- Checks that could not run and why: no release verification run was requested during setup.
