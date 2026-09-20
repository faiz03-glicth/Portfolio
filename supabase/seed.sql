-- ---------------------------------------------------------------------------
-- seed.sql
--
-- Mirrors the placeholder content in src/data/ so a fresh database renders the
-- same site the static branch does. Run it after the migrations.
--
-- Every statement is idempotent (upsert or guarded delete), so re-running this
-- file is safe and will not accumulate duplicate rows.
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- profile
-- ---------------------------------------------------------------------------
delete from public.profiles where email = 'faiz03@graduate.utm.my';

insert into public.profiles (
  name, headline, summary, bio, location, website_url, email, resume_url,
  availability_status, availability_label, is_active
) values (
  'Ahmad Faiz',
  'Software Engineer',
  'I build web systems that hold up in production — typed end to end, observable, and boring in the ways that matter.',
  array[
    'I am a software engineer based in Malaysia, currently completing graduate study at Universiti Teknologi Malaysia. My work sits where product engineering meets infrastructure: designing the data model, building the interface on top of it, and owning the pipeline that ships it.',
    'Most of what I build is full-stack TypeScript — Next.js on the front, PostgreSQL underneath, with a service layer in between that keeps the two from leaking into each other. I care a lot about that middle layer. It is the difference between a codebase you can change in a year and one you rewrite.',
    'Outside of feature work I spend time on the parts people skip: migrations that roll back cleanly, CI that fails for the right reasons, and error states that tell a visitor something useful instead of rendering a blank panel.'
  ],
  'Johor, Malaysia',
  'https://github.com/faiz03-glicth',
  'faiz03@graduate.utm.my',
  '/resume.pdf',
  'open',
  'Open to opportunities',
  true
);

-- ---------------------------------------------------------------------------
-- technologies
-- ---------------------------------------------------------------------------
insert into public.technologies (id, name, category, is_primary, sort_order) values
  ('typescript',     'TypeScript',    'languages',  true,  10),
  ('javascript',     'JavaScript',    'languages',  false, 20),
  ('python',         'Python',        'languages',  true,  30),
  ('sql',            'SQL',           'languages',  true,  40),
  ('java',           'Java',          'languages',  false, 50),
  ('bash',           'Bash',          'languages',  false, 60),

  ('nextjs',         'Next.js',       'frameworks', true,  10),
  ('react',          'React',         'frameworks', true,  20),
  ('tailwind',       'Tailwind CSS',  'frameworks', true,  30),
  ('express',        'Express',       'frameworks', false, 40),
  ('fastapi',        'FastAPI',       'frameworks', false, 50),

  ('nodejs',         'Node.js',       'backend',    true,  10),
  ('rest',           'REST APIs',     'backend',    false, 20),
  ('graphql',        'GraphQL',       'backend',    false, 30),
  ('zod',            'Zod',           'backend',    false, 40),

  ('postgresql',     'PostgreSQL',    'database',   true,  10),
  ('supabase',       'Supabase',      'database',   true,  20),
  ('redis',          'Redis',         'database',   false, 30),
  ('prisma',         'Prisma',        'database',   false, 40),

  ('docker',         'Docker',        'devops',     true,  10),
  ('gitlab-ci',      'GitLab CI/CD',  'devops',     true,  20),
  ('github-actions', 'GitHub Actions','devops',     false, 30),
  ('nginx',          'Nginx',         'devops',     false, 40),
  ('pm2',            'PM2',           'devops',     false, 50),

  ('hostinger',      'Hostinger VPS', 'cloud',      false, 10),
  ('vercel',         'Vercel',        'cloud',      false, 20),
  ('aws',            'AWS',           'cloud',      false, 30),
  ('cloudflare',     'Cloudflare',    'cloud',      false, 40),

  ('git',            'Git',           'tools',      true,  10),
  ('playwright',     'Playwright',    'tools',      false, 20),
  ('vitest',         'Vitest',        'tools',      false, 30),
  ('figma',          'Figma',         'tools',      false, 40),
  ('linux',          'Linux',         'tools',      false, 50)
on conflict (id) do update set
  name       = excluded.name,
  category   = excluded.category,
  is_primary = excluded.is_primary,
  sort_order = excluded.sort_order;

-- ---------------------------------------------------------------------------
-- projects
-- ---------------------------------------------------------------------------
insert into public.projects (
  slug, title, description, overview, highlights,
  github_url, gitlab_url, live_url,
  featured, type, status, start_date, end_date, primary_language, sort_order
) values
(
  'atlas-observability',
  'Atlas',
  'Self-hosted observability dashboard that turns Postgres logs into per-endpoint latency and error budgets.',
  array[
    'Atlas started as a weekend answer to a recurring annoyance: knowing that an API was slow, but not knowing which query made it slow. It ingests structured application logs into a Postgres table, rolls them up into per-endpoint time series, and renders latency percentiles against an error budget.',
    'The interesting constraint was cost. Running a full metrics stack for a handful of small services is absurd, so Atlas leans entirely on Postgres — continuous aggregates for the rollups, partitioning for retention, and a single Next.js process for the UI and ingest endpoint.'
  ],
  array[
    'p50/p95/p99 latency per endpoint, computed in SQL rather than in the application',
    'Retention handled by monthly partitions with an automatic detach-and-drop job',
    'Ingest endpoint sustains ~2k events/sec on a single 2 vCPU VPS',
    'Zero external dependencies beyond Postgres — no Prometheus, no Grafana'
  ],
  'https://github.com/faiz03-glicth/atlas',
  'https://gitlab.com/faiz03-glicth/atlas',
  'https://atlas.example.com',
  true, 'web-app', 'shipped', '2025-02-01', '2025-08-01', 'TypeScript', 100
),
(
  'ledger-api',
  'Ledger',
  'Double-entry accounting API with append-only journals and provable balance reconciliation.',
  array[
    'Ledger is a small financial primitive: an HTTP API for double-entry bookkeeping where entries are append-only and every account balance is derivable from the journal rather than stored alongside it.',
    'The design rule was that no code path may ever issue an UPDATE against a posted entry. Corrections are reversing entries. That makes the whole system auditable by construction, and it means a balance can always be recomputed from scratch to verify the cached projection.'
  ],
  array[
    'Serializable transactions with retry-on-conflict, so concurrent postings cannot unbalance an account',
    'Balance projections rebuilt nightly and diffed against the journal as a correctness check',
    'Idempotency keys on every write endpoint',
    'Property-based tests asserting that debits always equal credits across random operation sequences'
  ],
  'https://github.com/faiz03-glicth/ledger',
  null,
  null,
  true, 'api', 'shipped', '2024-09-01', '2025-01-15', 'TypeScript', 90
),
(
  'developer-portfolio',
  'This Portfolio',
  'The site you are reading — a modular monolith with a single-source theme system and provider-agnostic integrations.',
  array[
    'Built as four reviewable slices rather than one commit: the design system and static site first, then a Supabase data layer, then Spotify/GitHub/GitLab integrations, then the test suite and deployment pipeline.',
    'The constraint that shaped everything: the page must render completely even when every external service is unreachable. Integrations are additive decorations on a site that already works.'
  ],
  array[
    'One authoritative theme file drives both Tailwind''s utilities and the runtime CSS variables',
    'External providers hidden behind normalised adapters — the UI cannot tell GitHub from GitLab',
    'Every async section ships loading, empty and error states, not just the happy path',
    'GitLab CI pipeline gating deploys on lint, types, unit, integration and E2E'
  ],
  'https://github.com/faiz03-glicth/Portfolio',
  'https://gitlab.com/faiz03-glicth/portfolio',
  null,
  true, 'web-app', 'in-progress', '2026-08-01', null, 'TypeScript', 80
),
(
  'driftwood-migrations',
  'Driftwood',
  'CLI that diffs a live Postgres schema against checked-in migrations and fails CI when they disagree.',
  '{}', '{}',
  'https://github.com/faiz03-glicth/driftwood',
  null, null,
  false, 'tool', 'shipped', '2024-05-01', '2024-08-01', 'Python', 70
),
(
  'signal-scheduler',
  'Signal',
  'Cron-like job runner with at-least-once delivery, exponential backoff and a dead-letter queue, backed only by Postgres.',
  '{}', '{}',
  null,
  'https://gitlab.com/faiz03-glicth/signal',
  null,
  false, 'library', 'in-progress', '2025-06-01', null, 'TypeScript', 60
),
(
  'transit-analysis',
  'Transit',
  'Analysis of Johor Bahru bus reliability from a year of scraped GTFS-RT feeds, with an interactive headway explorer.',
  '{}', '{}',
  'https://github.com/faiz03-glicth/transit',
  null,
  'https://transit.example.com',
  false, 'data', 'archived', '2023-11-01', '2024-04-01', 'Python', 50
)
on conflict (slug) do update set
  title            = excluded.title,
  description      = excluded.description,
  overview         = excluded.overview,
  highlights       = excluded.highlights,
  github_url       = excluded.github_url,
  gitlab_url       = excluded.gitlab_url,
  live_url         = excluded.live_url,
  featured         = excluded.featured,
  type             = excluded.type,
  status           = excluded.status,
  start_date       = excluded.start_date,
  end_date         = excluded.end_date,
  primary_language = excluded.primary_language,
  sort_order       = excluded.sort_order;

-- ---------------------------------------------------------------------------
-- project_technologies
--
-- Resolved by slug so this block does not depend on generated UUIDs.
-- ---------------------------------------------------------------------------
insert into public.project_technologies (project_id, technology_id, sort_order)
select p.id, t.technology_id, t.sort_order
from (values
  ('atlas-observability',  'typescript', 10),
  ('atlas-observability',  'nextjs',     20),
  ('atlas-observability',  'postgresql', 30),
  ('atlas-observability',  'docker',     40),
  ('atlas-observability',  'nginx',      50),

  ('ledger-api',           'typescript', 10),
  ('ledger-api',           'nodejs',     20),
  ('ledger-api',           'postgresql', 30),
  ('ledger-api',           'zod',        40),
  ('ledger-api',           'docker',     50),

  ('developer-portfolio',  'typescript', 10),
  ('developer-portfolio',  'nextjs',     20),
  ('developer-portfolio',  'react',      30),
  ('developer-portfolio',  'tailwind',   40),
  ('developer-portfolio',  'supabase',   50),
  ('developer-portfolio',  'gitlab-ci',  60),

  ('driftwood-migrations', 'python',     10),
  ('driftwood-migrations', 'postgresql', 20),
  ('driftwood-migrations', 'gitlab-ci',  30),
  ('driftwood-migrations', 'docker',     40),

  ('signal-scheduler',     'typescript', 10),
  ('signal-scheduler',     'nodejs',     20),
  ('signal-scheduler',     'postgresql', 30),
  ('signal-scheduler',     'redis',      40),

  ('transit-analysis',     'python',     10),
  ('transit-analysis',     'postgresql', 20),
  ('transit-analysis',     'nextjs',     30)
) as t(slug, technology_id, sort_order)
join public.projects p on p.slug = t.slug
on conflict (project_id, technology_id) do update set
  sort_order = excluded.sort_order;

-- ---------------------------------------------------------------------------
-- experiences
-- ---------------------------------------------------------------------------
delete from public.experiences;

insert into public.experiences (
  title, company, company_url, location, kind, description,
  achievements, technologies, start_date, end_date, is_current, sort_order
) values
(
  'Graduate Researcher',
  'Universiti Teknologi Malaysia',
  'https://www.utm.my',
  'Johor, Malaysia',
  'education',
  'Graduate study in software engineering, focused on data-intensive web systems and the operational side of keeping them correct.',
  array[
    'Built the data pipeline and query layer behind a research group''s shared analysis tooling',
    'Introduced schema migrations and CI checks to a codebase that previously deployed by hand'
  ],
  array['python', 'postgresql', 'docker'],
  '2025-09-01', null, true, 100
),
(
  'Full-Stack Engineer',
  'Independent',
  null,
  'Remote',
  'work',
  'Contract work building and maintaining production web applications for small teams — typically owning the stack end to end, from schema to deployment.',
  array[
    'Delivered four production Next.js applications, each with its own CI pipeline and staged rollout',
    'Cut one client''s page load from 4.1s to 1.2s by moving data fetching server-side and fixing an N+1 in the listing query',
    'Set up automated Postgres backups and a tested restore procedure for clients who had neither'
  ],
  array['typescript', 'nextjs', 'react', 'postgresql', 'nginx', 'pm2'],
  '2024-01-01', null, true, 90
),
(
  'Software Engineering Intern',
  'Regional Technology Firm',
  null,
  'Kuala Lumpur, Malaysia',
  'work',
  'Worked on an internal operations platform used by the logistics team, shipping features against a live Postgres database and a legacy PHP service.',
  array[
    'Replaced a nightly CSV export with a typed REST endpoint, removing a recurring class of import failures',
    'Added integration tests to the reporting module, catching three date-boundary bugs before release'
  ],
  array['javascript', 'react', 'postgresql', 'docker'],
  '2023-06-01', '2023-12-01', false, 80
),
(
  'BSc Computer Science',
  'Universiti Teknologi Malaysia',
  'https://www.utm.my',
  'Johor, Malaysia',
  'education',
  'Undergraduate degree in computer science. Final-year project was a distributed file-integrity checker built on content-addressed storage.',
  '{}',
  array['java', 'python', 'sql'],
  '2021-09-01', '2025-06-01', false, 70
);

-- ---------------------------------------------------------------------------
-- social_links
-- ---------------------------------------------------------------------------
insert into public.social_links (id, platform, label, url, handle, sort_order, is_visible) values
  ('github',   'github',   'GitHub',   'https://github.com/faiz03-glicth',        '@faiz03-glicth',         10, true),
  ('gitlab',   'gitlab',   'GitLab',   'https://gitlab.com/faiz03-glicth',        '@faiz03-glicth',         20, true),
  ('linkedin', 'linkedin', 'LinkedIn', 'https://www.linkedin.com/in/faiz03',      'in/faiz03',              30, true),
  ('email',    'email',    'Email',    'mailto:faiz03@graduate.utm.my',           'faiz03@graduate.utm.my', 40, true)
on conflict (id) do update set
  platform   = excluded.platform,
  label      = excluded.label,
  url        = excluded.url,
  handle     = excluded.handle,
  sort_order = excluded.sort_order,
  is_visible = excluded.is_visible;

-- ---------------------------------------------------------------------------
-- portfolio_settings
-- ---------------------------------------------------------------------------
insert into public.portfolio_settings (key, value, description) values
  ('site.banner', 'null'::jsonb, 'Optional site-wide banner. Set to null to hide.'),
  ('projects.show_archived', 'true'::jsonb, 'Whether archived projects appear in the projects list.')
on conflict (key) do nothing;
