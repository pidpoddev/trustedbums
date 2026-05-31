# Trusted Bums Company-Wide Rules

_Last updated: 2026-05-31 by Codex._

## Purpose

This document is the durable source of truth for expected Trusted Bums business behavior, product rules, website rules, terminology decisions, operating assumptions, and company preferences Ryan has clarified.

When Ryan explains expected company, product, website, workflow, access, trust, terminology, or operating behavior, Codex should update this document or a more specific linked rules document during the same work session. Do not leave clarified rules only in chat.

## How To Use This File

- Check this file before asking Ryan to repeat expected behavior.
- Use this file to interpret specialist recommendations before implementation.
- If a clarified rule affects access, RLS, route guards, edge functions, or role permissions, mirror it into `docs/business-access-rules.md`.
- If a clarified rule affects terminology, mirror it into `docs/content-copyeditor-backlog.md` or the glossary.
- If a clarified rule affects trust, reputation, email, domain posture, public website behavior, or security-tool blocking, mirror it into `docs/trust-reputation-backlog.md`.
- If a clarified rule affects QA expectations, mirror it into `docs/qa-test-backlog.md`.
- If a clarified rule affects specialist behavior, mirror it into `docs/consultant-team-rules.md`.

## Rule Capture Standard

When adding a rule, include:

- Rule: The expected behavior in plain language.
- Applies to: The user roles, routes, workflows, systems, or agents affected.
- Why it matters: The business, trust, usability, security, operations, or reporting reason.
- Implementation notes: Concrete implications for code, tests, docs, or operations.
- QA proof: How we know the behavior works.
- Open questions: Any remaining decisions Ryan has not clarified.

## Company Identity And Trust

### Trusted Bums should be treated as a high-trust B2B marketplace
- Rule: Product, website, email, copy, and security decisions should increase buyer confidence and avoid patterns that make Trusted Bums look spammy, scam-like, blocked, spoofable, or low-trust.
- Applies to: Public website, contact forms, email sending, DMARC/DKIM/SPF, browser reputation, Safe Browsing/SmartScreen-style systems, content, UI, and Trust & Reputation work.
- Why it matters: Trusted Bums depends on companies trusting marketplace introductions, domain reputation, and operational communications.
- Implementation notes: Trust-sensitive changes should be reviewed by Trust & Reputation, Security, UX, Content, and Lead Developer when relevant.
- QA proof: Public-site checks, DNS/email checks, scanner/dashboard checks when available, contact-flow abuse checks, and review of visible trust signals.
- Open questions: Which public proof points, testimonials, legal links, or trust badges should be prioritized as the business matures?

## Client Company And User Onboarding

### Client companies are claimed by verified company email domain
- Rule: When a client logs in for the first time with a verified business email domain, the system should use that domain as the company alias. If the domain is unclaimed, the first verified claimant may create the Client company and become the initial Client Admin.
- Applies to: Client signup, profile bootstrap, Clerk user sync, client company creation, Client Admin assignment, Admin override, RLS, QA, and onboarding UX.
- Why it matters: This preserves low-friction client onboarding while preventing users from self-assigning access to companies they do not control.
- Implementation notes: Signup metadata is onboarding intent, not final authorization. The approved server path should validate the verified email domain, create the company for an unclaimed domain, and assign initial Client Admin only when the domain is not already claimed.
- QA proof: First verified user from an unclaimed client domain can create a company and becomes Client Admin; direct attempts to fake company or role through metadata/direct API fail.
- Open questions: Which domains are blocked from automatic company creation, such as public webmail, disposable domains, agencies, consultants, or partner domains?

### Existing Client Admins approve later same-domain users
- Rule: If a client company domain is already claimed, later users from that same verified domain should request access. The existing Client Admin approves them and assigns their company-scoped role.
- Applies to: Client team management, Client Admin, Client Finance, Client Member, notifications, profile bootstrap, and QA.
- Why it matters: The client company controls its own team access without allowing automatic self-join into potentially sensitive company data.
- Implementation notes: Same-domain users should enter an approval queue rather than receiving access immediately. Client Admins may assign allowed roles such as Client Admin, Client Finance, or Client Member.
- QA proof: A later same-domain user cannot self-join directly; the user appears in an approval queue; Client Admin approval grants the selected role; denial or no action leaves the user unassigned.
- Open questions: Should approval be limited to the exact domain alias, or can Client Admins approve related aliases after Admin verifies them?

### Admin can override stale or invalid Client Admin ownership
- Rule: Admin must have an override path to assign a new Client Admin when the previous Client Admin is no longer valid, unavailable, or incorrectly owns the company domain.
- Applies to: Admin portal, company team management, support operations, audit trail, Client Admin assignment, and profile repair.
- Why it matters: Client access cannot become permanently blocked when the first admin leaves the company or made a mistake.
- Implementation notes: Admin override should be audited and should not depend on client-controlled metadata. Admin needs a visible repair or override queue/list.
- QA proof: Admin can replace or add a Client Admin for a claimed domain; the change is audited; the prior user does not retain unintended access if removed.
- Open questions: What evidence should Admin require before overriding a claimed domain?

## Authorization And Profile Rules

### Authorization-bearing profile fields are not self-service
- Rule: Users may not self-assign or directly mutate `role`, `is_admin`, `company_id`, `client_access_role`, or Bum identity through Clerk metadata, browser profile sync, Supabase Data API, RPC, edge function, or extension API.
- Applies to: Clerk, Supabase profiles, route guards, RLS, edge functions, extension API, Admin tooling, and QA.
- Why it matters: These fields determine tenant boundaries and role permissions.
- Implementation notes: Users may edit safe preferences only, such as display name, timezone, and date format, when those fields do not affect authorization.
- QA proof: Direct mutation attempts are denied; safe preference edits still work; Admin/server assignment path works and is audited.
- Open questions: Which exact profile fields are approved for self-service edits after launch?

## Specialist And Release Coordination

### Specialist recommendations require cross-specialist impact review
- Rule: A recommendation from one specialist should be checked with other affected specialists before implementation when tradeoffs are likely.
- Applies to: Lead Developer, Security, UX, UI, QA, Data, Product Ops, Trust & Reputation, Content, Accessibility, and Performance.
- Why it matters: A security change can break usability; a UX change can harm accessibility; a data/export change can create privacy risk; a trust control can affect conversion.
- Implementation notes: Lead Developer should record affected specialists, tradeoffs, mitigation, and validation plan before promoting the recommendation.
- QA proof: Lead recommendations include cross-specialist dependencies and validation checks for material changes.
- Open questions: Should high-risk changes require explicit specialist signoff before Code Review Agent GO?

### Main pushes require post-main QA and rollback guidance
- Rule: After every successful push or merge to `main`, Lead Developer must run or trigger the broadest practical QA/release verification pass and recommend rollback, hotfix-forward, or hold-deploy if release-impacting checks fail.
- Applies to: Lead Developer, Code Review Agent, QA, Security, Trust & Reputation, Supabase, public website, and deployment workflows.
- Why it matters: The Code Review gate checks before merge, but production risk is only known after the merged/deployed system is verified.
- Implementation notes: Code Review Agent GO decisions should include a post-main QA plan. Lead Developer owns the post-main result and recovery recommendation.
- QA proof: Post-main validation results are recorded with pass/fail/skip reasons and rollback or hotfix triggers.
- Open questions: Which checks are mandatory for every main push versus scope-dependent?
