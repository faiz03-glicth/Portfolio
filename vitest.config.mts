import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

/**
 * Unit and integration tests.
 *
 * Environment is `node`, not `jsdom`: everything tested here is pure logic —
 * mappers, formatters, error classification, route handlers. Rendering is
 * covered by Playwright against a real browser, which tests what actually
 * ships rather than a DOM emulation of it.
 */
export default defineConfig({
  test: {
    environment: "node",
    globals: false,
    include: ["tests/unit/**/*.test.ts", "tests/integration/**/*.test.ts"],
    // Playwright owns tests/e2e and has its own runner.
    exclude: ["tests/e2e/**", "node_modules/**", ".next/**"],
    coverage: {
      provider: "v8",
      // `cobertura` is what GitLab's coverage_report parses; `text` is what
      // a human reads in the job log.
      reporter: ["text", "lcov", "cobertura"],
      reportsDirectory: "coverage",
      include: ["src/lib/**/*.ts", "src/config/**/*.ts", "src/styles/*.ts"],
      exclude: ["src/lib/types/**", "**/index.ts", "**/*.d.ts"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(projectRoot, "./src"),
      // `server-only` throws unless resolved under React's `react-server`
      // condition, which Vitest does not set. The real package is still used
      // by `next build`, so the build-time guarantee is unaffected.
      "server-only": path.resolve(projectRoot, "./tests/stubs/server-only.ts"),
    },
  },
});
