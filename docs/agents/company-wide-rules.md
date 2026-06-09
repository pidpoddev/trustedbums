# Trusted Bums Company-Wide Rules

_Last updated: 2026-06-04 by Codex._

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
- Open questions: Hone the blocked/manual-review domain list over time based on abuse patterns and client operations.

### Public email domains require manual company and admin verification
- Rule: Gmail and other public email accounts may be used to create a company, but they do not qualify for automatic company-domain claiming. The client must provide alternate proof of company identity and administrative authority before a company is created or a Client Admin is assigned.
- Applies to: Client signup, public email onboarding, Admin review queues, company creation, Client Admin assignment, RLS, Product Ops, Security, QA, and Support.
- Why it matters: Some legitimate clients may use Gmail or another public mailbox, but public email domains cannot prove company control by domain ownership.
- Implementation notes: Public-domain signups should enter Admin review. Initial acceptable proof may include company legal name, company website or public listing, and at least one proof of administrative authority such as signed authorization, ownership email from a company domain, payment/customer record, business registration match, or Admin-verified relationship. Signup intent remains advisory until approved.
- QA proof: A Gmail/public-email user can request company creation; the user cannot automatically create a company or become Client Admin; Admin can approve company/admin assignment after verification; direct role/company mutation attempts remain denied.
- Open questions: Hone exact proof requirements as real client cases come in.

### Existing Client Admins approve later same-domain users
- Rule: If a client company domain is already claimed, later users from that same verified domain should request access. The existing Client Admin approves them and assigns their company-scoped role.
- Applies to: Client team management, Client Admin, Client Finance, Client Member, notifications, profile bootstrap, and QA.
- Why it matters: The client company controls its own team access without allowing automatic self-join into potentially sensitive company data.
- Implementation notes: Same-domain users should enter an approval queue rather than receiving access immediately. Client Admins may assign allowed company-scoped roles such as Client Admin, Client Finance, or Client Member, and may disable other users in their company including another Client Admin. Client Admin actions must remain company-scoped and must not let the acting user claim unrelated companies or unrelated domains.
- QA proof: A later same-domain user cannot self-join directly; the user appears in an approval queue; Client Admin approval grants the selected role; denial or no action leaves the user unassigned; Client Admin can disable another same-company Client Admin; cross-company changes are denied.
- Open questions: None for the first implementation pass.

### Client Admins may request related company domains with validation
- Rule: Client Admins may add additional domains to their company domain list, but each added domain requires Admin review before it can grant company access.
- Applies to: Client Admin company settings, related-domain aliases, Admin review, onboarding, RLS, QA, Security, and Product Ops.
- Why it matters: Many companies use multiple domains, acquired brands, or subsidiary domains, but domain aliases create company-access authority and must not allow false claims such as one company claiming another company's domain.
- Implementation notes: Related-domain additions should enter an Admin review queue. Admin approves only when the relationship/control is credible enough for the current small-team operating model. DNS challenge, email-to-domain approval, or website proof can be added later if volume or risk increases.
- QA proof: Client Admin can request an additional domain; the requested domain does not grant access until Admin approves it; users from the new domain can be approved only after Admin approval; attempts to claim an unrelated domain are denied or remain pending.
- Open questions: None for the first implementation pass.

### Admin can override stale or invalid Client Admin ownership
- Rule: Admin must have an override path to assign a new Client Admin when the previous Client Admin is no longer valid, unavailable, or incorrectly owns the company domain.
- Applies to: Admin portal, company team management, support operations, audit trail, Client Admin assignment, and profile repair.
- Why it matters: Client access cannot become permanently blocked when the first admin leaves the company or made a mistake.
- Implementation notes: While Trusted Bums is operated by a small trusted team, Admin discretion is acceptable for override evidence. Admin override should still be audited and should not depend on client-controlled metadata. Admin needs a visible repair or override queue/list.
- QA proof: Admin can replace or add a Client Admin for a claimed domain; the change is audited; the prior user does not retain unintended access if removed.
- Open questions: None for the first implementation pass.

## Authorization And Profile Rules

### Authorization-bearing profile fields are not self-service
- Rule: Users may not self-assign or directly mutate `role`, `is_admin`, `company_id`, `client_access_role`, or Bum identity through Clerk metadata, browser profile sync, Supabase Data API, RPC, edge function, or extension API. Client Admins may make approved company-scoped user-management changes for users in their own company, including role assignment among company roles and disabling another Client Admin.
- Applies to: Clerk, Supabase profiles, route guards, RLS, edge functions, extension API, Admin tooling, and QA.
- Why it matters: These fields determine tenant boundaries and role permissions.
- Implementation notes: Users may edit safe preferences only, such as display name, timezone, date format, and notification preferences, when those fields do not affect authorization. Client Admin company-user edits must go through an approved server path with company-scope checks.
- QA proof: Direct mutation attempts are denied; safe preference edits still work; Admin/server assignment path works and is audited; Client Admin can manage same-company users within allowed roles; Client Admin cannot grant themselves cross-company/domain authority.
- Open questions: Hone the self-service preference list over time if more non-authorization profile fields are added.

### Pending access users remain unassigned until approved
- Rule: Pending users should see that company access is awaiting approval, Client Admins should see same-domain access requests, and Admins should see public-email, unmatched-domain, related-domain, and stale-admin override requests. Denied users remain unassigned and cannot see company data.
- Applies to: Signup, pending access screens, Client Admin team management, Admin queues, RLS, QA, Product Ops, and Support.
- Why it matters: Pending and denied states must be clear without accidentally granting company visibility.
- Implementation notes: Build explicit pending, approved, denied, and unassigned states rather than inferring access from signup intent or metadata.
- QA proof: Pending user cannot see company data; Client Admin can view same-domain requests; Admin can view exception queues; denied user remains unassigned.
- Open questions: None for the first implementation pass.

### Authorization changes require audit events
- Rule: Every role, company, company-domain, Client Admin, disable/enable, approval, denial, and override action should create an audit event.
- Applies to: Admin tooling, Client Admin team management, profile bootstrap, company-domain aliases, RLS, QA, Security, Product Ops, and Support.
- Why it matters: Access changes affect tenant boundaries and future troubleshooting.
- Implementation notes: Audit events should record actor, target user, company, old value, new value, action reason or category, evidence type when applicable, and timestamp.
- QA proof: Each supported access-management path produces an audit event with the expected actor, target, action, and before/after context.
- Open questions: None for the first implementation pass.

## Specialist And Release Coordination

### Google Analytics is an approved source for specialist evidence
- Rule: Trusted Bums agents may use the Google Analytics property for `https://trustedbums.com` when their work requires website traffic, funnel, source, campaign, or engagement evidence.
- Applies to: Data/Analytics, B2B Growth, UX, UI, Product Ops, Trust & Reputation, Performance, QA, Release Verification, Lead Developer, `docs/*-backlog.md`, and `docs/agents/*`.
- Why it matters: GA gives the specialist team current website and acquisition evidence so recommendations can move beyond source-only assumptions.
- Implementation notes: The GA4 web stream is `Trusted Bums Web` with measurement ID `G-P6B5EYQMVN`; tracker item `TB-0066` records the setup. Agents should use aggregate GA evidence when relevant, cite dashboard/date-range context in Agent Inputs, and avoid placing raw visitor, user-level, private, or unnecessary campaign data in repo markdown. Google Analytics is optional product analytics and must stay tied to the site's Analytics consent category in product code.
- QA proof: GA currently shows data collection pending after stream creation; close `TB-0066` only after production deploy plus GA "data received" or comparable current reporting evidence proves live collection.
- Open questions: Which GA role/access path should each automation use once the deployed site starts collecting data?

### Bing Webmaster Tools is an approved source for search and reputation evidence
- Rule: Trusted Bums agents may use Bing Webmaster Tools for `https://trustedbums.com` when their work requires Bing search visibility, crawl, indexing, sitemap, SEO/GEO, backlink, keyword, or Microsoft-side reputation evidence.
- Applies to: Trust & Reputation, B2B Growth, Data/Analytics, Content, Marketing Graphics, UX, UI, Performance, QA, Release Verification, Lead Developer, `docs/*-backlog.md`, and `docs/agents/*`.
- Why it matters: Bing Webmaster Tools gives the team Microsoft search and crawl evidence that complements GA, public crawl checks, and domain-reputation review.
- Implementation notes: Tracker item `TB-0071` records the Bing setup. Bing has a site entry for `https://trustedbums.com/`, `index.html` includes the `msvalidate.01` verification tag, and `public/robots.txt` points Bingbot to `https://trustedbums.com/sitemap.xml`. Agents should use aggregate/report-level Bing evidence, cite dashboard/date-range/report context in Agent Inputs, and avoid placing private exports, credentials, or unnecessary query/campaign detail in repo markdown.
- QA proof: Bing currently shows the site as not verified after setup; close `TB-0071` only after production deploy exposes the verification tag and Bing Verify plus sitemap/dashboard checks succeed.
- Open questions: Which agent-safe Bing Webmaster access path should each automation use once verification succeeds?

### Agent findings must be tracked with TB IDs
- Rule: Any agent-created or agent-preserved recommendation, bug, release blocker, QA gap, security finding, access blocker, or implementation follow-up must have an Admin Tools Scrum Tracker item and a `TB-` tracking ID before the agent publishes its handoff.
- Applies to: All specialist agents, Lead Developer, Code Review, Release Verification, QA, Security, Product Ops, Trust & Reputation, Data, Performance, Accessibility, UX, UI, Content, Marketing Graphics, B2B Growth, Legal/Compliance, `docs/*-backlog.md`, `docs/lead-developer-recommendations.md`, and `/admin/scrum`.
- Why it matters: Scrum decisions need durable numbering so the team can discuss open work, bugs, blocked items, and closed evidence without relying on stale prose or chat history.
- Implementation notes: Agents should create or update `public.admin_scrum_items`, set `added_by_agent`, classify true defects as `item_type = BUG`, and keep `source_key` stable for git commits, GitHub runs, or backlog-section imports so repeated runs update instead of duplicating. Before opening a new item, agents should search existing open, blocked, fixed, and recently closed tracker rows by `source_key`, title, affected route/table/workflow, GitHub commit/run ID, backlog heading, and related `TB-` references. If one agent's best action is to add context to another agent's existing ticket, update that existing `TB-` item with the new evidence, affected agent, recommendation, or blocker instead of opening a duplicate. Handoffs should cite the returned or updated `TB-` number next to each open or closed item. Closed items need closure evidence or a waiver note; blocked items need the blocker named.
- QA proof: A scrum/backlog run can query the tracker and show every open agent item has a `TB-` number, status, priority, item type, owner, adding agent, and evidence/source reference.
- Open questions: Should future agent automation call a dedicated server-side tracker API instead of writing through Supabase MCP or the Admin UI?

### UI consultant visual evidence comes from GitHub Visual QA
- Rule: The UI consultant should use the GitHub Actions workflow named `Visual UI Audit` and its `visual-ui-audit` artifacts for visual QA evidence instead of attempting local Vite, local browser, or local Playwright visual checks.
- Applies to: Daily UI consultant automation, `docs/ui-optimization-backlog.md`, `docs/consultant-team-rules.md`, `.github/workflows/visual-ui-audit.yml`, and UI visual evidence collection.
- Why it matters: The GitHub workflow has the intended deployed target, role secrets, and artifact capture path, while local runs have repeatedly produced environment-specific blockers that weaken UI evidence.
- Implementation notes: UI recommendations may still use source inspection, current rules, internet guidance, and narrow non-visual local checks such as lint or unit tests when useful. Fresh screenshot or route-render evidence should come from GitHub Visual QA runs or be recorded as an access or evidence gap. When dispatching hosted visual QA, default the target URL to `https://trustedbums.com`; use `https://rcdl.tplinkdns.com` only when the run is explicitly validating fallback DNS or TLS behavior.
- QA proof: Agent Inputs should cite the relevant GitHub Visual QA run/artifact or explicitly state why GitHub Visual QA evidence was unavailable.
- Open questions: None.

### Release QA, E2E, and deep interaction QA run from GitHub
- Rule: Release QA should run from GitHub Actions. E2E, visual QA, and deep QA evidence should come from GitHub workflow logs and artifacts, with local `pnpm` or Playwright runs treated as developer preflight or reproduction evidence only.
- Applies to: `QA`, `E2E Smoke`, `Visual UI Audit`, `Deep QA Hotfix Audit`, QA/Test Engineer automation, QA Harness Reliability automation, Release Verification automation, Lead Developer release handoff, Code Review Agent post-main plans, and production deploy verification.
- Why it matters: GitHub has the intended CI runner, deployed target, repository secrets, role accounts, and artifact retention path. Local runs have repeatedly been affected by environment-specific blockers that weaken release evidence.
- Implementation notes: The `E2E Smoke` workflow should include public smoke, authenticated role smoke, portal interaction audit, and a non-optional deep workflow hotfix audit. Deep QA should verify every visible enabled button on every audited route is operable by actionability checks, click safe non-destructive controls, and route mutating/destructive controls through approved mutating deep-QA coverage when needed. If a Deep QA pass becomes broad or brittle, QA Harness Reliability should split it by route, role, or workflow instead of retrying the same monolithic path.
- QA proof: Release notes, QA backlogs, and post-main handoffs cite GitHub workflow run names, pass/fail status, artifact names, and skipped/missing-secret reasons. Local-only QA is explicitly labeled as preflight unless GitHub is unavailable.
- Open questions: None.

### RLS and authorization coverage are mandatory for new data workflows
- Rule: Any new or changed Supabase table, RLS policy, grant, RPC, edge-function data path, route guard, extension API, or role-scoped portal workflow must include explicit RLS/authorization coverage before it is treated as release-ready.
- Applies to: Lead Developer, Security Engineer, QA Test Engineer, QA Harness Reliability, Release Verification, Code Review Agent, Supabase migrations, portal APIs, edge functions, extension APIs, and mutating QA.
- Why it matters: Trusted Bums uses role and company boundaries as product trust boundaries. A change is unsafe if it either exposes data too broadly or blocks legitimate Client/Bum/Admin workflows through overly strict RLS.
- Implementation notes: Every access-sensitive change must document the expected allow/deny matrix for Admin, Client Admin, Client Finance, Client Member, Bum, and Public Visitor where relevant. Validate both sides: users can perform every approved workflow and cannot perform disallowed cross-role/cross-company actions. Test with the production auth token shape, because Clerk session tokens may evaluate under the `anon` database role while still carrying a signed-in `sub`. Avoid write patterns that require unnecessary `RETURNING` reads unless matching `USING` policies are proven. Prefer `return=minimal` for writes that do not need returned rows.
- QA proof: Include direct data-path checks, portal/API/extension checks where relevant, mutating workflow proof for critical Client/Bum/Admin paths, cleanup verification, and Supabase advisor/policy inspection after DDL changes.
- Open questions: Which role matrix should become the minimum reusable fixture set for every new table category?

### Specialist recommendations require cross-specialist impact review
- Rule: A recommendation from one specialist should be checked with other affected specialists before implementation when tradeoffs are likely.
- Applies to: Lead Developer, Security, UX, UI, QA, Data, Product Ops, Trust & Reputation, Content, Accessibility, and Performance.
- Why it matters: A security change can break usability; a UX change can harm accessibility; a data/export change can create privacy risk; a trust control can affect conversion.
- Implementation notes: Lead Developer should record affected specialists, tradeoffs, mitigation, and validation plan before promoting the recommendation.
- QA proof: Lead recommendations include cross-specialist dependencies and validation checks for material changes.
- Open questions: Should high-risk changes require explicit specialist signoff before Code Review Agent GO?

### Main pushes require post-main QA and rollback guidance
- Rule: After every successful push or merge to `main`, Lead Developer must run or trigger the broadest practical QA/release verification pass and recommend rollback, hotfix-forward, or hold-deploy if release-impacting checks fail.
- Applies to: Lead Developer, Release Verification, Code Review Agent, QA, Security, Trust & Reputation, Supabase, public website, and deployment workflows.
- Why it matters: The Code Review gate checks before merge, but production risk is only known after the merged/deployed system is verified.
- Implementation notes: Code Review Agent GO decisions should include a post-main QA plan. Lead Developer owns the post-main result and recovery recommendation.
- QA proof: Post-main validation results are recorded with pass/fail/skip reasons and rollback or hotfix triggers.
- Open questions: Which checks are mandatory for every main push versus scope-dependent?
