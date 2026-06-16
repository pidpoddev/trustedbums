export interface LegalSection {
  title: string;
  body: string[];
}

export interface LegalDocument {
  slug: string;
  title: string;
  description: string;
  effectiveDate: string;
  sections: LegalSection[];
}

const effectiveDate = "May 20, 2026";

export const legalDocuments: LegalDocument[] = [
  {
    slug: "privacy-policy",
    title: "Privacy Policy",
    description: "How Trusted Bums collects, uses, shares, and protects information in connection with the website, platform, and related services.",
    effectiveDate: "May 19, 2026",
    sections: [
      { title: "Information We Collect", body: ["We may collect information you provide directly to Trusted Bums, including your name, email address, company details, account information, submitted opportunities, communications, and other business information you choose to share through the platform."] },
      { title: "How We Use Information", body: ["We use information to operate the platform, provide account access, manage introductions and opportunities, communicate with users, monitor necessary service performance, improve our services, maintain security, and comply with legal obligations."] },
      { title: "How Information Is Shared", body: ["We may share information with service providers that help us run the platform, with authorized users inside your organization, and when required to protect rights, investigate misuse, or comply with law. We do not sell personal information."] },
      { title: "Data Retention", body: ["We retain information for as long as reasonably necessary to provide the service, maintain business records, resolve disputes, enforce agreements, and meet legal or operational requirements."] },
      { title: "Security", body: ["We use reasonable administrative, technical, and organizational safeguards designed to protect information. No system can be guaranteed perfectly secure, so users should also take care to protect their credentials and account access."] },
      { title: "Cookies, Local Storage, and Consent", body: ["Strictly necessary storage and lightweight performance monitoring are used for security, authentication, accessibility, service reliability, and remembering your consent choice. Optional product analytics, preferences, Microsoft Clarity interaction analytics, and marketing or engagement measurement are disabled unless you choose them. You can reject all optional categories as easily as accepting them, and you can change your choices at any time using the Privacy choices control."] },
      { title: "Your Choices and EU/UK Rights", body: ["Depending on your location, you may have rights to access, correct, delete, restrict, object to, or port personal data, and to withdraw consent where processing is based on consent. Withdrawing consent does not affect processing that occurred before withdrawal."] },
      { title: "Changes to This Policy", body: ["We may update this Privacy Policy from time to time. When we do, we will post the updated version on this page and revise the effective date below."] },
      { title: "Contact Us", body: ["If you have questions about this Privacy Policy, data rights, or consent choices, contact Trusted Bums at bums@trustedbums.com."] },
    ],
  },
  {
    slug: "terms-of-service",
    title: "Terms of Service",
    description: "General website and platform terms for visitors and account users.",
    effectiveDate,
    sections: [
      { title: "Use of the Service", body: ["Trusted Bums provides a business development platform for warm introductions, client opportunity workflows, Bum participation, meeting coordination, training assets, reporting, and related services.", "You may use the service only for lawful business purposes and only in accordance with these Terms, any applicable Client Agreement, Bum Agreement, Data Processing Addendum, and posted policies."] },
      { title: "Accounts and Access", body: ["You are responsible for maintaining the confidentiality of your account credentials and for activity under your account. You must provide accurate account information and promptly update it when it changes.", "Trusted Bums may approve, deny, suspend, or terminate access where necessary to protect the service, other users, customers, prospects, confidential information, or legal compliance."] },
      { title: "Acceptable Use", body: ["You may not use the service for unlawful outreach, spam, harassment, misleading relationship claims, scraping, credential sharing, security testing without permission, or activity that interferes with the service.", "You may not upload or share information you do not have the right to provide, including confidential third-party information, restricted employer information, or personal data collected without a valid business reason."] },
      { title: "Customer Targets, Introductions, and Content", body: ["Users are responsible for the accuracy and legality of customer target data, contact details, profile information, training materials, read-ahead assets, opportunity details, and communications submitted through the service.", "Trusted Bums may remove, restrict, or correct content that appears inaccurate, unlawful, confidentially improper, abusive, or inconsistent with platform rules."] },
      { title: "Commercial Terms", body: ["Commercial obligations, commissions, payouts, intro requests, disputes, invoicing, and client-specific terms are governed by the applicable Client Agreement, Bum Agreement, approved commission plan, opportunity record, or separate signed agreement.", "If these Terms conflict with a signed agreement or approved opportunity-specific commercial term, the more specific agreement controls for that opportunity or relationship."] },
      { title: "Confidentiality", body: ["Users may receive non-public business, customer, product, pricing, relationship, meeting, transcript, or strategy information. Users must protect that information and use it only for authorized platform purposes."] },
      { title: "Disclaimers and Limitation of Liability", body: ["The service is provided on an as-available basis. Trusted Bums does not guarantee meetings, introductions, customer responses, contracts, revenue, payout approval, or uninterrupted service.", "To the fullest extent permitted by law, Trusted Bums will not be liable for indirect, incidental, special, consequential, punitive, or lost-profit damages arising from use of the service."] },
      { title: "Changes", body: ["Trusted Bums may update these Terms from time to time. Material changes will be posted in the service or on the website. Continued use after an update means you accept the updated Terms."] },
      { title: "Contact", body: ["Questions about these Terms may be sent to bums@trustedbums.com."] },
    ],
  },
  {
    slug: "cookie-policy",
    title: "Cookie Policy",
    description: "How Trusted Bums uses cookies, local storage, and similar technologies.",
    effectiveDate,
    sections: [
      { title: "Overview", body: ["Trusted Bums uses cookies, local storage, performance beacons, and similar technologies to operate the website and platform, remember user choices, support authentication, improve reliability, and, where enabled, measure optional engagement."] },
      { title: "Categories", body: ["Strictly necessary storage and lightweight performance monitoring support security, login, routing, consent records, accessibility settings, core platform functionality, reliability, and troubleshooting.", "Preference storage remembers user choices such as display, accessibility, timezone, date format, or similar settings.", "Optional analytics and marketing storage, if enabled, may help us understand usage, improve content, review aggregate interaction patterns through tools such as Google Analytics and Microsoft Clarity, and measure communications. Optional categories can be rejected or changed through Privacy Choices."] },
      { title: "Managing Choices", body: ["You can use the Privacy Choices control to accept, reject, or customize optional categories. Strictly necessary storage remains active because the service cannot operate securely without it."] },
      { title: "Browser Controls", body: ["Most browsers allow you to block or delete cookies. Blocking necessary storage may prevent login, consent management, or portal features from working correctly."] },
    ],
  },
  {
    slug: "dpa",
    title: "Data Processing Addendum",
    description: "Processor terms for business customers that provide personal data to Trusted Bums.",
    effectiveDate,
    sections: [
      { title: "Scope and Roles", body: ["This Data Processing Addendum applies when Trusted Bums processes personal data on behalf of a client in connection with the service. The client is the controller or business, and Trusted Bums is the processor or service provider for that client personal data, except where Trusted Bums independently determines purposes and means for its own business operations."] },
      { title: "Processing Instructions", body: ["Trusted Bums will process client personal data only to provide, secure, support, maintain, improve, and document the service, to comply with law, and according to the client's documented instructions reflected in the applicable agreement and platform configuration."] },
      { title: "Types of Data", body: ["Processed data may include names, business contact details, company information, titles, relationship context, customer target details, meeting metadata, attendee details, transcript content, opportunity records, payment and commission records, support messages, audit logs, and related business communications."] },
      { title: "Security Measures", body: ["Trusted Bums will use reasonable administrative, technical, and organizational safeguards designed to protect personal data, including access controls, authentication, least-privilege practices, encryption in transit where supported, vendor controls, logging, backup and recovery practices, and personnel confidentiality expectations."] },
      { title: "Subprocessors", body: ["Trusted Bums may use subprocessors to provide hosting, authentication, database, communications, productivity, analytics, monitoring, and support services. Current subprocessors are listed on the Subprocessors page.", "Trusted Bums will remain responsible for subprocessors' processing of client personal data to the extent required by applicable data protection law and the applicable agreement."] },
      { title: "Assistance and Requests", body: ["Taking into account the nature of processing, Trusted Bums will provide reasonable assistance for data subject requests, security obligations, and data protection impact assessments where required and where the client cannot reasonably fulfill the request without Trusted Bums' help."] },
      { title: "Security Incidents", body: ["Trusted Bums will notify affected clients without undue delay after confirming a security incident involving client personal data, and will provide information reasonably available to help clients meet applicable obligations."] },
      { title: "Return or Deletion", body: ["Upon termination or written request, Trusted Bums will delete or return client personal data where reasonably possible, subject to legal, accounting, dispute, security, backup, and legitimate business retention requirements."] },
      { title: "International Transfers", body: ["Where required for cross-border transfers, the parties may rely on an applicable transfer mechanism such as standard contractual clauses or another lawful transfer basis."] },
    ],
  },
  {
    slug: "subprocessors",
    title: "Subprocessors",
    description: "Service providers used to operate Trusted Bums.",
    effectiveDate,
    sections: [
      { title: "Current Subprocessors", body: ["Supabase: database, storage, edge functions, authentication integration support, and application backend infrastructure.", "Clerk: user authentication, session management, identity, account metadata, and access controls.", "Microsoft: email, calendar, Teams meetings, Microsoft Graph, recording and transcription features where configured, Bing Webmaster Tools, and optional Microsoft Clarity analytics when enabled by consent.", "DreamHost: public website hosting and static application deployment.", "GitHub: source code hosting, deployment workflows, issue and operational history related to software delivery."] },
      { title: "Purpose", body: ["Subprocessors are used to host the service, authenticate users, send communications, schedule meetings, store operational data, maintain security, and support platform workflows."] },
      { title: "Updates", body: ["Trusted Bums may update this list as vendors change. Material changes will be reflected on this page or otherwise communicated where required by contract or law."] },
    ],
  },
  {
    slug: "security",
    title: "Security Overview",
    description: "A public summary of Trusted Bums security practices.",
    effectiveDate,
    sections: [
      { title: "Program Summary", body: ["Trusted Bums uses reasonable safeguards designed for a business development platform that handles account data, customer targets, meeting information, transcripts, client materials, payment records, and communications."] },
      { title: "Access Controls", body: ["Access is role-based for Admin, Client, and Bum users. Authentication is handled through a dedicated identity provider, and administrative tooling is limited to authorized users."] },
      { title: "Data Protection", body: ["The platform uses managed infrastructure providers for database, application, authentication, and communications services. Data is protected through provider-level controls, transport security where supported, database row-level security, application authorization checks, and operational logging."] },
      { title: "Operational Practices", body: ["Trusted Bums maintains code review, automated tests, deployment workflows, audit/event logs, and limited access to production systems. Security issues can be reported to bums@trustedbums.com."] },
      { title: "Customer Responsibilities", body: ["Customers and users are responsible for protecting credentials, limiting internal access, uploading only authorized content, and complying with their own confidentiality, employment, customer, and legal obligations."] },
    ],
  },
  {
    slug: "acceptable-use",
    title: "Acceptable Use Policy",
    description: "Rules for using Trusted Bums responsibly.",
    effectiveDate,
    sections: [
      { title: "Prohibited Uses", body: ["You may not use Trusted Bums to send spam, conduct unlawful outreach, harass people, misrepresent relationships, impersonate others, evade consent requirements, scrape data, compromise accounts, or interfere with service operations."] },
      { title: "Relationship Claims", body: ["Bums and users must describe relationships, influence, access, and context truthfully. Do not claim a warm path, relationship strength, authority, endorsement, or customer interest that you do not reasonably believe is accurate."] },
      { title: "Confidentiality and Rights", body: ["Do not upload, disclose, or use confidential information, employer information, customer data, personal data, trade secrets, or third-party materials unless you have the right to do so for the intended platform purpose."] },
      { title: "Enforcement", body: ["Trusted Bums may remove content, restrict workflows, suspend accounts, reject claims, cancel participation, or terminate access where activity appears inconsistent with this policy or creates risk for users, customers, prospects, or Trusted Bums."] },
    ],
  },
  {
    slug: "recording-transcription-notice",
    title: "Recording & Transcription Notice",
    description: "Notice about meeting recording, transcription, and read-ahead assets.",
    effectiveDate,
    sections: [
      { title: "Meeting Recording and Transcription", body: ["Trusted Bums may configure supported meetings to record and transcribe automatically or manually. Meeting platforms may also display their own recording or transcription notices to attendees.", "Participants should not join or remain in a recorded or transcribed meeting unless they consent to the recording and transcription or have confirmed that participation is permitted under applicable law and organizational policy."] },
      { title: "Use of Recordings and Transcripts", body: ["Recordings, transcripts, summaries, and meeting metadata may be used to support introductions, track opportunities, prepare read-aheads, resolve claims or disputes, document customer target activity, support training, improve the service, and maintain compliance records."] },
      { title: "Access", body: ["Access may be provided to authorized Admins, relevant Client users, relevant Bums, and service providers that support meeting, transcription, storage, or communication workflows. Access may vary by role, company, opportunity, claim, and meeting context."] },
      { title: "Sensitive Information", body: ["Participants should avoid sharing sensitive personal information, trade secrets, regulated data, or confidential third-party information unless necessary and authorized for the meeting purpose."] },
      { title: "Questions", body: ["Questions about recordings or transcripts may be sent to bums@trustedbums.com."] },
    ],
  },
  {
    slug: "data-retention",
    title: "Data Retention & Deletion Policy",
    description: "How long Trusted Bums keeps platform records.",
    effectiveDate,
    sections: [
      { title: "General Retention", body: ["Trusted Bums retains information for as long as reasonably necessary to provide the service, support users, maintain business records, calculate commissions, resolve disputes, enforce agreements, protect security, and comply with legal obligations."] },
      { title: "Typical Records", body: ["Account profiles, client records, Bum profiles, customer targets, opportunity registrations, claims, invoices, payment reports, audit logs, terms acceptances, support requests, communications, meeting metadata, transcripts, training materials, and read-ahead assets may be retained while relevant to the platform relationship and for a reasonable period afterward."] },
      { title: "Deletion Requests", body: ["Users or clients may request deletion by contacting bums@trustedbums.com. Some records may be retained where needed for legal, accounting, tax, security, fraud prevention, dispute, backup, audit, commission, or contractual reasons."] },
      { title: "Backups and Logs", body: ["Deleted data may persist temporarily in backups, logs, or archival systems until ordinary retention cycles complete, unless earlier deletion is technically feasible and legally appropriate."] },
    ],
  },
  {
    slug: "client-agreement",
    title: "Client Agreement",
    description: "Client Agreement terms for introductions, opportunity registration, commissions, and platform use.",
    effectiveDate,
    sections: [
      { title: "Client Agreement", body: ["The Client Agreement is the current Trusted Bums contract accepted in the Client Portal. It covers services, introduced accounts, opportunity registration, commission plans, Customer Payment Reports, non-circumvention, confidentiality, recording/transcription, and custom terms."] },
      { title: "Commission Plans", body: ["Commissions are defined and approved per project or opportunity. A default commission plan may be set for a client, but the approved project, opportunity, commission plan, or signed agreement controls the economics for the specific opportunity."] },
      { title: "Portal Record", body: ["The accepted portal version and any approved opportunity-specific commission plans should be reviewed inside the Client Portal. Contact bums@trustedbums.com for a copy or questions."] },
    ],
  },
  {
    slug: "client-agreement-faq",
    title: "Client Agreement FAQ",
    description: "Clause-by-clause context for legal reviewers evaluating the Trusted Bums Client Agreement.",
    effectiveDate,
    sections: [
      { title: "What is the purpose of this Client Agreement?", body: ["The agreement explains when Trusted Bums is helping the client create access, introductions, account strategy, and opportunity support, and when that support creates commission obligations. We use it so both sides can review the same rules before introductions begin."] },
      { title: "Why does the agreement say Trusted Bums creates commercial value?", body: ["The business model depends on introductions, relationship context, and account access that can materially improve a client's chance of reaching the right buyer. The statement makes clear that this support is valuable even though Trusted Bums does not sell or deliver the client's product."] },
      { title: "Why are opportunity registration rules broad?", body: ["Introductions often happen through the portal, email, meeting notes, or other written communications. The agreement allows registration through documented channels so the parties can preserve evidence of what was introduced, supported, or materially advanced without depending on one specific workflow."] },
      { title: "Why does \"Introduced Account\" include affiliates, subsidiaries, departments, and related opportunities?", body: ["Enterprise buying paths often move between business units, procurement entities, affiliates, successors, renewals, and expansions. The definition prevents a real introduced opportunity from falling outside the agreement only because the final contracting path changed."] },
      { title: "What if the client already knew the account?", body: ["The client should disclose any pre-existing active opportunity during registration or review. The parties can then decide whether Trusted Bums created new access, materially accelerated the opportunity, added a new relationship path, or should not receive commission rights for that account."] },
      { title: "Why are commissions based on amounts actually received?", body: ["This protects the client from paying on bookings that were not collected. Taxes, refunds, credits, chargebacks, and uncollected amounts are excluded because Trusted Bums is intended to participate in realized revenue, not gross theoretical value."] },
      { title: "Why do commissions apply to renewals, expansions, replacements, and successor arrangements?", body: ["A successful introduction can create a relationship that grows over time. The agreement keeps the original incentive aligned when revenue later appears through a related contract, renewed scope, renamed project, replacement agreement, or connected commercial arrangement."] },
      { title: "Why can a default commission plan be overridden?", body: ["Some clients need one standard plan, while specific accounts or enterprise deals may need custom economics. The agreement says the approved project, opportunity, assigned commission plan, or separate signed agreement controls the specific mechanics for that opportunity."] },
      { title: "Why does the agreement require payment reporting?", body: ["Trusted Bums needs enough information to calculate commissions owed after the client receives customer payments. The reporting obligation is limited to reasonable information needed for commission calculation, not a general audit right over unrelated client business."] },
      { title: "Why is there a non-circumvention clause?", body: ["Non-circumvention protects the core bargain: if Trusted Bums creates or materially advances an opportunity, the client should not avoid commissions by routing the business through another entity, delaying the transaction, renaming the project, or moving related work outside the documented path."] },
      { title: "Why does the client keep responsibility for products, pricing, proposals, contracts, and delivery?", body: ["Trusted Bums helps with business development support and introductions. The client controls its own offering and customer commitments, so the agreement makes clear that Trusted Bums is not responsible for the client's product performance, delivery, legal compliance, or customer success obligations."] },
      { title: "Why is confidentiality included?", body: ["Both sides may exchange non-public customer, pricing, strategy, product, relationship, and meeting information. The confidentiality language gives legal reviewers a simple baseline that each party must protect that information and use it only for the relationship."] },
      { title: "Why does the agreement say there is no guarantee?", body: ["Trusted Bums can create access and improve opportunity quality, but it cannot control customer decisions, procurement outcomes, deal timing, or revenue. The clause keeps expectations aligned and avoids treating business development support as a guaranteed result."] },
      { title: "Why do commission obligations survive termination?", body: ["Termination should stop future participation, but it should not erase obligations for introductions, registered opportunities, or supported relationships that already happened before termination and later produced related revenue."] },
      { title: "Why are meetings allowed to be recorded or transcribed?", body: ["Recordings, transcripts, summaries, and metadata can support opportunity tracking, claims, disputes, read-aheads, training, service improvement, and compliance records. The agreement puts the client on notice that its attendees must be authorized to participate and must satisfy any required consent or confidentiality obligations."] },
      { title: "Why is liability limited?", body: ["The limitation is intended to keep risk proportional to the commercial relationship. It excludes indirect and consequential damages and caps Trusted Bums' total liability at the amounts the client paid Trusted Bums during the twelve months before the claim."] },
      { title: "Why Delaware law?", body: ["Delaware law is a common commercial baseline for business contracts. The agreement also leaves room for a separate signed agreement to use a different governing law if the parties approve that change."] },
      { title: "Can the legal team negotiate custom terms?", body: ["Yes. The agreement expressly allows approved commission plans, account-specific terms, enterprise schedules, or separate written overrides. If an approved assigned commission plan or separate signed agreement conflicts with the standard Client Agreement, that more specific approved document controls for the relevant opportunity."] },
    ],
  },
  {
    slug: "bum-agreement",
    title: "Bum Agreement",
    description: "Bum terms for participation, confidentiality, conduct, and earnings eligibility.",
    effectiveDate,
    sections: [
      { title: "Bum Terms", body: ["The Bum Agreement is the current Trusted Bums Bum Agreement accepted in the Bum Portal. It covers the Bum role, accuracy, confidentiality, respectful conduct, platform rules, eligibility for earnings, compliance, termination, recording/transcription, and updates."] },
      { title: "No Guaranteed Compensation", body: ["Creating an account, proposing introductions, joining opportunities, or making introductions does not guarantee approval, compensation, payouts, or continued access to the platform. Earnings depend on the applicable opportunity rules, client payments, platform approval, dispute review, and tax or payout requirements."] },
      { title: "Portal Record", body: ["The accepted portal version should be reviewed inside the Bum Portal. Contact bums@trustedbums.com for a copy or questions."] },
    ],
  },
];

export const footerLegalLinks = [
  { to: "/privacy-policy", label: "Privacy Policy" },
  { to: "/legal/terms-of-service", label: "Terms of Service" },
  { to: "/legal/cookie-policy", label: "Cookie Policy" },
  { to: "/legal/dpa", label: "DPA" },
  { to: "/legal/subprocessors", label: "Subprocessors" },
  { to: "/legal/security", label: "Security" },
  { to: "/legal/acceptable-use", label: "Acceptable Use" },
  { to: "/legal/recording-transcription-notice", label: "Recording & Transcription" },
  { to: "/legal/data-retention", label: "Data Retention" },
  { to: "/legal/client-agreement", label: "Client Agreement" },
  { to: "/legal/client-agreement-faq", label: "Client Agreement FAQ" },
  { to: "/legal/bum-agreement", label: "Bum Agreement" },
];

export function getLegalDocument(slug: string | undefined) {
  return legalDocuments.find((document) => document.slug === slug);
}
