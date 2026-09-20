import { expect, test } from "@playwright/test";

/**
 * Homepage.
 *
 * These run against a production build with **no** external providers
 * configured, which is deliberate: an E2E suite that needs GitHub, Spotify or
 * Supabase to be reachable is a suite that fails for reasons unrelated to the
 * code. This is also exactly the degraded path the architecture promises works.
 */

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("renders the hero with a single h1", async ({ page }) => {
  const headings = page.getByRole("heading", { level: 1 });
  await expect(headings).toHaveCount(1);
  await expect(headings).toContainText("Ahmad Faiz");
});

test("renders every content section", async ({ page }) => {
  for (const id of [
    "about",
    "stack",
    "projects",
    "experience",
    "code",
    "music",
    "contact",
  ]) {
    await expect(page.locator(`section#${id}`)).toBeVisible();
  }
});

test("renders featured project cards with working repository links", async ({
  page,
}) => {
  const section = page.locator("section#projects");
  const cards = section
    .getByRole("listitem")
    .filter({ has: page.getByRole("heading", { level: 3 }) });

  await expect(cards.first()).toBeVisible();

  const firstLink = section.getByRole("link", { name: /GitHub for/i }).first();
  await expect(firstLink).toHaveAttribute("href", /github\.com/);
  await expect(firstLink).toHaveAttribute("target", "_blank");
  // Without noopener the opened page can reach back through window.opener.
  await expect(firstLink).toHaveAttribute("rel", /noopener/);
});

test("renders the contribution heatmap as one labelled image, not 371 cells", async ({
  page,
}) => {
  // A per-cell label would flood a screen reader with a year of noise.
  const heatmap = page.getByRole("img", { name: /Contribution calendar/i });
  await expect(heatmap.first()).toBeVisible();
});

test("shows recently played tracks with played-at times", async ({ page }) => {
  const music = page.locator("section#music");
  await expect(music.getByText(/Recently Played/i)).toBeVisible();
  await expect(music.locator("time").first()).toBeVisible();
});

test("has no console errors on load", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  // Deliberately not `waitUntil: "networkidle"` — Playwright discourages it
  // and it is genuinely flaky here, timing out on a page that has plainly
  // rendered. Waiting for the last section to be visible is a real signal that
  // the page is done, rather than a guess about network quiet.
  await page.goto("/");
  await expect(page.locator("section#contact")).toBeVisible();

  expect(errors).toEqual([]);
});

test("does not scroll horizontally at any width", async ({ page }) => {
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );

    expect(overflow, `horizontal overflow at ${width}px`).toBe(false);
  }
});
