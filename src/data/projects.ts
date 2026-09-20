import type { Project } from "@/lib/types";

/**
 * PLACEHOLDER CONTENT — replace with your real work.
 *
 * `source: "static"` marks these as locally authored. On the `database` branch
 * the same records come back with `source: "database"`, and on `integration`
 * repository-backed entries arrive as `"github"` / `"gitlab"`. The UI treats
 * all four identically.
 */
export const projects: readonly Project[] = [
  {
    id: "prj-atlas",
    slug: "atlas-observability",
    title: "Atlas",
    description:
      "Self-hosted observability dashboard that turns Postgres logs into per-endpoint latency and error budgets.",
    overview: [
      "Atlas started as a weekend answer to a recurring annoyance: knowing that an API was slow, but not knowing which query made it slow. It ingests structured application logs into a Postgres table, rolls them up into per-endpoint time series, and renders latency percentiles against an error budget.",
      "The interesting constraint was cost. Running a full metrics stack for a handful of small services is absurd, so Atlas leans entirely on Postgres — continuous aggregates for the rollups, partitioning for retention, and a single Next.js process for the UI and ingest endpoint.",
    ],
    highlights: [
      "p50/p95/p99 latency per endpoint, computed in SQL rather than in the application",
      "Retention handled by monthly partitions with an automatic detach-and-drop job",
      "Ingest endpoint sustains ~2k events/sec on a single 2 vCPU VPS",
      "Zero external dependencies beyond Postgres — no Prometheus, no Grafana",
    ],
    technologies: ["typescript", "nextjs", "postgresql", "docker", "nginx"],
    githubUrl: "https://github.com/faiz03-glicth/atlas",
    gitlabUrl: "https://gitlab.com/faiz03-glicth/atlas",
    liveUrl: "https://atlas.example.com",
    featured: true,
    type: "web-app",
    status: "shipped",
    startDate: "2025-02-01",
    endDate: "2025-08-01",
    source: "static",
    primaryLanguage: "TypeScript",
  },
  {
    id: "prj-ledger",
    slug: "ledger-api",
    title: "Ledger",
    description:
      "Double-entry accounting API with append-only journals and provable balance reconciliation.",
    overview: [
      "Ledger is a small financial primitive: an HTTP API for double-entry bookkeeping where entries are append-only and every account balance is derivable from the journal rather than stored alongside it.",
      "The design rule was that no code path may ever issue an UPDATE against a posted entry. Corrections are reversing entries. That makes the whole system auditable by construction, and it means a balance can always be recomputed from scratch to verify the cached projection.",
    ],
    highlights: [
      "Serializable transactions with retry-on-conflict, so concurrent postings cannot unbalance an account",
      "Balance projections rebuilt nightly and diffed against the journal as a correctness check",
      "Idempotency keys on every write endpoint",
      "Property-based tests asserting that debits always equal credits across random operation sequences",
    ],
    technologies: ["typescript", "nodejs", "postgresql", "zod", "docker"],
    githubUrl: "https://github.com/faiz03-glicth/ledger",
    featured: true,
    type: "api",
    status: "shipped",
    startDate: "2024-09-01",
    endDate: "2025-01-15",
    source: "static",
    primaryLanguage: "TypeScript",
  },
  {
    id: "prj-portfolio",
    slug: "developer-portfolio",
    title: "This Portfolio",
    description:
      "The site you are reading — a modular monolith with a single-source theme system and provider-agnostic integrations.",
    overview: [
      "Built as four reviewable slices rather than one commit: the design system and static site first, then a Supabase data layer, then Spotify/GitHub/GitLab integrations, then the test suite and deployment pipeline.",
      "The constraint that shaped everything: the page must render completely even when every external service is unreachable. Integrations are additive decorations on a site that already works.",
    ],
    highlights: [
      "One authoritative theme file drives both Tailwind's utilities and the runtime CSS variables",
      "External providers hidden behind normalised adapters — the UI cannot tell GitHub from GitLab",
      "Every async section ships loading, empty and error states, not just the happy path",
      "GitLab CI pipeline gating deploys on lint, types, unit, integration and E2E",
    ],
    technologies: [
      "typescript",
      "nextjs",
      "react",
      "tailwind",
      "supabase",
      "gitlab-ci",
    ],
    githubUrl: "https://github.com/faiz03-glicth/Portfolio",
    gitlabUrl: "https://gitlab.com/faiz03-glicth/portfolio",
    featured: true,
    type: "web-app",
    status: "in-progress",
    startDate: "2026-08-01",
    source: "static",
    primaryLanguage: "TypeScript",
  },
  {
    id: "prj-driftwood",
    slug: "driftwood-migrations",
    title: "Driftwood",
    description:
      "CLI that diffs a live Postgres schema against checked-in migrations and fails CI when they disagree.",
    technologies: ["python", "postgresql", "gitlab-ci", "docker"],
    githubUrl: "https://github.com/faiz03-glicth/driftwood",
    featured: false,
    type: "tool",
    status: "shipped",
    startDate: "2024-05-01",
    endDate: "2024-08-01",
    source: "static",
    primaryLanguage: "Python",
  },
  {
    id: "prj-signal",
    slug: "signal-scheduler",
    title: "Signal",
    description:
      "Cron-like job runner with at-least-once delivery, exponential backoff and a dead-letter queue, backed only by Postgres.",
    technologies: ["typescript", "nodejs", "postgresql", "redis"],
    gitlabUrl: "https://gitlab.com/faiz03-glicth/signal",
    featured: false,
    type: "library",
    status: "in-progress",
    startDate: "2025-06-01",
    source: "static",
    primaryLanguage: "TypeScript",
  },
  {
    id: "prj-transit",
    slug: "transit-analysis",
    title: "Transit",
    description:
      "Analysis of Johor Bahru bus reliability from a year of scraped GTFS-RT feeds, with an interactive headway explorer.",
    technologies: ["python", "postgresql", "nextjs"],
    githubUrl: "https://github.com/faiz03-glicth/transit",
    liveUrl: "https://transit.example.com",
    featured: false,
    type: "data",
    status: "archived",
    startDate: "2023-11-01",
    endDate: "2024-04-01",
    source: "static",
    primaryLanguage: "Python",
  },
] as const;
