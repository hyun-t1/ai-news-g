create extension if not exists pgcrypto;

create type interest_level as enum (
  'ignore',
  'hold',
  'reference',
  'interested',
  'breakthrough'
);

create type source_tier as enum ('priority', 'watchlist');

create table if not exists news_sources (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  domain text not null,
  channel text not null,
  tier source_tier not null default 'watchlist',
  rationale text,
  enabled boolean not null default true,
  repeat_score integer not null default 0,
  promoted_at timestamptz,
  demoted_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists news_items (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references news_sources(id) on delete cascade,
  external_id text,
  url text not null unique,
  title_original text not null,
  title_ko text,
  summary_original text,
  summary_ko text,
  language_code text not null default 'en',
  author_name text,
  published_at timestamptz not null,
  discovered_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  likes_count integer not null default 0,
  comments_count integer not null default 0,
  stars_count integer not null default 0,
  velocity_score numeric(10, 2) not null default 0,
  cross_signal_count integer not null default 0,
  tags text[] not null default '{}',
  recommendation_reason text,
  predicted_interest interest_level,
  predicted_interest_reason text
);

create unique index if not exists news_items_source_external_id_idx
on news_items (source_id, external_id)
where external_id is not null;

create table if not exists user_interest_current (
  id uuid primary key default gen_random_uuid(),
  news_item_id uuid not null unique references news_items(id) on delete cascade,
  interest_level interest_level not null,
  changed_at timestamptz not null default timezone('utc', now()),
  note text
);

create table if not exists user_interest_events (
  id uuid primary key default gen_random_uuid(),
  news_item_id uuid not null references news_items(id) on delete cascade,
  previous_level interest_level,
  next_level interest_level not null,
  changed_at timestamptz not null default timezone('utc', now()),
  changed_by text not null default 'solo-user',
  reason text
);

create table if not exists source_priority_events (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references news_sources(id) on delete cascade,
  previous_tier source_tier,
  next_tier source_tier not null,
  changed_at timestamptz not null default timezone('utc', now()),
  reason text
);

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists news_sources_set_updated_at on news_sources;
create trigger news_sources_set_updated_at
before update on news_sources
for each row
execute function set_updated_at();

drop trigger if exists news_items_set_updated_at on news_items;
create trigger news_items_set_updated_at
before update on news_items
for each row
execute function set_updated_at();

create or replace view news_feed_view as
select
  ni.id,
  ns.name as source_name,
  ns.slug as source_slug,
  ns.tier as source_tier,
  ni.url,
  ni.title_original,
  ni.title_ko,
  ni.summary_original,
  ni.summary_ko,
  ni.published_at,
  ni.updated_at,
  ni.likes_count,
  ni.comments_count,
  ni.stars_count,
  ni.velocity_score,
  ni.cross_signal_count,
  ni.tags,
  uic.interest_level as user_interest,
  uic.changed_at as interest_changed_at,
  ni.predicted_interest,
  ni.predicted_interest_reason
from news_items ni
join news_sources ns on ns.id = ni.source_id
left join user_interest_current uic on uic.news_item_id = ni.id
order by ni.updated_at desc;
