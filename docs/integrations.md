# Integrations

Spotify, GitHub and GitLab. All three are optional, and none of them is on the
critical path to a rendered page.

> Roblox is explicitly **not** implemented in this version.

---

## The shape every provider follows

```
src/lib/integrations/<provider>/
├── client.ts    transport: credentials, base URL, timeouts, errors → Result
├── mapper.ts    vendor payload → normalised domain model
├── service.ts   the public surface
├── types.ts     the vendor's response shapes
└── index.ts     exports the service, and only the service
```

```
Provider → Adapter → Normalised Model → Service → UI
```

Two consequences worth stating plainly:

- **`types.ts` never escapes its directory.** Nothing outside the adapter has
  seen a Spotify or GitHub response shape. The UI works with
  `RecentlyPlayedTrack`, `CodeActivity` and `Project`.
- **`CodeActivityPanel` is identical for GitHub and GitLab.** The provider
  survives only as a label and an icon. Adding a third forge is a new adapter
  directory, not a component rewrite.

Every adapter is marked `server-only`. These modules read API tokens, so an
import from a Client Component fails the build rather than shipping
credentials to the browser.

---

## Failure isolation

Adapters return `Result<T>` instead of throwing. A caller cannot reach `.data`
without narrowing on `ok` first, which makes handling failure structural rather
than a matter of remembering to.

There are three outcomes per provider, and they are kept distinct:

| State               | Behaviour                                  |
| ------------------- | ------------------------------------------ |
| Not configured      | Sample data, labelled as representative    |
| Configured, working | Live data                                  |
| Configured, failing | An unavailable state — **not** sample data |

That last row is deliberate. Once a provider is configured, the visitor is
looking at real numbers. Silently substituting invented ones on failure would
misrepresent them as real. For Spotify the point is sharper still: fabricated
"recently played" tracks would be a fabrication, not a degradation.

Verify it without breaking anything:

```bash
# Live: the GitHub panel shows real values, GitLab stays on sample data.
GITHUB_USERNAME=<your-username> npm run build

# Failing: the GitHub card reads "unavailable", every other section renders.
GITHUB_USERNAME=this-user-does-not-exist-99887766 npm run build
```

---

## Caching

Windows live in `config/app.ts` and are passed to Next's `fetch` cache by the
adapters, so no adapter manages a cache of its own.

| Data                   | Window | Why                                         |
| ---------------------- | ------ | ------------------------------------------- |
| Repositories, activity | 30 min | Changes slowly; rate limits matter          |
| Recently played        | 60 s   | Changes fast; still must not hammer Spotify |

Timeouts are capped at 8 seconds in `integrations/http.ts`. A slow provider
must not hold a page render open.

---

## Spotify

Shows the most recent tracks from your account. It is labelled **Recently
Played**, not listening history — the endpoint returns a short trailing window,
and calling it anything else would overstate the data.

### Setup

1. Create an app at
   [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard).
2. Add this exact redirect URI to it:

   ```
   http://127.0.0.1:8888/callback
   ```

3. Put the client ID and secret in `.env.local`:

   ```bash
   SPOTIFY_CLIENT_ID=...
   SPOTIFY_CLIENT_SECRET=...
   ```

4. Get a refresh token:

   ```bash
   npm run spotify:token
   ```

   This runs a throwaway local server, prints an authorisation URL, catches the
   redirect and exchanges the code. Paste the printed token into `.env.local`
   as `SPOTIFY_REFRESH_TOKEN`. It is long-lived — this is a one-time step.

### Why a refresh token at all

The recently-played endpoint needs a _user_ access token, which the
client-credentials flow cannot produce. The authorisation-code flow issues a
long-lived refresh token, which the adapter exchanges for a one-hour access
token and caches in process memory. Exchanging on every request would triple
the section's latency and burn rate limit for nothing.

The token cache is module-scope, so it is per server instance. That is the
correct scope: an access token is a secret and has no business in a shared or
persisted cache.

### Scope

`user-read-recently-played`, and nothing else. The site never plays, queues or
modifies anything, so it should not hold a token that could.

### Route handler

```
GET /api/spotify/recently-played?limit=10
```

Returns normalised tracks. The music section renders server-side and does not
use this, but the endpoint exists so the feed is reachable without a full page
render — client-side polling, or another surface consuming the same data.

No credential leaves the server, and no upstream error text is echoed: the
error messages in a failure response are written for a visitor.

---

## GitHub

### Setup

```bash
GITHUB_USERNAME=your-username    # this alone enables the integration
GITHUB_TOKEN=                    # optional
```

**A token is optional on purpose.** Everything the site shows is public, and
GitHub's REST API serves public data unauthenticated. Requiring a personal
access token to read public repositories would be asking for far more privilege
than the feature needs.

What a token buys:

- 5,000 requests/hour instead of 60
- the contribution calendar, which only exists in the GraphQL API

Without one, the panel still renders — minus the heatmap. It is omitted rather
than drawn empty, because an all-grey grid reads as a year of no work rather
than as missing data.

### Least privilege

Use a **fine-grained token with no scopes and no repository access**. It only
needs to authenticate, not to authorise anything. A classic token with `repo`
scope grants write access to every repository you can reach — do not use one
here.

### Language shares

Computed from repository counts, not bytes. GitHub only exposes byte counts
per repository, which would mean one request per repo. The chart is an
indication, not a measurement, and one request is the right price for it.

---

## GitLab

The repository itself is meant to live on GitLab, so this integration is the
one that matters most.

### Setup

```bash
GITLAB_USERNAME=your-username
GITLAB_TOKEN=                    # optional
GITLAB_BASE_URL=                 # optional, for self-hosted
```

`GITLAB_BASE_URL` exists because GitLab is commonly self-hosted. Hardcoding
`gitlab.com` would make the adapter useless against a private instance for no
gain.

### Least privilege

Scope: **`read_api`**. Not `api`, which grants write access to everything the
account can reach.

### The contribution calendar is an approximation

Worth being honest about: GitLab has no contribution-calendar endpoint, so the
heatmap is assembled from the user's `/events` feed. That feed covers pushes,
merge requests and issues, but not private-project activity the token cannot
see, and GitLab limits how far back it serves. **Expect it to undercount
relative to the GitHub panel.**

### Language shares

GitLab reports languages per project, not per user, so the service samples the
most recently active project rather than issuing one request per repository.

---

## The unified project list

`projectService` composes three sources into one list:

```
database / static projects  ─┐
GitHub repositories         ─┼─→  Project[]  →  ProjectGrid
GitLab projects             ─┘
```

Callers ask for projects. They never ask GitHub for repositories or GitLab for
projects — that is the whole point, and adding a fourth source means editing
one file.

Rules it applies:

- **Curated projects win.** A hand-written description and write-up beats a
  repo blurb, and the same work appearing twice under two sources looks
  careless. Deduplication normalises repository URLs first, so
  `https://github.com/User/Repo.git` and `http://github.com/user/repo/` are
  recognised as the same thing.
- **A failing provider is skipped, not propagated.** GitHub being down must not
  empty a list the database could have filled on its own.
- **Only curated projects get detail pages.** A repository-derived record has
  no write-up, so its card links to the repository instead of to a route that
  would 404.

---

## Adding another provider

LinkedIn, LeetCode, Steam, YouTube, Discord, Dev.to, Medium — the steps are the
same each time:

1. Create `src/lib/integrations/<provider>/` with the five files above.
2. Map into an existing normalised model, or add one to `lib/types/`.
3. Expose `isConfigured()` from the service.
4. Render it with `IntegrationCard`, which already handles the four states.

No component, no page and no theme value should need to change.

---

## Security notes

- Every adapter is `server-only`. Tokens cannot reach the browser.
- Integration availability is **not** a flag on `appConfig`. Those credentials
  are server-only variables with no `NEXT_PUBLIC_` prefix, so a config object
  evaluated in the browser would report them as absent. A flag that is silently
  wrong in half the places it is read is worse than no flag — each adapter owns
  the question instead.
- `integrations/http.ts` logs only a URL's origin and path. Query strings on
  these APIs can carry tokens, and a log line is not a safe place for one.
- Upstream response bodies are logged server-side and never returned to a
  client. `Result.error.message` is written by us, for a visitor.
- Verified: `npm run build` produces no client chunk referencing any provider
  SDK, token or endpoint.
