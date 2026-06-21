# Catalyst Signal Room

A GTM content intelligence platform built for Catalyst’s technical challenge. It turns Will Leatherman’s scraped LinkedIn activity into a production-shaped loop:

`content → reach → engagement identity → ICP fit → idea seeding → account influence → pipeline influence → recommendations`

Public pages:

- `/strategist` — the working view for Catalyst’s internal content team
- `/client` — a cleaner executive readout for Will / the client

The app runs with deterministic demo data and no login. It is deliberately explicit about what is observed, seeded, estimated, or ready for a live connector.

## Run it

Requirements: Node 22+ and npm.

```bash
npm install
cp .env.example .env.local
npm run data:generate
npm run dev
```

Open `http://localhost:3000/strategist` or `http://localhost:3000/client`.

Verification:

```bash
npm run check
```

## What is real vs. modeled

| Layer | Demo behavior | Production boundary |
|---|---|---|
| LinkedIn / Apify | Real supplied posts, reactions, comments | Scheduled Apify actor/export ingestion |
| Normalization | Real parser, canonical URL merging, ID aliases, idempotent keys | Same importer, persisted with natural-key upserts |
| Reach analytics | Realistic seeded time-series snapshots | Zernio adapter for owned impressions, reach, clicks, views, saves |
| Content analysis | Deterministic structured taxonomy | OpenAI structured-output adapter when `OPENAI_API_KEY` exists |
| Enrichment | Seeded, deterministic Apollo-shaped records | Apollo People Match + organization enrichment |
| ICP scoring | Explainable weighted service with confidence and missing data | Backtested model versions plus human overrides |
| CRM / pipeline | Seeded HubSpot-shaped opportunities | HubSpot or Salesforce OAuth connectors |
| Attribution | Labeled direct, influenced, and estimated examples | Contact/account/opportunity event-time joins |

No UI copy claims that a mocked connector is live.

## Data ingestion

`npm run data:generate` reads `apify.json` in code; the full export is never used as prompt context. The importer:

1. validates the mixed record array;
2. separates posts, reactions, and comments;
3. canonicalizes LinkedIn URLs;
4. merges duplicate post records while preserving source aliases;
5. deduplicates reactions and comments on source IDs;
6. resolves actors into people;
7. runs enrichment, ICP scoring, analysis, metrics, idea seeding, CRM attribution, and recommendations;
8. writes a deterministic deployable snapshot to `src/data/demo-dataset.json`.

The supplied export contains 710 records. It normalizes to 9 canonical posts, 574 unique reactions, 80 unique comments, and 305 people; 47 duplicate records are merged. Re-running the importer produces identical IDs and no duplicate entities.

## Architecture

```text
apify.json
  └─ Apify importer
      ├─ canonical posts + aliases
      ├─ people / reactions / comments
      └─ enrichment boundary
           ├─ content analyzer
           ├─ Zernio analytics adapter
           ├─ Apollo resolver
           ├─ ICP scoring
           ├─ idea-seeding graph
           ├─ CRM + attribution
           └─ recommendation engine
                ├─ static demo repository
                └─ Supabase warehouse adapter
```

Key code:

- `src/services/ingestion/apify-importer.ts`
- `src/services/pipeline/build-dataset.ts`
- `src/services/analysis/content-analyzer.ts`
- `src/services/scoring/icp-engine.ts`
- `src/services/intelligence/idea-seeding.ts`
- `src/services/intelligence/recommendations.ts`
- `src/services/persistence/supabase-warehouse.ts`
- `supabase/migrations/202606210001_initial_content_intelligence.sql`

## Scheduling

Vercel cron calls `/api/cron/sync` every two hours. The refresh policy is:

- posts under 48 hours: every 2–4 hours during US working hours;
- posts 2–14 days old: daily;
- older posts: weekly.

The demo endpoint performs a labeled dry run without `SUPABASE_SERVICE_ROLE_KEY`. With a service role key it uses the server-only Supabase warehouse. Protect production cron with `CRON_SECRET`.

## Database and scale

The migration uses relational entities rather than a dashboard-shaped flat table: clients, content accounts, posts, aliases, media, metric snapshots, reactions, comments, people, companies, ICP models/scores, ideas, idea-seeding events, opportunities, attribution links, recommendations, and run history.

At 15M–50M event rows:

- range-partition snapshots and eventually reactions/comments by time;
- keep `(post_id, captured_at desc)`, account/time, person/time, and source-ID uniqueness indexes;
- use BRIN on append-heavy timestamps;
- upsert by provider IDs and canonical aliases;
- serve dashboards from daily account/post rollups, not event scans;
- use cursor pagination and background jobs for enrichment/analysis;
- keep 90 days of raw snapshots hot, daily rollups for two years, archive older raw events to object storage;
- version analysis and ICP models so historical results remain reproducible.

## Security

- `.env`, `.env.local`, `credentials.md`, and key/certificate files are ignored.
- Supabase service role, Apollo, OpenAI, and CRM credentials are server-only.
- The supplied credential file was moved to local env configuration and deleted before Git initialization.
- The UI and generated demo data contain no credentials.

Run a final secret audit before pushing:

```bash
git grep -nEi '(service_role|github_pat_|ghp_|sk-[A-Za-z0-9])' -- ':!package-lock.json'
```

## Tests

Tests cover the highest-leverage behavior:

- duplicate URL and activity-ID normalization;
- repeatable/idempotent imports;
- ICP tiering and uncertainty;
- age-based refresh cadence.

See [MEMO.md](./MEMO.md) for architecture, ROI framing, scale, and cost decisions.
