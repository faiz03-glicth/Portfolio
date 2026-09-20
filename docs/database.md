# Database

Supabase (managed PostgreSQL), free tier.

The site does **not** require it. With no Supabase environment variables set,
`portfolioService` returns the static content in `src/data/` and every page
renders normally. The database replaces that content when it is available.

---

## Layers

```
Server Component
      ↓        never imports the Supabase client
portfolioService          falls back to static content on any failure
      ↓
repositories              one per aggregate, returns Result<T>
      ↓
mappers                   row shape → domain model
      ↓
Supabase client           anon key + Row Level Security
```

Two rules keep this honest:

- **No component imports a repository.** Components call the service, which
  always returns content and never a `Result`. A page has nothing useful to do
  with a database error.
- **Database naming stops at `mappers.ts`.** Past that boundary it is
  `avatarUrl`, not `avatar_url`.

---

## Setting up a project

1. Create a project at [supabase.com](https://supabase.com). Any region; pick
   the one closest to your visitors.
2. Copy the connection details from **Project Settings → API**.
3. Put them in `.env.local`:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
   SUPABASE_SERVICE_ROLE_KEY=<service role key>
   ```

   The anon key is public by design — it ships in the browser bundle, and RLS
   is what constrains it. **The service-role key is not.** It bypasses RLS
   entirely. It has no `NEXT_PUBLIC_` prefix, and `src/lib/supabase/server.ts`
   is marked `server-only` so an accidental client import fails the build
   rather than leaking it.

4. Run the migrations, in order, in the SQL Editor:

   ```
   supabase/migrations/0001_initial_schema.sql
   supabase/migrations/0002_row_level_security.sql
   ```

5. Run `supabase/seed.sql` to load the placeholder content.

6. Restart `npm run dev`. `appConfig.features.supabase` flips on automatically
   once the URL and anon key are present — there is no separate toggle.

### Using the Supabase CLI instead

```bash
npx supabase link --project-ref <project-ref>
npx supabase db push          # applies supabase/migrations in order
npx supabase db execute --file supabase/seed.sql
```

---

## Schema

| Table                  | Holds                                              |
| ---------------------- | -------------------------------------------------- |
| `profiles`             | Name, headline, bio, availability. One active row. |
| `experiences`          | Roles, study, achievements.                        |
| `projects`             | Projects, write-ups, links, status.                |
| `technologies`         | Technology registry with categories.               |
| `project_technologies` | Join table, ordered.                               |
| `social_links`         | Social and contact links.                          |
| `portfolio_settings`   | Key/value settings editable without a deploy.      |

Deliberate choices:

- **CHECK constraints, not enum types.** Widening a CHECK is a one-line
  migration; `ALTER TYPE ... ADD VALUE` needs more care.
- **`sort_order` everywhere.** "Whatever the database returns" is not an
  ordering.
- **Timestamps maintained by trigger.** An edit made in the Supabase console
  cannot leave `updated_at` stale.
- **A partial unique index on `profiles (is_active) WHERE is_active`.** Exactly
  one live profile, enforced by the database rather than by convention.
- **Date-order and current-role constraints.** `end_date >= start_date`, and a
  role marked current cannot also have an end date.

---

## Security model

One sentence: _the anon key may read published content and nothing else; every
write goes through the service role, which only exists on the server._

Migration `0002` does three things:

1. **Enables RLS on every table.** A table in an exposed schema with RLS off is
   readable _and writable_ by anyone holding the anon key — a value published
   in the browser bundle. Missing one table is the whole vulnerability.
2. **Forces RLS**, so it applies to the table owner too.
3. **Defines `SELECT` policies only.** There is no INSERT, UPDATE or DELETE
   policy for `anon` or `authenticated`, so RLS denies those. "No policy" is
   the correct way to express "never".

Errors are sanitised in `repositories/base.ts`: PostgREST's `message`,
`details` and `hint` can quote SQL and row contents, so the message returned to
the application is written by us and the original is logged server-side only.

### Verifying it

```sql
-- Every table should report rowsecurity = true.
select tablename, rowsecurity
from pg_tables
where schemaname = 'public';

-- Every policy should be cmd = 'SELECT'.
select tablename, policyname, cmd, roles
from pg_policies
where schemaname = 'public';
```

---

## Caching

Supabase queries do not go through `fetch`, so Next's automatic caching does
not see them. `portfolioService` wraps each loader in `unstable_cache` with a
one-hour window (`appConfig.cache.content`) and two tags.

To refresh content immediately after editing a row, revalidate the tag from a
Route Handler or Server Action:

```ts
import { revalidateTag } from "next/cache";
import { CONTENT_TAG } from "@/lib/services/portfolio-service";

revalidateTag(CONTENT_TAG);
```

---

## Failure behaviour

| Situation             | Result                                              |
| --------------------- | --------------------------------------------------- |
| No env vars           | Static content. Silent — this is a supported state. |
| Supabase unreachable  | Static content. Logged as `network_error`.          |
| RLS denies a read     | Static content. Logged as `unauthorized`.           |
| Row genuinely missing | `getProjectBySlug` returns `undefined` → 404.       |

Only the genuinely-missing case produces a 404, because that one is a real
answer rather than a failure.

This is verifiable without breaking anything — point the app at a dead port and
build:

```bash
NEXT_PUBLIC_SUPABASE_URL="http://127.0.0.1:1" \
NEXT_PUBLIC_SUPABASE_ANON_KEY="fake" \
npm run build
```

The build succeeds, logs `fell back to static content (network_error)`, and
produces a complete site.

---

## Changing the schema

1. Add `supabase/migrations/000N_description.sql`. Never edit an applied one.
2. Update the matching row type in `src/lib/supabase/database.types.ts`.
3. Update `src/lib/repositories/mappers.ts`.

Step 2 is what makes step 3 safe: the types are hand-written rather than
generated, so a column renamed in SQL but not in TypeScript produces a compile
error at the mapper. (They are hand-written on purpose — generating them needs
a live database, and `npm run typecheck` should not depend on infrastructure
being up.)
