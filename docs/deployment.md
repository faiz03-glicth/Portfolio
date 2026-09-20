# Deployment

Target: **Hostinger VPS** — Ubuntu, Node.js, PM2, Nginx.

---

## Why a VPS and not shared hosting

This is the decision that shapes everything else, so it is worth stating
plainly.

Next.js needs a Node runtime. Server Components, Route Handlers, ISR
revalidation and image optimisation all execute per request. Hostinger's shared
hosting runs PHP and serves static files; it cannot run a long-lived Node
process, so it cannot run this application.

The alternatives were considered and rejected:

| Option                            | Why not                                                                                                                                                                         |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shared hosting + `next export`    | Kills Route Handlers. The Spotify integration would have to put a refresh token in the browser, so it would have to be deleted instead.                                         |
| Hostinger managed Node.js hosting | Workable, but constrained on start command, process management and env handling. Less control for no saving once you need PM2 semantics anyway.                                 |
| Docker on a VPS                   | Fine, and portable — but a container adds a build-and-registry step to deploy one Node process onto one box. `output: "standalone"` already produces a self-contained artifact. |

A VPS is the smallest environment that actually runs the application. Nothing
in the codebase depends on a Hostinger-specific API, so moving to Vercel, Fly,
Railway or another VPS is a different deploy job and zero application changes.

---

## What gets deployed

`next.config.mjs` sets `output: "standalone"`, which emits a server bundle
containing only the dependencies Next traced as reachable. The VPS never runs
`npm install` and needs no build toolchain.

One catch, and it is the classic standalone failure: **Next does not copy
static assets into the bundle**, because many deployments serve them from a
CDN. Without them the HTML renders and every stylesheet and script 404s.

`scripts/assemble-standalone.mjs` places them where the server expects:

```
.next/standalone/
├── server.js
├── node_modules/        traced dependencies only
├── .next/
│   ├── server/
│   └── static/          ← copied from .next/static
└── public/              ← copied from public/
```

```bash
npm run build:standalone   # next build + assemble
npm run start:standalone   # node .next/standalone/server.js
```

The E2E suite runs against this same bundle rather than `next start`, which is
unsupported with standalone output. That matters: it is how the soft-404 on
project pages was caught.

---

## Server layout

```
/var/www/portfolio/
├── ecosystem.config.cjs    PM2 definition — survives deploys
├── .env                    runtime secrets, chmod 600, never in git
├── logs/
├── current -> releases/abc1234
└── releases/
    ├── abc1234/            latest
    ├── def5678/            previous — rollback target
    └── ...                 five kept, older pruned
```

`current` is a symlink. Deploying means uploading a new release directory and
repointing it, which is a single atomic operation — a request never observes a
half-copied release.

---

## Runtime configuration

| Item            | Value                                                |
| --------------- | ---------------------------------------------------- |
| Node.js         | 22.x (must match `NODE_VERSION` in `.gitlab-ci.yml`) |
| Package manager | npm (`npm ci` in CI; the VPS installs nothing)       |
| Build command   | `npm run build:standalone`                           |
| Start command   | `node .next/standalone/server.js`                    |
| Process manager | PM2, cluster mode, 2 instances                       |
| Port            | 3000, bound to `127.0.0.1`                           |
| Reverse proxy   | Nginx, TLS terminated there                          |
| HTTPS           | Let's Encrypt via certbot                            |

The Node process binds to `127.0.0.1`, not `0.0.0.0`, and port 3000 is not
opened in the firewall. It is reachable only through Nginx — so TLS and rate
limiting cannot be bypassed by hitting the port directly.

### Secrets are runtime, not build-time

`deploy/ecosystem.config.cjs` reads `$DEPLOY_PATH/.env` when PM2 starts the
app. Secrets are never passed to `next build`.

That is deliberate. A value compiled into the bundle ends up in CI artifacts,
in build logs, and in every old release directory sitting on disk. Rotating a
token should mean editing one file and running `pm2 reload`, not rebuilding and
redeploying.

Only `NEXT_PUBLIC_*` values need to exist at build time — and those are not
secret by definition.

Example `/var/www/portfolio/.env`:

```bash
NEXT_PUBLIC_APP_URL=https://example.com
NEXT_PUBLIC_APP_ENV=production

NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

SPOTIFY_CLIENT_ID=...
SPOTIFY_CLIENT_SECRET=...
SPOTIFY_REFRESH_TOKEN=...

GITHUB_USERNAME=...
GITHUB_TOKEN=...
GITLAB_USERNAME=...
GITLAB_TOKEN=...
```

`chmod 600`, owned by the deploy user.

> `NEXT_PUBLIC_APP_URL` is read at build time for canonical URLs and the
> sitemap. Set it as a GitLab CI/CD variable too, not only in `.env`.

---

## First-time server setup

```bash
# On the VPS, as a sudo user:
curl -fsSL <raw-url>/deploy/setup-vps.sh -o setup-vps.sh
less setup-vps.sh        # read it before running it
sudo bash setup-vps.sh
```

The script installs Node, PM2 and Nginx, creates an unprivileged `deploy` user,
builds the directory layout, and configures the firewall. It is idempotent.

It deliberately does **not** write any secret, obtain a certificate (DNS has to
point at the box first), or enable password SSH.

Then, in order:

1. **Add the CI deploy key** to `/home/deploy/.ssh/authorized_keys`.
2. **Copy the process and proxy definitions:**
   ```bash
   scp deploy/ecosystem.config.cjs deploy@<host>:/var/www/portfolio/
   scp deploy/nginx.conf root@<host>:/etc/nginx/sites-available/portfolio
   ```
3. **Fill in** `/var/www/portfolio/.env`.
4. **Point DNS**, then enable the site and get a certificate:
   ```bash
   ln -s /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/
   rm -f /etc/nginx/sites-enabled/default
   nginx -t && systemctl reload nginx
   certbot --nginx -d example.com -d www.example.com
   ```
   Edit `nginx.conf` to replace `example.com` first.
5. **Run the deploy job**, then `sudo -u deploy pm2 save` so PM2 restores the
   app on reboot.

---

## GitLab CI/CD

```
Developer → push / merge request
                  ↓
       install ──→ lint · format · typecheck        (parallel)
                  ↓
                test  (unit + integration, coverage)
                  ↓
                build (standalone artifact)
                  ↓
                 e2e  (Playwright, desktop + mobile)
                  ↓
               deploy (main only, manual)
                  ↓
            Hostinger VPS
```

Two rules shape the pipeline:

- **Nothing deploys unless every gate passed.** No `allow_failure` anywhere
  upstream of `deploy`, and it is restricted to the default branch.
- **Work happens once.** `npm ci` runs in one job and passes `node_modules`
  forward; the build runs once and both E2E and deploy consume that artifact.

Deploy is `when: manual` by default. Change it to `when: on_success` for
continuous deployment.

### Required CI/CD variables

Set these **protected** and **masked** in Settings → CI/CD → Variables.

| Variable              | Purpose                                                       |
| --------------------- | ------------------------------------------------------------- |
| `SSH_PRIVATE_KEY`     | Deploy key, base64-encoded. Passphrase-less, dedicated to CI. |
| `SSH_KNOWN_HOSTS`     | Output of `ssh-keyscan -H <host>`. Pins the host key.         |
| `DEPLOY_HOST`         | VPS hostname or IP                                            |
| `DEPLOY_USER`         | `deploy`                                                      |
| `DEPLOY_PATH`         | `/var/www/portfolio`                                          |
| `DEPLOY_URL`          | `https://example.com` — shown on the environment              |
| `NEXT_PUBLIC_APP_URL` | Same. Needed at build time.                                   |

Generate the key pair:

```bash
ssh-keygen -t ed25519 -C "gitlab-ci-deploy" -f ./deploy_key -N ""
base64 -w0 deploy_key          # → SSH_PRIVATE_KEY
cat deploy_key.pub             # → authorized_keys on the VPS
ssh-keyscan -H <host>          # → SSH_KNOWN_HOSTS
rm deploy_key deploy_key.pub   # keep only what is in GitLab and on the server
```

The pipeline pins the host key rather than setting
`StrictHostKeyChecking=no`. Disabling that check would leave every deploy open
to a machine-in-the-middle, which is a strange risk to accept in exchange for
skipping one `ssh-keyscan`.

### Deploy steps

1. `rsync` the bundle into `releases/$CI_COMMIT_SHORT_SHA`
2. Repoint `current` — atomic symlink swap
3. `pm2 reload` — starts new instances before stopping old ones, so there is no
   downtime window (`restart` would drop in-flight requests)
4. Prune to the last five releases
5. **Health check** — the job fails if the running site does not answer

---

## Rollback

A `rollback` job ships in the pipeline. It is always manual, repoints `current`
at the previous release and reloads. It exists as a pipeline job rather than a
runbook step so it is usable under pressure without anyone needing SSH.

By hand:

```bash
cd /var/www/portfolio/releases
ls -1tr                     # newest last
ln -sfn /var/www/portfolio/releases/<previous> /var/www/portfolio/current.new
mv -Tf /var/www/portfolio/current.new /var/www/portfolio/current
cd /var/www/portfolio && pm2 reload ecosystem.config.cjs
```

---

## Operating it

```bash
pm2 status                       # is it running
pm2 logs portfolio --lines 100   # application logs
pm2 monit                        # live CPU and memory
pm2 reload ecosystem.config.cjs  # zero-downtime restart

tail -f /var/log/nginx/portfolio.error.log
nginx -t && systemctl reload nginx
```

### When something is wrong

| Symptom                       | Likely cause                                                                |
| ----------------------------- | --------------------------------------------------------------------------- |
| 502 from Nginx                | Node process is down. `pm2 status`, then `pm2 logs`.                        |
| Page renders, no CSS          | Static assets missing from the bundle — the assemble step did not run.      |
| Restart loop                  | Bad value in `.env`. PM2 stops after 5 attempts, so check `pm2 logs`.       |
| Stale content                 | ISR window has not elapsed. `revalidateTag`, or reload.                     |
| Integration panel unavailable | Provider down, or a rotated token. Everything else keeps working by design. |

### Certificate renewal

Certbot installs a systemd timer. Verify it:

```bash
systemctl list-timers | grep certbot
certbot renew --dry-run
```

The Nginx config leaves `/.well-known/acme-challenge/` unredirected —
redirecting it is the usual reason renewal silently starts failing.

---

## Moving off Hostinger

Nothing here is Hostinger-specific. The application is a Node process behind a
proxy.

- **Another VPS** — change `DEPLOY_HOST`. Nothing else moves.
- **Vercel** — remove `output: "standalone"`, connect the repository, move env
  vars into the project settings.
- **Docker** — copy `.next/standalone` into a `node:22-slim` image, `CMD ["node",
"server.js"]`. The assemble script already produces the layout.
