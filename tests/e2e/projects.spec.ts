import { expect, test } from "@playwright/test";

/** Projects listing, filtering and detail pages. */

test("lists projects", async ({ page }) => {
  await page.goto("/projects");

  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Projects",
  );
  await expect(page.getByRole("heading", { level: 3 }).first()).toBeVisible();
});

test("filters by type through the URL, with no JavaScript required", async ({
  page,
}) => {
  await page.goto("/projects");

  const filter = page.getByRole("navigation", { name: /filter projects/i });
  await expect(filter).toBeVisible();

  const before = await page.getByRole("heading", { level: 3 }).count();

  await filter.getByRole("link", { name: /^API/ }).click();
  await expect(page).toHaveURL(/\?type=api/);

  const after = await page.getByRole("heading", { level: 3 }).count();
  expect(after).toBeLessThan(before);
  expect(after).toBeGreaterThan(0);
});

test("marks the active filter for assistive technology", async ({ page }) => {
  await page.goto("/projects?type=api");

  const active = page
    .getByRole("navigation", { name: /filter projects/i })
    .locator("[aria-current='true']");

  await expect(active).toContainText("API");
});

test("ignores an unknown filter rather than 404-ing", async ({ page }) => {
  // A stale shared link should still land somewhere useful.
  const response = await page.goto("/projects?type=not-a-real-type");

  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 3 }).first()).toBeVisible();
});

test("opens a project detail page from a card", async ({ page }) => {
  await page.goto("/projects");

  const title = page.getByRole("heading", { level: 3 }).first();
  const name = (await title.textContent())?.trim();

  await title.getByRole("link").click();

  await expect(page).toHaveURL(/\/projects\/[a-z0-9-]+$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    name ?? "",
  );
});

test("detail page shows the write-up, technologies and links", async ({
  page,
}) => {
  await page.goto("/projects/atlas-observability");

  await expect(page.getByRole("heading", { level: 1 })).toContainText("Atlas");
  await expect(
    page.getByRole("heading", { name: /notable details/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /built with/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /GitHub for Atlas/i }).first(),
  ).toBeVisible();
});

test("detail page links back to the listing", async ({ page }) => {
  await page.goto("/projects/atlas-observability");
  await page.getByRole("link", { name: /all projects/i }).click();
  await expect(page).toHaveURL("/projects");
});

test("a project without a write-up says so instead of rendering blank", async ({
  page,
}) => {
  await page.goto("/projects/driftwood-migrations");

  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Driftwood",
  );
  await expect(page.getByText(/has not been published yet/i)).toBeVisible();
});

test("an unknown project slug 404s", async ({ page }) => {
  const response = await page.goto("/projects/no-such-project");
  expect(response?.status()).toBe(404);
});
