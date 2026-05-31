# Trusted Bums Agent Operating Pack

_Last updated: 2026-05-31 by Codex._

This folder is the repo-shared source for Trusted Bums consultant agents, operating rules, and review gates. It exists so every developer can inspect the same expected behaviors instead of relying on one person's local Codex automation registry.

## Contents

- `automation-prompts/`: snapshots of the Trusted Bums Codex automation prompts. These are reference definitions for daily UX, UI, content, accessibility, QA, security, performance, data, product ops, trust/reputation, and lead developer agents.
- `consultant-team-rules.md`: shared behavioral rules and handoff expectations for every specialist.
- `consultant-access-needs.md`: durable list of access, dashboard, connector, QA, and evidence gaps that limit consultant quality.
- `business-access-rules.md`: role and data access expectations used by Security, QA, Data, Product Ops, Lead Developer, and Code Review.
- `code-review-agent.md`: pre-main Code Review Agent contract, GO/NO-GO output format, and Lead Developer handoff rules.

## Code Review Gate

Pushes or merges to `main` require a Code Review Agent GO decision for the exact commit being pushed. The local hook lives in `.githooks/pre-push` and runs `scripts/code-review-gate.mjs`.

Each developer should enable the shared hook once per clone:

```bash
pnpm run install:hooks
```

The hook blocks direct pushes to `main` unless `.codex-review-decision.json` exists locally with a fresh GO decision for the exact commit. That file is ignored by git because it is local review state.

## Updating This Pack

When a role changes, update the matching file in this folder and the active `docs/` source file when applicable. If a local Codex automation prompt changes, refresh the matching file under `automation-prompts/` before pushing.

Do not commit secrets, private data, raw mailbox content, or environment-specific credential values into this folder.
