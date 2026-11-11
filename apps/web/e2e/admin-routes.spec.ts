import { expect, test } from "@playwright/test";

const adminRoutes = [
  "/admin",
  "/admin/access",
  "/admin/vendors",
  "/admin/customers",
  "/admin/orders",
  "/admin/disputes",
  "/admin/moderation",
  "/admin/delivery",
  "/admin/finance",
  "/admin/analytics",
  "/admin/roles",
  "/admin/audit",
  "/admin/settings",
] as const;

for (const route of adminRoutes) {
  test(`${route} renders responsively without application errors`, async ({ page }) => {
    const response = await page.goto(route);
    expect(response?.ok()).toBe(true);
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.locator("body")).not.toContainText("Application error");
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  });
}

test("admin operations stay local and truthful", async ({ page }) => {
  await page.goto("/admin/vendors");
  await page.getByRole("button", { name: "Approve preview" }).click();
  await expect(page.getByRole("status")).toContainText("updated locally");

  await page.goto("/admin/disputes");
  await page.getByRole("button", { name: "Resolve preview" }).click();
  await expect(page.getByRole("status")).toContainText(/resolved locally; no refund was issued/i);

  await page.goto("/admin/finance");
  await expect(page.locator("main")).toContainText(/no settlement, refund, or payout transfer is connected/i);
});

test("admin settings and mobile navigation are accessible", async ({ page, isMobile }) => {
  await page.goto("/admin/settings");
  await expect(page.getByLabel("Support email")).toBeVisible();
  await expect(page.getByLabel("Customer service-fee label")).toBeVisible();
  if (isMobile) {
    const more = page.getByRole("button", { name: "More" });
    await more.click();
    await expect(page.getByRole("link", { name: "Finance" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Settings" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("navigation", { name: "More admin pages" })).toHaveCount(0);
    await expect(more).toBeFocused();
  }
});
