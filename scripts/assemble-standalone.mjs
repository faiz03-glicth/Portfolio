#!/usr/bin/env node
/**
 * Assembles the standalone server bundle into something runnable.
 *
 * `output: "standalone"` emits `.next/standalone/server.js` with only the
 * dependencies it actually traced — but it deliberately does *not* copy the
 * static assets, because a real deployment often serves those from a CDN.
 *
 * For a single VPS behind Nginx there is no CDN, so the Node process serves
 * them itself and they have to be placed where it expects:
 *
 *   .next/standalone/.next/static   ← from .next/static
 *   .next/standalone/public         ← from public
 *
 * Skipping this is the classic standalone deployment failure: the HTML renders
 * and every stylesheet and script 404s.
 *
 * Run by `npm run build:standalone`, by the E2E suite, and by CI before
 * packaging the deploy artifact — so all three exercise the same layout that
 * production runs.
 */

import { cp, access, rm } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const standalone = path.join(root, ".next", "standalone");

async function exists(target) {
  try {
    await access(target, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function copyInto(from, to, label) {
  if (!(await exists(from))) {
    console.log(`  skip   ${label} (not present)`);
    return;
  }

  // Remove first: `cp` with `force` merges rather than replaces, which would
  // leave deleted assets behind from an earlier build.
  await rm(to, { recursive: true, force: true });
  await cp(from, to, { recursive: true });
  console.log(`  copied ${label}`);
}

async function main() {
  if (!(await exists(standalone))) {
    console.error(
      "\n  .next/standalone does not exist. Run `npm run build` first,\n" +
        '  and check that next.config.mjs still sets output: "standalone".\n',
    );
    process.exit(1);
  }

  console.log("\n  Assembling standalone bundle:");

  await copyInto(
    path.join(root, ".next", "static"),
    path.join(standalone, ".next", "static"),
    ".next/static",
  );

  await copyInto(
    path.join(root, "public"),
    path.join(standalone, "public"),
    "public",
  );

  console.log("\n  Run it with: node .next/standalone/server.js\n");
}

await main();
