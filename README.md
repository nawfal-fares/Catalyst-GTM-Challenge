# Catalyst Market Intelligence

A high-fidelity product prototype for turning executive LinkedIn activity into
market learning and defensible content decisions.

The product has two views:

- `/strategist` — the working evidence and recommendation view for Catalyst
- `/client` — a concise readout for Will Leatherman

The root URL redirects to `/strategist`. There is no authentication, onboarding,
settings area, or active backend route.

## Product question

The prototype is designed to answer:

> What are we learning from the market?

It deliberately avoids treating engagement totals as the conclusion. Comments,
engager identity, repeated exposure, objections, and account patterns are used to
help a strategist decide what to investigate or publish next.

## Evidence layers

The interface keeps three layers visually separate:

| Layer | Meaning in this prototype |
|---|---|
| Observed | Posts, public totals, captured comments, reactions, actors, timestamps |
| Derived | Content analysis, substantive-comment rules, role mix, account grouping, recommendations |
| Seeded | Demo-only CRM opportunities, stages, values, and influence examples |

Confidence is shown alongside interpretation. A seeded opportunity is never
presented as a real opportunity, and an influence path is never described as
causation.

## Data method

`apify.json` is inspected programmatically. The checked-in normalization pipeline
deduplicates the 710 raw records into:

- 9 canonical LinkedIn entries (8 authored posts and 1 repost)
- 574 captured reaction identities
- 80 captured comment records
- 305 identifiable engagers

Public aggregate totals on the canonical entries are 595 reactions, 97 comments,
and 6 reposts. The difference between public totals and captured identity records
is stated in the UI.

The product analysis uses only five fields per post: topic, core idea, hook,
format, and audience.

## Run locally

Requirements: Node 22+ and npm.

```bash
npm install
npm run dev
```

Open:

- `http://localhost:3000/strategist`
- `http://localhost:3000/client`

Verification:

```bash
npm run check
```

## Important files

- `src/data/market-intelligence.ts` — evidence-backed product model and copy
- `src/app/strategist/page.tsx` — strategist decision-support view
- `src/app/client/page.tsx` — client interpretation view
- `src/components/dashboard/evidence-label.tsx` — evidence-layer system
- `src/components/dashboard/confidence-panel.tsx` — uncertainty framework
- `src/services/ingestion/apify-importer.ts` — source normalization

Local credentials remain in `.env.local` and are ignored by git.
