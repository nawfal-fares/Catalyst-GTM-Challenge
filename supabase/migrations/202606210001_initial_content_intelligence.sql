create extension if not exists pgcrypto;
create extension if not exists citext;
create extension if not exists vector;

create type public.connector_mode as enum ('live', 'seeded', 'estimated');
create type public.attribution_model as enum ('direct', 'influenced', 'estimated');
create type public.run_status as enum ('running', 'succeeded', 'failed', 'partial');

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  timezone text not null default 'America/New_York',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.content_accounts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  platform text not null,
  platform_account_id text not null,
  display_name text not null,
  profile_url text,
  connector_mode public.connector_mode not null default 'seeded',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (platform, platform_account_id)
);

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  external_id text,
  name text not null,
  domain citext,
  linkedin_url text,
  size_band text,
  industry text,
  geography text,
  company_stage text,
  target_account boolean not null default false,
  enrichment_mode public.connector_mode not null default 'seeded',
  enrichment_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_id, domain),
  unique (client_id, external_id)
);

create table public.people (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null,
  linkedin_id text,
  linkedin_url text,
  name text not null,
  headline text,
  role text,
  seniority text,
  department text,
  enrichment_mode public.connector_mode not null default 'seeded',
  enrichment_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_id, linkedin_id),
  unique (client_id, linkedin_url)
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  content_account_id uuid not null references public.content_accounts(id) on delete cascade,
  platform text not null,
  platform_post_id text not null,
  canonical_url text not null,
  author_name text,
  content text not null,
  content_hash text not null,
  published_at timestamptz not null,
  observed_reactions integer not null default 0 check (observed_reactions >= 0),
  observed_comments integer not null default 0 check (observed_comments >= 0),
  observed_reposts integer not null default 0 check (observed_reposts >= 0),
  latest_analysis jsonb,
  latest_analysis_run_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (platform, platform_post_id),
  unique (content_account_id, canonical_url)
);

create table public.post_source_aliases (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  source_record_id text not null,
  source_url text,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  unique (post_id, source_record_id)
);

create table public.post_media (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  media_type text not null,
  source_url text,
  storage_path text,
  width integer,
  height integer,
  position smallint not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  unique (post_id, position)
);

create table public.metric_snapshots (
  id bigint generated always as identity,
  client_id uuid not null references public.clients(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  captured_at timestamptz not null,
  impressions bigint,
  reach bigint,
  clicks bigint,
  views bigint,
  saves bigint,
  reactions bigint,
  comments bigint,
  reposts bigint,
  engagement_rate numeric(8,4),
  source text not null,
  connector_mode public.connector_mode not null,
  raw_payload jsonb not null default '{}'::jsonb,
  primary key (id, captured_at),
  unique (post_id, captured_at, source)
) partition by range (captured_at);

create table public.metric_snapshots_2026_q2
  partition of public.metric_snapshots
  for values from ('2026-04-01') to ('2026-07-01');

create table public.reactions (
  id bigint generated always as identity primary key,
  client_id uuid not null references public.clients(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  person_id uuid references public.people(id) on delete set null,
  platform_reaction_id text not null,
  reaction_type text not null,
  reacted_at timestamptz,
  observed_at timestamptz not null default now(),
  unique (client_id, platform_reaction_id)
);

create table public.comments (
  id bigint generated always as identity primary key,
  client_id uuid not null references public.clients(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  person_id uuid references public.people(id) on delete set null,
  platform_comment_id text not null,
  parent_comment_id bigint references public.comments(id) on delete cascade,
  commentary text not null,
  commented_at timestamptz,
  likes integer not null default 0,
  quality_score numeric(5,2),
  response_priority text,
  observed_at timestamptz not null default now(),
  unique (client_id, platform_comment_id)
);

create table public.icp_models (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  name text not null,
  version text not null,
  weights jsonb not null,
  thresholds jsonb not null,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  unique (client_id, version)
);

create table public.icp_scores (
  id bigint generated always as identity primary key,
  client_id uuid not null references public.clients(id) on delete cascade,
  icp_model_id uuid not null references public.icp_models(id),
  person_id uuid references public.people(id) on delete cascade,
  company_id uuid references public.companies(id) on delete cascade,
  score numeric(5,2) not null,
  confidence numeric(5,2) not null,
  tier text not null,
  reasons jsonb not null default '[]'::jsonb,
  missing_data jsonb not null default '[]'::jsonb,
  scored_at timestamptz not null default now(),
  human_override numeric(5,2),
  unique nulls not distinct (icp_model_id, person_id, company_id, scored_at)
);

create table public.ideas (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  canonical_text text not null,
  embedding vector(1536),
  taxonomy_version text not null,
  created_at timestamptz not null default now(),
  unique (client_id, canonical_text)
);

create table public.idea_seeding (
  id bigint generated always as identity primary key,
  client_id uuid not null references public.clients(id) on delete cascade,
  idea_id uuid not null references public.ideas(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  person_id uuid references public.people(id) on delete cascade,
  company_id uuid references public.companies(id) on delete cascade,
  event_type text not null,
  occurred_at timestamptz not null,
  strength numeric(5,2) not null default 1,
  unique nulls not distinct (idea_id, post_id, person_id, company_id, event_type, occurred_at)
);

create table public.opportunities (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  company_id uuid not null references public.companies(id),
  crm_provider text not null,
  crm_opportunity_id text not null,
  name text not null,
  stage text not null,
  amount numeric(14,2) not null,
  currency char(3) not null default 'USD',
  opened_at timestamptz,
  close_date date,
  connector_mode public.connector_mode not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_id, crm_provider, crm_opportunity_id)
);

create table public.attribution_links (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  person_id uuid references public.people(id) on delete set null,
  model public.attribution_model not null,
  confidence numeric(5,2) not null,
  explanation text not null,
  occurred_at timestamptz not null default now(),
  connector_mode public.connector_mode not null,
  unique nulls not distinct (opportunity_id, post_id, person_id, model)
);

create table public.recommendations (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  analysis_run_id uuid,
  source_key text not null,
  content_idea text not null,
  hook text not null,
  format text not null,
  angle text not null,
  evidence jsonb not null,
  expected_impact text not null,
  confidence numeric(5,2) not null,
  status text not null default 'proposed',
  generated_at timestamptz not null default now(),
  expires_at timestamptz,
  unique (client_id, source_key)
);

create table public.ingestion_runs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete cascade,
  source text not null,
  status public.run_status not null default 'running',
  cursor jsonb,
  stats jsonb not null default '{}'::jsonb,
  error text,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table public.analysis_runs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  status public.run_status not null default 'running',
  provider text not null,
  model text,
  taxonomy_version text not null,
  input_window tstzrange,
  stats jsonb not null default '{}'::jsonb,
  error text,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.posts
  add constraint posts_latest_analysis_run_fk
  foreign key (latest_analysis_run_id) references public.analysis_runs(id) on delete set null;

alter table public.recommendations
  add constraint recommendations_analysis_run_fk
  foreign key (analysis_run_id) references public.analysis_runs(id) on delete set null;

create index posts_client_published_idx on public.posts (client_id, published_at desc);
create index posts_account_published_idx on public.posts (content_account_id, published_at desc);
create index posts_content_hash_published_idx on public.posts (content_hash, published_at desc);
create index metric_snapshots_post_captured_idx on public.metric_snapshots (post_id, captured_at desc);
create index metric_snapshots_client_captured_brin on public.metric_snapshots using brin (captured_at);
create index reactions_post_observed_idx on public.reactions (post_id, observed_at desc);
create index reactions_person_observed_idx on public.reactions (person_id, observed_at desc) where person_id is not null;
create index comments_post_commented_idx on public.comments (post_id, commented_at desc);
create index comments_priority_idx on public.comments (client_id, response_priority, quality_score desc);
create index people_company_idx on public.people (company_id) where company_id is not null;
create index companies_target_idx on public.companies (client_id, target_account) where target_account;
create index icp_scores_person_latest_idx on public.icp_scores (person_id, scored_at desc);
create index icp_scores_company_latest_idx on public.icp_scores (company_id, scored_at desc);
create index idea_seeding_company_time_idx on public.idea_seeding (company_id, occurred_at desc);
create index idea_seeding_idea_company_idx on public.idea_seeding (idea_id, company_id);
create index opportunities_company_stage_idx on public.opportunities (company_id, stage);
create index attribution_opportunity_idx on public.attribution_links (opportunity_id);
create index attribution_post_idx on public.attribution_links (post_id);
create index recommendations_client_generated_idx on public.recommendations (client_id, generated_at desc);

alter table public.clients enable row level security;
alter table public.content_accounts enable row level security;
alter table public.companies enable row level security;
alter table public.people enable row level security;
alter table public.posts enable row level security;
alter table public.post_source_aliases enable row level security;
alter table public.post_media enable row level security;
alter table public.metric_snapshots enable row level security;
alter table public.reactions enable row level security;
alter table public.comments enable row level security;
alter table public.icp_models enable row level security;
alter table public.icp_scores enable row level security;
alter table public.ideas enable row level security;
alter table public.idea_seeding enable row level security;
alter table public.opportunities enable row level security;
alter table public.attribution_links enable row level security;
alter table public.recommendations enable row level security;
alter table public.ingestion_runs enable row level security;
alter table public.analysis_runs enable row level security;

comment on table public.metric_snapshots is
  'Partition monthly or quarterly at scale. Keep raw snapshots hot for 90 days, daily rollups for two years, then archive to object storage.';
comment on table public.reactions is
  'At 15M–50M rows, range-partition by observed_at, ingest with idempotent upserts, and serve UI from account/day rollups rather than full scans.';
comment on table public.idea_seeding is
  'Influence signal, not proof of causation. Multiple stakeholders engaging with one canonical idea raises account-level strength.';
