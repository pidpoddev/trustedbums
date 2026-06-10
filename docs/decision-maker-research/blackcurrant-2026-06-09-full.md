# BlackCurrant Decision-Maker Research Full Run

_Created: 2026-06-09 by Codex Decision-Maker Researcher._

## Summary

- Client: BlackCurrant.
- Service fit: Energy infrastructure design for AI and power-intensive data centers.
- Source boundary: Public web sources only. LinkedIn was not browsed, scraped, screenshotted, or used as an automated verification source.
- Import destination: `public.potential_decision_maker_matches`.
- Provenance: `source_label = 'Research Bot'`.
- Coverage after import: 81 of 81 BlackCurrant target accounts.
- Loaded matches after import: 117 total Research Bot records.
- Rating mix: 42 Priority A, 45 Priority B, 30 Watchlist.
- Verification queue: 27 records marked `NEEDS_VERIFICATION`.
- Route placeholders: 14 records have score `0` because public research did not confirm a named current owner; those rows exist to tell Bums what relationship path to look for, not whom to contact.

## Scoring Adjustment

This run applies the BlackCurrant-specific priority rule: energy leadership, data-center leaders, chief development officers, construction/design owners, power procurement owners, utility/grid owners, and infrastructure platform owners rank above generic CEO or COO contacts. CEO/COO contacts remain useful only when public evidence ties them directly to data-center development, power, or infrastructure delivery.

## Strongest Fit Patterns

- Direct energy/power owners: examples include Crusoe power infrastructure, Google data-center energy, Meta energy/sustainability, Related Digital energy, and Prologis energy leadership.
- Direct data-center development and delivery owners: examples include Applied Digital, Compass, DataVolt, Yondr, T5, Switch, Aligned, EdgeConneX, Digital Realty, and Vantage.
- Infrastructure platform sponsors: examples include Brookfield, DigitalBridge, GIP/BlackRock, IFM, KKR, GIC, OMERS, CPPIB, TPG, Apollo, Blue Owl, EQT, Stonepeak, and Principal.
- Route-only targets: where public sources did not confirm a named current owner, the database now stores a Watchlist route record so Bums can look for the right path without treating the row as a verified decision-maker.

## QA Notes

- Bums should see Potential DM matches on BlackCurrant opportunity detail pages when RLS allows the opportunity.
- Each row should show `Where this came from: Research Bot`.
- Source buttons should open public source URLs in a new tab/window.
- LinkedIn candidate links may appear only where a public-search URL was already captured; they remain manual candidates, not verified scraped facts.
- Watchlist rows with `NEEDS_VERIFICATION` should not be used for outreach until a human confirms the right current person or route.
