# Developer Portfolio

A personal developer portfolio built as a **modular monolith** on Next.js — the
UI, the backend-for-frontend and the integration layer all live in one
deployable application.

The guiding constraint: **the site must render completely even when every
external service is unreachable.** Supabase, Spotify, GitHub and GitLab are
additive. None of them is on the critical path to a rendered page.

---

## Tech Stack

| Layer        | Choice                                              |
| ------------ | --------------------------------------------------- |
| Framework    | Next.js (App Router, React Server Components)       |
| Language     | TypeScript (strict, `noUncheckedIndexedAccess`)     |
| UI           | React + Tailwind CSS                                |
| Backend      | Next.js Route Handlers + server-side services (BFF) |
| Database     | Supabase (PostgreSQL)                               |
| Integrations | Spotify Web API, GitHub API, GitLab API             |
| CI/CD        | GitLab CI                                           |
| Hosting      | Hostinger VPS (Node.js + PM2 + Nginx)               |

---

## Architecture

```
Browser
   │
   ▼
Next.js  ── UI (Server Components) + BFF (Route Handlers)
   │
   ├── Services ──── Repositories ──── Supabase (PostgreSQL)
   │
   └── Services ──── Adapters ──────── Spotify / GitHub / GitLab
```

Three rules hold the structure together:

1. **One theme source.** `src/config/theme.ts` is the only place a colour,
   radius, duration or type scale is defined. It feeds Tailwind's utility
   classes _and_ the runtime CSS variables — see below.
2. **Components never talk to providers.** A component receives a normalised
   domain model. It cannot tell whether a project came from a static file,
   Postgres, GitHub or GitLab.
3. **Failure is contained.** Anything that can fail returns a `Result<T>`
   rather than throwing, and renders inside a shell that has a defined
   loading / empty / error state.

Full rationale, including what would justify breaking this into services:
[`docs/architecture.md`](docs/architecture.md). Database schema, security model
and setup: [`docs/database.md`](docs/database.md). Provider adapters, tokens and
failure behaviour: [`docs/integrations.md`](docs/integrations.md). Test strategy:
[`docs/testing.md`](docs/testing.md). Deployment:
[`docs/deployment.md`](docs/deployment.md).

### Project structure

```
src/
├── app/                     routes, metadata, sitemap, robots, OG image
├── components/
│   ├── ui/                  design system primitives
│   ├── layout/              header, footer, theme
│   ├── navigation/          navbar, mobile drawer
│   ├── hero/ projects/ experience/ music/ integrations/
│   └── sections/            homepage band compositions
├── config/
│   ├── theme.ts             ← the visual system, single source of truth
│   ├── site.ts              identity + SEO defaults
│   ├── navigation.ts        nav structure
│   └── app.ts               environment, feature flags, cache windows
├── data/                    static portfolio content + integration fallbacks
├── lib/
│   ├── types/               domain models (portfolio, integrations, Result)
│   ├── supabase/            clients (anon + service-role), env, row types
│   ├── repositories/        one per aggregate, returns Result<T>
│   ├── integrations/        spotify/ github/ gitlab/ — adapters, server-only
│   ├── services/            composition, caching, static fallback
│   ├── metadata.ts          per-page metadata builder
│   └── utils.ts             formatting and class helpers
└── styles/
    ├── theme-css.ts         serialises theme.ts → CSS custom properties
    └── globals.css          base layer, focus, reduced motion
```

### The theme system

`theme.ts` has exactly two consumers, so there is no second copy to drift:

```
src/config/theme.ts
        │
        ├──► tailwind.config.ts    → utility classes (bg-background, py-section)
        └──► src/styles/theme-css.ts → CSS variables injected by the root layout
```

Colours are stored as bare HSL channels (`"222 24% 5%"`) rather than finished
colour strings, which is what lets Tailwind compose them with alpha modifiers:
`bg-primary/20` works for every token automatically.

Components use semantic utilities and never colour literals:

```tsx
<div className="bg-surface text-muted-foreground border-border" />  // yes
<div className="bg-[#0b0f14]" />                                    // no
```

Light/dark switching is an attribute on `<html>`, resolved before first paint by
a blocking inline script so there is no flash of the wrong palette.

---

## Branches

The project is built as four reviewable slices rather than one commit.

| Branch        | Responsibility                                                                           |
| ------------- | ---------------------------------------------------------------------------------------- |
| `main`        | Framework, architecture, design system, pages, static content. No external dependencies. |
| `database`    | Supabase: schema, migrations, seeds, repository layer, RLS.                              |
| `integration` | Spotify, GitHub, GitLab adapters behind normalised models.                               |
| `testing`     | Unit / integration / E2E tests, GitLab CI, Hostinger deployment.                         |

```
main  →  database  →  integration  →  testing
```

Each branch must build, typecheck and lint cleanly before the next begins.

---

## Local Development

Requires Node.js 20+ (see `.nvmrc`).

```bash
npm install
cp .env.example .env.local
npm run dev
```

The site runs at http://localhost:3000.

On `main` no environment variables are required — every section renders from
`src/data/`.

### Scripts

```bash
npm run dev           # development server
npm run build         # production build (standalone output)
npm run start         # serve the production build
npm run lint          # ESLint
npm run typecheck     # tsc --noEmit
npm run format        # Prettier write
npm run format:check  # Prettier check (used in CI)

npm run spotify:token # one-time: obtain a Spotify refresh token

npm test              # unit + integration (Vitest)
npm run test:coverage # ...with coverage
npm run test:e2e      # build + Playwright (desktop and mobile)

npm run build:standalone  # production build, assembled for deployment
npm run start:standalone  # run that bundle exactly as the VPS does
```

---

## Environment Variables

Every variable is documented in [`.env.example`](.env.example). Secrets are
never committed — `.env*` is gitignored except the example.

### Application (`main`)

| Variable              | Required | Purpose                                                                                           |
| --------------------- | -------- | ------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_APP_URL` | no       | Public origin. Drives canonical URLs, sitemap, OG tags. Defaults to `http://localhost:3000`.      |
| `NEXT_PUBLIC_APP_ENV` | no       | `local` \| `development` \| `testing` \| `production`. Non-production environments are `noindex`. |

### Supabase (`database`)

| Variable                        | Required | Purpose                                                  |
| ------------------------------- | -------- | -------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | no       | Project URL. Absent means static content.                |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | no       | Publishable key. Constrained by Row Level Security.      |
| `SUPABASE_SERVICE_ROLE_KEY`     | no       | Bypasses RLS. **Server only.** Not needed for rendering. |

All three are optional. With none set, the site renders the static content in
`src/data/` — see [`docs/database.md`](docs/database.md).

### Integrations (`integration`)

| Variable                | Required | Purpose                                                                 |
| ----------------------- | -------- | ----------------------------------------------------------------------- |
| `SPOTIFY_CLIENT_ID`     | no       | Spotify app credentials. All three are needed together.                 |
| `SPOTIFY_CLIENT_SECRET` | no       | **Server only.**                                                        |
| `SPOTIFY_REFRESH_TOKEN` | no       | **Server only.** Obtain once via `npm run spotify:token`.               |
| `GITHUB_USERNAME`       | no       | Enables the GitHub panel. Public data needs no token.                   |
| `GITHUB_TOKEN`          | no       | **Server only.** Raises rate limits, unlocks the contribution calendar. |
| `GITLAB_USERNAME`       | no       | Enables the GitLab panel.                                               |
| `GITLAB_TOKEN`          | no       | **Server only.** `read_api` scope only.                                 |
| `GITLAB_BASE_URL`       | no       | For a self-hosted instance. Defaults to gitlab.com.                     |

Each integration degrades on its own: an unconfigured provider shows sample
data, a failing one shows an unavailable state, and neither affects the rest of
the page. See [`docs/integrations.md`](docs/integrations.md).

> **Never** expose `SUPABASE_SERVICE_ROLE_KEY`, `SPOTIFY_CLIENT_SECRET`,
> `SPOTIFY_REFRESH_TOKEN`, `GITHUB_TOKEN` or `GITLAB_TOKEN` to the client.
> Only `NEXT_PUBLIC_`-prefixed values reach the browser bundle.

---

## Editing Your Content

All portfolio content on `main` lives in `src/data/` as typed modules:

| File            | Contains                                      |
| --------------- | --------------------------------------------- |
| `profile.ts`    | Name, headline, bio, location, availability   |
| `experience.ts` | Roles, study, achievements                    |
| `projects.ts`   | Projects, write-ups, links, technologies      |
| `skills.ts`     | Technologies and their categories             |
| `social.ts`     | Social and contact links                      |
| `fallback/`     | Placeholder data for the integration sections |

The shipped content is **placeholder** and marked as such. TypeScript will tell
you if an edit breaks a required field.

---

## Accessibility

Enforced structurally rather than by convention:

- Focus rings are a global rule, so no component can opt out by forgetting them.
- `prefers-reduced-motion` is honoured once, globally.
- Icon-only controls require a `label` prop — it is not optional in the type.
- The mobile drawer uses a native `<dialog>`, inheriting focus trapping,
  inertness and Escape handling.
- Skip link, landmark regions, and a single `<h1>` per page.

---

## Testing

| Level       | Runner     | Covers                                                                |
| ----------- | ---------- | --------------------------------------------------------------------- |
| Unit        | Vitest     | Mappers, formatters, theme tokens, content invariants                 |
| Integration | Vitest     | HTTP transport, repository errors, service composition, route handler |
| E2E         | Playwright | Rendering, navigation, theming, SEO, accessibility, degraded states   |

E2E runs against the **standalone production bundle** — the same artifact that
deploys — with no external providers configured, so every run also exercises
the degraded path.

```bash
npm test          # 149 unit + integration tests
npm run test:e2e  # 74 E2E tests across desktop and mobile
```

Details, and the two bugs the suite caught:
[`docs/testing.md`](docs/testing.md).

---

## CI/CD

```
install → lint · format · typecheck → test → build → e2e → deploy
```

`deploy` is unreachable unless every gate passes, and runs only on `main`.
See [`.gitlab-ci.yml`](.gitlab-ci.yml).

---

## Deployment

Target: **Hostinger VPS** — Node.js, PM2, Nginx, Let's Encrypt.

Next.js needs a Node runtime, so shared hosting cannot run this application and
a static export would mean deleting the integration layer. `output:
"standalone"` produces a self-contained bundle; the VPS installs nothing.

Deploys are atomic (symlink swap), zero-downtime (`pm2 reload`), health-checked,
and rollback is a pipeline job. Secrets are read at runtime from a `.env` on the
server, never compiled into the build.

One-time setup: [`deploy/setup-vps.sh`](deploy/setup-vps.sh).
Full procedure: [`docs/deployment.md`](docs/deployment.md).
