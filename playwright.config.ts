import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests.
 *
 * Runs against the **standalone** production server — the exact artifact the
 * Hostinger VPS runs under PM2.
 *
 * Not the dev server, because dev-only behaviour (Strict Mode double-renders,
 * unminified output, no prerendering) is not what ships. And not `next start`
 * either: that is unsupported with `output: "standalone"` and serves subtly
 * different behaviour, which is how a 404 route quietly started answering 200.
 */
const PORT = Number(process.env.E2E_PORT ?? 3100);
const baseURL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  // A failing assertion should not hang the pipeline for minutes.
  timeout: 30_000,
  expect: { timeout: 5_000 },

  fullyParallel: true,
  // Fail the build if a .only was committed.
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,

  reporter: process.env.CI
    ? [["list"], ["junit", { outputFile: "playwright-report/results.xml" }]]
    : [["list"]],

  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    // One mobile profile: the layout has real breakpoint behaviour (drawer
    // navigation, single-column grids) that desktop Chrome never exercises.
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],

  webServer: {
    // Starts the already-assembled bundle. Building is `npm run test:e2e`'s
    // job locally and a separate CI stage in the pipeline, so the build
    // artifact is produced once rather than per Playwright project.
    command: "node .next/standalone/server.js",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      // Tests assert on the static content, so external providers are left
      // unconfigured deliberately — an E2E run must not depend on GitHub,
      // GitLab, Spotify or Supabase being reachable.
      NEXT_PUBLIC_APP_ENV: "testing",
      PORT: String(PORT),
      HOSTNAME: "127.0.0.1",
    },
  },
});
