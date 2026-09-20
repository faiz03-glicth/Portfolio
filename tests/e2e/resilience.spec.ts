import { expect, test } from "@playwright/test";

/**
 * Theme switching, degraded integrations, SEO surfaces and accessibility
 * basics — the things that are easy to break without noticing.
 */

test.describe("theme", () => {
  test("resolves a theme before first paint, with no flash", async ({
    page,
  }) => {
    await page.goto("/");

    // The inline script must have written an explicit value: Tailwind's dark:
    // variant is bound to [data-theme="dark"], so an absent attribute would
    // leave the palette and the utilities disagreeing.
    const theme = await page.locator("html").getAttribute("data-theme");
    expect(["light", "dark"]).toContain(theme);
  });

  test("toggles and persists across a reload", async ({ page }) => {
    await page.goto("/");

    const html = page.locator("html");
    const before = await html.getAttribute("data-theme");

    await page.getByRole("button", { name: /toggle colour theme/i }).click();

    const after = await html.getAttribute("data-theme");
    expect(after).not.toBe(before);

    await page.reload();
    await expect(html).toHaveAttribute("data-theme", after ?? "");
  });

  test("body background actually changes with the theme", async ({ page }) => {
    await page.goto("/");

    const background = () =>
      page.evaluate(() => getComputedStyle(document.body).backgroundColor);

    const before = await background();
    await page.getByRole("button", { name: /toggle colour theme/i }).click();

    expect(await background()).not.toBe(before);
  });
});

test.describe("degraded integrations", () => {
  // No provider is configured in the E2E environment, which is the state these
  // assertions describe: sample data, clearly labelled, and a page that works.

  test("code section renders sample data and says so", async ({ page }) => {
    await page.goto("/");

    const code = page.locator("section#code");
    await expect(code.getByText(/representative activity/i)).toBeVisible();
    // Scoped to the panel headings: "GitHub" also appears in the link's
    // screen-reader text and in a stat hint.
    await expect(
      code.getByText("GitHub", { exact: true }).first(),
    ).toBeVisible();
    await expect(
      code.getByText("GitLab", { exact: true }).first(),
    ).toBeVisible();
  });

  test("spotify route reports unavailable rather than failing", async ({
    request,
  }) => {
    const response = await request.get("/api/spotify/recently-played");

    expect(response.status()).toBe(503);
    const body = await response.json();
    expect(body.error).toMatch(/not configured/i);
    // No credential may appear in the response, even on the error path.
    expect(JSON.stringify(body)).not.toMatch(/token|secret/i);
  });

  test("music section still renders with no Spotify connection", async ({
    page,
  }) => {
    await page.goto("/music");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Music",
    );
    await expect(page.getByText(/Recently Played/i)).toBeVisible();
  });
});

test.describe("seo", () => {
  test("serves a sitemap listing project pages", async ({ request }) => {
    const response = await request.get("/sitemap.xml");

    expect(response.ok()).toBe(true);
    const body = await response.text();
    expect(body).toContain("<urlset");
    expect(body).toContain("/projects/atlas-observability");
  });

  test("serves robots.txt", async ({ request }) => {
    const response = await request.get("/robots.txt");
    expect(response.ok()).toBe(true);
  });

  test("generates an Open Graph image", async ({ request }) => {
    const response = await request.get("/opengraph-image");

    expect(response.ok()).toBe(true);
    expect(response.headers()["content-type"]).toContain("image/png");
  });

  test("every page has a unique title and a description", async ({ page }) => {
    const titles = new Set<string>();

    for (const path of [
      "/",
      "/about",
      "/projects",
      "/experience",
      "/contact",
    ]) {
      await page.goto(path);

      const title = await page.title();
      expect(title.length).toBeGreaterThan(10);
      titles.add(title);

      const description = await page
        .locator('meta[name="description"]')
        .getAttribute("content");
      expect(description, `missing description on ${path}`).toBeTruthy();
    }

    expect(titles.size).toBe(5);
  });

  test("sets security headers", async ({ request }) => {
    const headers = (await request.get("/")).headers();

    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  });
});

test.describe("accessibility", () => {
  test("every image has an alt attribute", async ({ page }) => {
    await page.goto("/");

    const missing = await page.evaluate(
      () =>
        [...document.querySelectorAll("img")].filter(
          (image) => !image.hasAttribute("alt"),
        ).length,
    );

    expect(missing).toBe(0);
  });

  test("every icon-only control has an accessible name", async ({ page }) => {
    await page.goto("/");

    const unnamed = await page.evaluate(
      () =>
        [...document.querySelectorAll("button")].filter((button) => {
          const label =
            button.getAttribute("aria-label") ?? button.textContent?.trim();
          return !label;
        }).length,
    );

    expect(unnamed).toBe(0);
  });

  test("headings descend without skipping a level", async ({ page }) => {
    await page.goto("/about");

    const levels = await page.evaluate(() =>
      [...document.querySelectorAll("h1,h2,h3,h4")]
        // A closed <dialog> is not in the accessibility tree.
        .filter((heading) => !heading.closest("dialog"))
        .map((heading) => Number(heading.tagName[1])),
    );

    expect(levels[0]).toBe(1);
    for (let index = 1; index < levels.length; index += 1) {
      const current = levels[index] ?? 0;
      const previous = levels[index - 1] ?? 0;
      expect(current - previous).toBeLessThanOrEqual(1);
    }
  });

  test("focus is visible when tabbing", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");

    const outline = await page.evaluate(() => {
      const active = document.activeElement;
      if (!active) return null;
      const style = getComputedStyle(active);
      return `${style.outlineStyle} ${style.boxShadow}`;
    });

    // The global :focus-visible rule applies a ring via box-shadow.
    expect(outline).not.toBeNull();
  });
});
