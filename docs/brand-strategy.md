# Trusted Bums Brand Strategy

_Last updated: 2026-06-04 by Codex._

## Brand Core

Trusted Bums is a high-trust B2B warm-introduction marketplace. The brand turns hard-to-reach buyers into warm conversations through credible human relationships.

The name is intentionally playful, but the business must feel serious, secure, and commercially disciplined. The brand should never look like an affiliate scheme, lead farm, spray-and-pray sales tool, gimmick, or casual side hustle.

## Positioning

### Primary Position
Trusted Bums helps revenue teams reach strategic accounts through people those buyers already trust.

### Short Explanation
Cold outreach gets ignored. Trusted Bums finds credible relationship paths into the accounts that matter, aligns incentives around real revenue, and gives clients and Bums a structured portal to manage introductions, claims, training, and payouts.

### Differentiators
- Trust before volume: The product is about credible access, not more messages.
- Hard accounts first: The best use case is guarded buyers and strategic target accounts.
- Human route, structured workflow: The intro is personal; the operations are tracked.
- Outcome-aligned economics: Revenue success matters more than activity theater.
- Playful name, serious execution: The brand can be memorable without becoming unserious.

## Audience Priorities

### Buyers And Client Admins
- Need to believe Trusted Bums is credible, controlled, and worth trusting with target-account strategy.
- Care about hard accounts, buyer access, confidentiality, workflow visibility, and commission alignment.
- Avoid language that sounds like spam, growth hacking, lead scraping, or outsourced appointment setting.

### Client Finance Users
- Need clarity, auditability, and trustworthy payout logic.
- Care about commissions, approvals, evidence, payment timing, and record quality.
- Use direct, operational language.

### Active Bums
- Need to understand that relationships are valuable assets and that the platform protects their participation in approved opportunities.
- Care about claims, opportunities, training, relationship context, and transparent payout tracking.
- Keep the brand proud and practical, not cute at the expense of earning credibility.

### Bum Candidates
- Need to see that becoming a Bum is selective, relationship-led, and commercially meaningful.
- Avoid awkward recruiting language such as `prospected` or vague hype about monetizing friends.

## Message Architecture

### Master Message
Your buyer is ignoring strangers. Good thing we know a friend.

### Support Messages
- Cold outreach gets buried.
- Trust opens the side door.
- Relationship-led revenue beats stranger-led volume.
- Bring us the accounts your team cannot crack.
- Access alignment, not appointment setting.
- The name is playful. The access is not.

### Proof Themes
- Hard accounts, not easy volume.
- Warm routes into guarded buyers.
- Commission-based outcomes.
- Structured client and Bum workflows.
- Training, approvals, claims, and payout visibility.

### Words To Use
- Trusted introduction
- Warm introduction
- Relationship-led revenue
- Hard account
- Target account
- Credible route
- Buyer access
- Client
- Bum
- Claim
- Bum Intro Request
- Customer Lead
- Client Prospect
- Bum candidate
- Commission-aligned

### Words And Patterns To Avoid
- Lead farm
- Growth hack
- Viral
- Guaranteed meetings
- Guaranteed revenue
- Easy money
- Passive income
- Monetize your friends
- Spray and pray
- Any claim implying customer logos, partner status, security guarantees, legal approval, or financial outcomes without approved evidence

## Voice

Trusted Bums should sound sharp, plain-spoken, commercially mature, and occasionally wry. The voice can use the humor of the brand name, but should land the joke quickly and return to trust, access, revenue, and operating discipline.

### Voice Principles
- Be direct: Say what the user can do and why it matters.
- Be specific: Prefer `hard accounts` and `warm introductions` over broad `growth`.
- Be credible: Avoid inflated claims and consultant buzzwords in customer-facing copy.
- Be human: The product is about real relationships, not automation theater.
- Be controlled: Especially in finance, legal, security, and admin contexts.

### Copy Pattern
Use contrast:

1. State the failure of cold, generic outreach.
2. Show the trusted relationship route.
3. Explain the structured marketplace workflow.
4. Tie the outcome to real revenue or accountable operations.

Example:

`Cold outreach gets buried. Trusted Bums finds the credible relationship path into the account and gives your team a structured way to manage the introduction, terms, and outcome.`

## Visual Identity

### Current Source Assets
- Logo mark: `public/logo-mark.svg`
- Horizontal logos: `public/logo-horizontal-light.svg`, `public/logo-horizontal-dark.svg`
- Public narrative visuals: `public/brand-blocked-inbox.svg`, `public/brand-trust-connector.svg`, `public/brand-revenue-loop.svg`
- Open graph image: `public/og-image.svg`
- Public homepage: `src/pages/Index.tsx`
- Design tokens: `src/index.css`, `tailwind.config.ts`

### Color System

Use the existing product tokens as the brand base.

| Role | Token/source | Approx color | Use |
| --- | --- | --- | --- |
| Deep ink | `#08111f`, `--foreground`, dark sections | Navy black | Primary trust background, headers, premium campaign fields |
| Warm cream | `#fff8ef`, `--background` family | Cream | Logo field, calm page background, human warmth |
| Action orange | `#ff7a1a`, `--primary` | Orange | CTAs, highlights, active states, campaign focal points |
| Trust teal | `#178b83`, `--accent` | Teal | Secondary signal, relationship bridge, supporting proof |
| Soft border | `#eadbc9`, `--border` family | Sand line | Dividers, low-noise frames |
| White | `#ffffff` | White | Copy on dark fields and clean cards |

### Palette Rules
- Lead with deep ink, warm cream, and action orange.
- Use teal as a supporting trust signal, not the primary campaign color.
- Avoid one-note orange or beige campaigns. Always include enough ink, cream, or teal to preserve contrast and credibility.
- Avoid dominant purple, neon AI gradients, generic blue SaaS palettes, or brown/espresso looks.
- Preserve accessibility contrast for all text overlays.

### Typography
- Display: Space Grotesk, heavy weights for headlines and short proof labels.
- Body: Inter, regular and medium weights for explanatory copy.
- Use tight but readable headline rhythm. Do not use negative letter spacing in new UI work unless already inherited from the current homepage.
- In marketing graphics, keep headline copy short enough to survive mobile social crops.

### Logo Use
- Use `Trusted Bums` exactly. Never render it as generated bitmap text.
- Prefer the approved SVG logo mark or the React `BrandLogo` pattern.
- Keep enough clear space around the mark for it to read as a serious company logo.
- Do not place the logo on cluttered generated imagery.
- Do not distort, recolor, rotate, add effects to, or redraw the logo unless a brand owner approves a new asset.

## Imagery Direction

### Core Motifs
- Blocked inbox or crowded outreach environment
- Trusted connector bridging two parties
- Relationship map or warm route into an account
- Revenue loop or outcome alignment
- Strategic account door, calendar, or decision-maker access
- Human relationship signal without cheesy handshake stock

### Composition Rules
- Use strong dark or cream fields with one clear focal point.
- Keep generated visuals mostly text-free.
- Add campaign copy as editable overlays after image generation.
- Make the human relationship obvious but not staged or sentimental.
- Use diagrams and stylized systems when they explain the marketplace better than photography.

### Avoid
- Generic handshake photos
- Generic happy sales team stock
- Fake dashboards with illegible UI text
- AI robot, neon brain, circuit-board, or magic-sparkle imagery
- Crowded collage art with unreadable text
- Meme-first creative unless Ryan explicitly asks for that campaign

## Campaign Graphic System

### Primary Formats
- Paid social square: `1:1`
- Paid social portrait: `4:5`
- LinkedIn or social wide: `1.91:1`
- Email header or landing-page support: `16:9`
- Story/reel frame if needed: `9:16`

### Production Pattern
1. Generate or assemble a text-free visual field.
2. Place the approved logo as SVG/vector or site-rendered text.
3. Place headline, support copy, and CTA as editable text.
4. Run visual QA across desktop and mobile crops.
5. Run spelling QA for every visible character.
6. Mark the asset `APPROVED`, `NEEDS_REGEN`, or `REJECTED` in `docs/marketing-graphics-campaign-backlog.md`.

### Default Campaign Layouts
- Dark field with orange headline emphasis and cream body copy.
- Cream field with ink headline, orange action mark, and teal relationship path.
- Split narrative sequence using the three existing motifs: blocked inbox, trusted connector, revenue loop.
- Diagram-style route from client target account to Bum relationship to buyer conversation.

## Visual QA Standard

AI-generated text is not approved by default. Any image with visible letters, numbers, pseudo-text, logos, signs, badges, UI labels, or handwritten marks must be inspected before campaign use.

### Pass Criteria
- `Trusted Bums` is spelled exactly.
- No gibberish, pseudo-words, malformed letters, fake signatures, fake badges, or broken UI labels appear.
- Any visible copy matches the approved editable overlay.
- The logo is an approved asset, not a generated approximation.
- Text is legible at intended crop sizes.
- Contrast passes normal visual inspection and should be checked with tooling when possible.
- The visual does not imply unapproved guarantees, customer names, testimonials, logos, certifications, or partner status.

### Reject Criteria
- Misspelled or distorted brand text
- Generated pseudo-text where the viewer may expect real information
- Cropped, warped, or unreadable words
- Fake customer logos or fake certification badges
- Misleading claims about outcomes, security, legality, or partnerships
- Any asset that cannot be confidently inspected

## Consistency Checklist

Before shipping a page, campaign, graphic, deck, ad, or email:

- Does it support warm introductions, trusted access, or relationship-led revenue?
- Does it make Trusted Bums feel credible enough for B2B buyers?
- Is the brand name spelled exactly and rendered from approved assets or editable text?
- Is the tone sharp and serious, with humor controlled?
- Are orange and teal used with enough ink or cream contrast?
- Does the layout avoid generic SaaS, generic stock, and fake dashboard tropes?
- Are claims evidence-backed and legal-safe?
- Has generated image text passed spelling-aware visual QA?

## Open Brand Inputs Needed

- Approved logo clear-space and minimum-size rules
- Final campaign typography rules for non-web tools
- Brand examples that Ryan likes and dislikes
- Paid-channel priorities and ad-account specs
- Legal-approved claims and disclaimers
- Customer-proof policy for testimonials, logos, and case-study visuals
- Approved recruiting language for Bum candidates
