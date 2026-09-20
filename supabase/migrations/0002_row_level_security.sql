-- ---------------------------------------------------------------------------
-- 0002_row_level_security
--
-- Security model, in one sentence: the anon key may read published portfolio
-- content and nothing else; every write goes through the service role, which
-- only ever exists on the server.
--
-- Two things worth being explicit about:
--
--   1. RLS must be enabled on every table in an exposed schema. A table with
--      RLS off is readable *and writable* by anyone holding the anon key,
--      which is a public value shipped in the browser bundle. Forgetting one
--      table is the whole vulnerability.
--
--   2. No write policies are defined at all. The service role bypasses RLS by
--      design, so writes work from the server without granting anon any path
--      to them. "No policy" is the correct way to express "never".
-- ---------------------------------------------------------------------------

alter table public.profiles             enable row level security;
alter table public.technologies         enable row level security;
alter table public.projects             enable row level security;
alter table public.project_technologies enable row level security;
alter table public.experiences          enable row level security;
alter table public.social_links         enable row level security;
alter table public.portfolio_settings   enable row level security;

-- Force RLS even for the table owner, so a future migration running as the
-- owner cannot quietly read around the policies.
alter table public.profiles             force row level security;
alter table public.technologies         force row level security;
alter table public.projects             force row level security;
alter table public.project_technologies force row level security;
alter table public.experiences          force row level security;
alter table public.social_links         force row level security;
alter table public.portfolio_settings   force row level security;

-- ---------------------------------------------------------------------------
-- Read policies
--
-- Scoped to `anon` and `authenticated` explicitly rather than `public`, so the
-- grant is legible: these are the two roles that reach the database through
-- the publishable key.
-- ---------------------------------------------------------------------------

drop policy if exists "Public can read the active profile" on public.profiles;
create policy "Public can read the active profile"
  on public.profiles
  for select
  to anon, authenticated
  using (is_active);

drop policy if exists "Public can read technologies" on public.technologies;
create policy "Public can read technologies"
  on public.technologies
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Public can read projects" on public.projects;
create policy "Public can read projects"
  on public.projects
  for select
  to anon, authenticated
  using (true);

-- The join table is only reachable alongside a project the caller may already
-- read, so an unconditional select here grants nothing extra.
drop policy if exists "Public can read project technologies" on public.project_technologies;
create policy "Public can read project technologies"
  on public.project_technologies
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Public can read experiences" on public.experiences;
create policy "Public can read experiences"
  on public.experiences
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Public can read visible social links" on public.social_links;
create policy "Public can read visible social links"
  on public.social_links
  for select
  to anon, authenticated
  using (is_visible);

drop policy if exists "Public can read settings" on public.portfolio_settings;
create policy "Public can read settings"
  on public.portfolio_settings
  for select
  to anon, authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- Write access
--
-- Intentionally absent. INSERT, UPDATE and DELETE have no policy for anon or
-- authenticated, so RLS denies them. The service role bypasses RLS entirely
-- and is the only way content changes.
-- ---------------------------------------------------------------------------
