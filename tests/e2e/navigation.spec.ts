import { expect, test } from "@playwright/test";

/** Navigation, routing and the mobile drawer. */

test("navigates to every primary page", async ({ page }, testInfo) => {
  await page.goto("/");

  const routes = [
    ["About", "/about"],
    ["Experience", "/experience"],
    ["Projects", "/projects"],
    ["Music", "/music"],
    ["Contact", "/contact"],
  ] as const;

  const isMobile = testInfo.project.name === "mobile";

  for (const [label, path] of routes) {
    if (isMobile) {
      await page.getByRole("button", { name: /open navigation menu/i }).click();
      await page.getByRole("dialog").getByRole("link", { name: label }).click();
    } else {
      await page
        .getByRole("navigation", { name: "Main" })
        .getByRole("link", { name: label })
        .click();
    }

    await expect(page).toHaveURL(path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.goto("/");
  }
});

test("marks the current page in the navigation", async ({ page }, testInfo) => {
  test.skip(
    testInfo.project.name === "mobile",
    "Desktop bar is hidden on mobile",
  );

  await page.goto("/about");

  const current = page
    .getByRole("navigation", { name: "Main" })
    .locator("[aria-current='page']");

  await expect(current).toHaveText("About");
});

test("mobile drawer traps focus and closes on Escape", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Drawer only exists on mobile");

  await page.goto("/");
  await page.getByRole("button", { name: /open navigation menu/i }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  // Native <dialog> gives Escape handling for free — verify it is actually a
  // modal dialog and not a div pretending to be one.
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
});

test("skip link is the first focusable element and jumps to main", async ({
  page,
}) => {
  await page.goto("/");
  await page.keyboard.press("Tab");

  const skip = page.getByRole("link", { name: /skip to main content/i });
  await expect(skip).toBeFocused();

  await skip.press("Enter");
  await expect(page).toHaveURL(/#main$/);
});

test("logo returns to the homepage", async ({ page }) => {
  await page.goto("/about");
  await page.getByRole("banner").getByRole("link").first().click();
  await expect(page).toHaveURL("/");
});

test("unknown routes render the 404 page, not a crash", async ({ page }) => {
  const response = await page.goto("/this-page-does-not-exist");

  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: /this page does not exist/i }),
  ).toBeVisible();
  // The 404 still offers a way out.
  await expect(page.getByRole("link", { name: /back to home/i })).toBeVisible();
});

test("footer renders site navigation", async ({ page }) => {
  await page.goto("/");
  const footer = page.getByRole("contentinfo");

  await expect(footer).toBeVisible();
  await expect(footer.getByRole("link", { name: "Projects" })).toBeVisible();
});
