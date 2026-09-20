/**
 * PM2 process definition for the Hostinger VPS.
 *
 * This file lives on the server at $DEPLOY_PATH (NOT inside a release
 * directory), because it must survive the symlink swap that each deploy
 * performs. It is copied there once during setup — see docs/deployment.md.
 *
 * Layout it assumes:
 *
 *   /var/www/portfolio/
 *   ├── ecosystem.config.cjs     this file
 *   ├── .env                     runtime secrets, chmod 600
 *   ├── current -> releases/abc1234
 *   └── releases/
 *       ├── abc1234/server.js    a standalone bundle
 *       └── def5678/server.js    the previous one, kept for rollback
 *
 * `.cjs` rather than `.js`: PM2 loads this with `require`, and the extension
 * makes that explicit regardless of what `type` any package.json declares.
 */

const path = require("node:path");
const fs = require("node:fs");

const DEPLOY_PATH = __dirname;
const ENV_FILE = path.join(DEPLOY_PATH, ".env");

/**
 * Loads runtime secrets from $DEPLOY_PATH/.env.
 *
 * Secrets are read here, at start time on the server, rather than baked into
 * the build. That is deliberate: a value compiled into the bundle would be
 * present in CI artifacts, in build logs and in every old release directory.
 * Rotating a token should mean editing one file and reloading, not rebuilding.
 *
 * Only `NEXT_PUBLIC_*` values need to exist at build time, and those are not
 * secret by definition.
 */
function loadEnv() {
  if (!fs.existsSync(ENV_FILE)) return {};

  const env = {};

  for (const rawLine of fs.readFileSync(ENV_FILE, "utf8").split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const separator = line.indexOf("=");
    if (separator === -1) continue;

    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();

    // Strip one layer of matching quotes, which people add out of habit.
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (key) env[key] = value;
  }

  return env;
}

module.exports = {
  apps: [
    {
      name: "portfolio",

      // Always the symlink, never a release path. PM2 resolves it at spawn
      // time, so a reload picks up whatever `current` points at — which is
      // what makes the symlink swap the actual deployment step.
      script: path.join(DEPLOY_PATH, "current", "server.js"),
      cwd: path.join(DEPLOY_PATH, "current"),

      // Next's standalone server is a single Node process. Cluster mode runs
      // one per core behind PM2's load balancer and is what makes `reload`
      // zero-downtime: instances are replaced one at a time.
      exec_mode: "cluster",
      instances: 2,

      env: {
        NODE_ENV: "production",
        // Nginx proxies to this. Not exposed publicly — see the Nginx config.
        PORT: 3000,
        HOSTNAME: "127.0.0.1",
        ...loadEnv(),
      },

      // Restart policy. `max_restarts` with `min_uptime` stops PM2 from
      // hammering a process that crashes instantly on boot — a misconfigured
      // env var should surface as a stopped app, not an infinite loop.
      autorestart: true,
      min_uptime: "20s",
      max_restarts: 5,
      restart_delay: 2000,

      // Restart if the process leaks past this. A Next server on a small VPS
      // sits well under it, so tripping this means something is wrong.
      max_memory_restart: "512M",

      // Give in-flight requests time to finish during a reload.
      kill_timeout: 5000,
      listen_timeout: 10000,
      // Requires `process.send('ready')` — Next does not send it, so PM2 waits
      // for the port to accept connections instead.
      wait_ready: false,

      merge_logs: true,
      time: true,
      out_file: path.join(DEPLOY_PATH, "logs", "out.log"),
      error_file: path.join(DEPLOY_PATH, "logs", "error.log"),

      // Never watch files in production: a deploy touches hundreds at once and
      // would trigger a restart storm mid-rsync.
      watch: false,
    },
  ],
};
