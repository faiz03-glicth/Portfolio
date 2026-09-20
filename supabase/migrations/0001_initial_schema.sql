-- ---------------------------------------------------------------------------
-- 0001_initial_schema
--
-- Portfolio content schema.
--
-- Design notes:
--   * Every table carries created_at/updated_at, maintained by a trigger rather
--     than by the application, so a manual edit in the Supabase console cannot
--     leave a stale timestamp behind.
--   * Enumerated values are CHECK constraints rather than Postgres enum types.
--     Adding a value to an enum type needs ALTER TYPE and extra care inside a
--     transaction; widening a CHECK is a one-line migration.
--   * Ordering is explicit (sort_order) rather than implied by insertion order,
--     because "whatever the database returns" is not an ordering.
-- ---------------------------------------------------------------------------

-- Keeps updated_at honest without relying on the application to set it.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles
--
-- Expected to hold exactly one live row. `is_active` picks which one that is,
-- so a draft can be staged without deleting the current profile.
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  headline    text not null,
  summary     text not null,
  bio         text[] not null default '{}',
  avatar_url  text,
  location    text not null,
  website_url text,
  email       text not null,
  resume_url  text,

  availability_status text not null default 'open'
    check (availability_status in ('open', 'selective', 'unavailable')),
  availability_label text not null default 'Open to opportunities',

  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- At most one active profile, enforced by the database rather than by hope.
create unique index if not exists profiles_single_active_idx
  on public.profiles (is_active)
  where is_active;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- technologies
--
-- Text primary keys (e.g. 'typescript'). They are stable, human-readable in a
-- join table, and match the IDs the application already uses.
-- ---------------------------------------------------------------------------
create table if not exists public.technologies (
  id         text primary key,
  name       text not null,
  category   text not null
    check (category in (
      'languages', 'frameworks', 'backend', 'database',
      'devops', 'cloud', 'tools', 'other'
    )),
  icon       text,
  is_primary boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists technologies_category_idx
  on public.technologies (category, sort_order);

drop trigger if exists technologies_set_updated_at on public.technologies;
create trigger technologies_set_updated_at
  before update on public.technologies
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- projects
-- ---------------------------------------------------------------------------
create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  title       text not null,
  description text not null,
  overview    text[] not null default '{}',
  highlights  text[] not null default '{}',
  image_url   text,
  github_url  text,
  gitlab_url  text,
  live_url    text,

  featured boolean not null default false,
  type     text not null default 'web-app'
    check (type in ('web-app', 'api', 'library', 'tool', 'data', 'mobile')),
  status   text not null default 'shipped'
    check (status in ('shipped', 'in-progress', 'archived', 'concept')),

  start_date date not null,
  end_date   date,

  primary_language text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- An end date before the start date is always a data-entry mistake.
  constraint projects_date_order
    check (end_date is null or end_date >= start_date)
);

create index if not exists projects_featured_idx
  on public.projects (sort_order desc)
  where featured;

create index if not exists projects_listing_idx
  on public.projects (sort_order desc, start_date desc);

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- project_technologies (join table)
--
-- Cascade on both sides: deleting a project or a technology must not leave
-- orphaned join rows behind.
-- ---------------------------------------------------------------------------
create table if not exists public.project_technologies (
  project_id    uuid not null references public.projects (id) on delete cascade,
  technology_id text not null references public.technologies (id) on delete cascade,
  sort_order    integer not null default 0,
  primary key (project_id, technology_id)
);

create index if not exists project_technologies_technology_idx
  on public.project_technologies (technology_id);

-- ---------------------------------------------------------------------------
-- experiences
-- ---------------------------------------------------------------------------
create table if not exists public.experiences (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  company      text not null,
  company_url  text,
  location     text,
  kind         text not null default 'work'
    check (kind in ('work', 'education', 'project', 'volunteer')),
  description  text not null,
  achievements text[] not null default '{}',
  technologies text[] not null default '{}',

  start_date date not null,
  end_date   date,
  is_current boolean not null default false,
  sort_order integer not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint experiences_date_order
    check (end_date is null or end_date >= start_date),

  -- A current role cannot also have ended.
  constraint experiences_current_has_no_end
    check (not is_current or end_date is null)
);

create index if not exists experiences_order_idx
  on public.experiences (sort_order desc, start_date desc);

drop trigger if exists experiences_set_updated_at on public.experiences;
create trigger experiences_set_updated_at
  before update on public.experiences
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- social_links
-- ---------------------------------------------------------------------------
create table if not exists public.social_links (
  id         text primary key,
  platform   text not null
    check (platform in ('github', 'gitlab', 'linkedin', 'email', 'spotify', 'x')),
  label      text not null,
  url        text not null,
  handle     text,
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists social_links_visible_idx
  on public.social_links (sort_order)
  where is_visible;

drop trigger if exists social_links_set_updated_at on public.social_links;
create trigger social_links_set_updated_at
  before update on public.social_links
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- portfolio_settings
--
-- Single-row-per-key store for values that should be editable without a
-- deploy. Deliberately not a place for secrets: everything here is readable
-- by anonymous visitors under the RLS policy in 0002.
-- ---------------------------------------------------------------------------
create table if not exists public.portfolio_settings (
  key         text primary key,
  value       jsonb not null,
  description text,
  updated_at  timestamptz not null default now()
);

drop trigger if exists portfolio_settings_set_updated_at on public.portfolio_settings;
create trigger portfolio_settings_set_updated_at
  before update on public.portfolio_settings
  for each row execute function public.set_updated_at();
