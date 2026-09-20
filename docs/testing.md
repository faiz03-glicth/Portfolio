# Testing

```bash
npm run lint           # ESLint
npm run format:check   # Prettier, no writes
npm run typecheck      # tsc --noEmit
npm test               # unit + integration (Vitest)
npm run test:coverage  # same, with coverage
npm run test:e2e       # builds, then Playwright (desktop + mobile)
npm run build          # production build
```

---

## The split, and why

| Level       | Runner     | Environment      | Covers                                                                |
| ----------- | ---------- | ---------------- | --------------------------------------------------------------------- |
| Unit        | Vitest     | node             | Mappers, formatters, theme tokens, static content invariants          |
| Integration | Vitest     | node, mocked I/O | HTTP transport, repository errors, service composition, route handler |
| E2E         | Playwright | Real Chromium    | Rendering, navigation, theming, SEO, accessibility, degraded states   |

There are no jsdom component tests. That is a deliberate omission rather than a
gap: jsdom is an approximation of a browser, and the things worth asserting
about these components — that focus rings are visible, that a native `<dialog>`
traps focus, that nothing overflows horizontally at 320px — are exactly the
things jsdom models badly or not at all. Playwright runs a real browser against
the real production bundle, so those assertions mean something.

### E2E runs against the deployed artifact

Playwright starts `node .next/standalone/server.js` — the same bundle that ships
to the VPS. Not the dev server (Strict Mode double-renders, no prerendering),
and not `next start`, which is unsupported with `output: "standalone"`.

This is not pedantry. Testing `next start` reported HTTP 200 for a nonexistent
project page; the standalone server exposed it as the soft 404 it was.

### External providers are left unconfigured

No Supabase, GitHub, GitLab or Spotify credentials are set for E2E. A test
suite that needs a third party to be reachable fails for reasons unrelated to
the code.

It also means every run exercises the degraded path the architecture promises:
static fallbacks, "unavailable" states, and a page that still works.

---

## What the tests are actually protecting

Mappers get the most attention, because they are the boundary where a vendor's
shape becomes the application's shape. Everything downstream assumes that
translation is right and none of it can detect a bad one — a dropped optional
field surfaces as a confusing UI bug three layers away.

Specific invariants under test:

- **Nullable columns become absent properties, not `null`.** Components use
  `?.` and `??`; a leaked `null` renders as empty markup instead of being
  skipped.
- **Errors never carry upstream text.** PostgREST puts SQL and row contents in
  `message`/`details`/`hint`; provider APIs echo request detail. Tests assert
  the sanitised message and that the original does not appear.
- **Logs never carry a query string.** These APIs accept tokens as query
  parameters.
- **A failing provider does not empty the list.** `projectService` keeps
  database projects when a forge is down.
- **Deduplication survives URL variation.** `.git` suffixes, trailing slashes,
  casing and scheme.
- **Theme tokens stay parallel.** Light and dark define the same keys, stored
  as bare HSL channels — a literal hex would break every opacity modifier
  silently.
- **Static content satisfies the database's constraints.** No current role with
  an end date, no project ending before it starts. The two sources must not
  disagree.

---

## Bugs these tests found

Worth recording, since the point of a suite is to catch things:

**Contribution calendars were misaligned by a day.** The window ended on the
most recent Sunday and spanned 371 days, so it _started_ on a Monday — every
grid column was shifted while the code claimed Sunday alignment. Present in
both the GitLab mapper and the fallback generator.

**Nonexistent project pages returned HTTP 200.** The segment carries a
revalidation window, so an unknown slug was rendered on demand and the
`notFound()` result was prerendered and cached as a 200 — visible as
`x-nextjs-prerender: 1` on the response. A soft 404, and search engines would
have indexed every mistyped URL. Fixed with `dynamicParams = false`, which is
correct here because the project set is known at build time.

---

## Coverage

`npm run test:coverage` writes `text`, `lcov` and `cobertura` reports; GitLab
parses the last one.

No minimum threshold is enforced, and the headline number (~40% of `src/lib`
and `src/config`) is lower than it looks. The uncovered majority is transport
code in the provider clients — thin `fetch` wrappers whose interesting
behaviour is in `http.ts`, which is covered thoroughly. The logic that can
actually be wrong in a subtle way is where the tests are.

A threshold that forces tests for `client.ts` would produce mock-heavy tests
asserting that `fetch` was called with a URL. That is coverage, not
confidence.

---

## CI

Every level runs in the pipeline, and `deploy` is unreachable unless all of
them pass. See [`deployment.md`](deployment.md).

```
install → lint · format · typecheck → test → build → e2e → deploy
```

Artifacts kept on failure: coverage, the Playwright HTML report, traces (on
retry) and failure screenshots.
