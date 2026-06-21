# Technical memo: Catalyst Signal Room

## Product and architecture

The product is an influence system, not a generic social dashboard. Its core object is the relationship between a piece of thinking, the people who engage with it, the accounts those people belong to, and what happens in pipeline afterward.

The ingestion boundary accepts the mixed Apify export and emits canonical posts, aliases, engagement events, and people. Canonical URL is the strongest post key; LinkedIn IDs are retained as aliases because reposts and scraper views can produce multiple activity IDs for one underlying post. Reaction/comment source IDs are unique keys, making replay safe.

Owned analytics and public identity stay separate. In production, Zernio supplies impressions, reach, clicks, views, and saves; Apify supplies public engagement plus who reacted or commented. The preferred join is LinkedIn post ID or canonical URL. The fallback is normalized content hash plus a narrow publish-time window. This avoids pretending Apify exposes owned impression data.

The intelligence services are adapters with deterministic fallbacks:

- OpenAI can classify each post into a configurable canonical taxonomy. The local analyzer keeps the demo useful without a key.
- Apollo resolves LinkedIn identity to role, seniority, department, and company. The demo resolver is seeded and labeled.
- ICP scoring is explainable: role, seniority, department, company size/industry/stage, target-list membership, and buying triggers contribute to a score; missing fields reduce confidence.
- HubSpot and Salesforce connectors share an opportunity boundary. Demo opportunities are seeded and never presented as live.

The two pages deliberately serve different jobs. The strategist view exposes evidence, uncertainty, comment queues, velocity, account signals, and recommendation rationale. The client view emphasizes progress, strategic direction, and the content-to-pipeline story without operational noise.

## Data model and scale

Historical state is first-class. `metric_snapshots` is a time-series table, not columns overwritten on `posts`. Engagement events, ICP scores, analysis runs, and attribution links also retain history. Model/taxonomy versions make past outputs reproducible.

Important constraints and indexes include:

- unique platform post IDs and canonical URLs per content account;
- unique provider reaction/comment IDs for replay-safe upserts;
- `(post_id, captured_at desc)` for post curves;
- account/time and person/time indexes for influence analysis;
- target-account partial index;
- idea/company/time indexes for repeated seeding;
- BRIN on append-heavy snapshot timestamps.

At 15M–50M rows, snapshots and engagement events should be time-partitioned. Raw events remain the audit trail, while incremental daily rollups serve dashboard queries. Hot raw data can stay in Postgres for roughly 90 days; older raw events move to object storage, with daily aggregates retained. Enrichment and analysis run in background queues with rate limits, retries, and dead-letter handling. Every list query uses cursor pagination.

## Learning loop and recommendations

Recommendations combine reach velocity, engagement rate, substantive-comment score, ICP-weighted engagement, target-account touches, repeated idea seeding, content taxonomy performance, timing, and pipeline influence. Evidence is attached to every recommendation so a strategist can reject the inference.

The loop improves in two ways. First, each new metric snapshot changes velocity and format/topic benchmarks. Second, strategist actions—accept, reject, rewrite, publish—and later performance become feedback labels. In production I would evaluate recommendation lift against a holdout baseline, not merely whether an idea was accepted.

ICP weights should be backtested against historical won, lost, and no-decision accounts. Optimize thresholds for useful precision/recall by segment, monitor drift, and preserve human overrides. A score is a prioritization tool, not truth.

## ROI and trust

Attribution has three explicit models:

- **Direct:** a known engager/contact has a defensible event-time path into an opportunity.
- **Influenced:** an account stakeholder engaged during the opportunity window.
- **Estimated:** account-level exposure is inferred from repeated stakeholder behavior.

The client should trust the view because the model, confidence, source mode, and explanation are visible. Idea seeding is framed as influence intelligence, never hard causation. In the demo, public engagement identity is observed; reach, enrichment, opportunity, and attribution data are labeled as seeded or estimated.

## Cost and failure points

The inexpensive work—normalization, rollups, rules, scoring, and most recommendations—belongs in code and SQL. Paying an LLM per reaction or metric row would be wasteful. Use an LLM once per new/changed post and optionally for recommendation synthesis after deterministic feature computation.

At moderate scale, the likely monthly costs are Postgres/Supabase, scraping, enrichment, and background compute; LLM analysis is a smaller line item because posts are low volume. Apollo-style enrichment is likely the first cost pressure, so cache permanently where terms allow, enrich only strategically valuable identities, and progressively fill missing fields. The first technical bottleneck is event-table query shape, solved with partitioning and rollups. The first product risk is false confidence in attribution, solved with model labels, time-aware evidence, and conservative language.
