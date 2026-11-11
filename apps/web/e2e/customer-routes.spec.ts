import { expect, test } from "@playwright/test";

const customerRoutes = [
  "/discover",
  "/search",
  "/search/results?q=jollof",
  "/categories/rice",
  "/k/amakas-kitchen",
  "/dishes/dish-jollof-chicken",
  "/drops/drop-sunday-jollof",
  "/saved",
  "/following",
  "/notifications",
  "/cart",
  "/checkout",
  "/checkout/payment-result",
  "/orders/confirmation/order-mh-20481",
  "/orders",
  "/orders/order-mh-20481",
  "/orders/order-mh-19733/review",
  "/support",
  "/support/disputes/new",
  "/auth",
  "/profile",
  "/profile/addresses",
  "/profile/settings",
] as const;

for (const route of customerRoutes) {
  test(`${route} renders its customer page`, async ({ page }) => {
    const response = await page.goto(route);
    expect(response?.ok()).toBe(true);
    await expect(page.locator("h1").first()).toBeAttached();
    await expect(page.locator("body")).not.toContainText("Application error");

    const horizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(horizontalOverflow).toBeLessThanOrEqual(1);
  });
}

test("the approved Manrope font is available", async ({ page }) => {
  await page.goto("/discover");
  await expect.poll(() => page.evaluate(() => document.fonts.check('16px "Manrope"'))).toBe(true);
});

test("dynamic discovery records never leak the Jollof fixture", async ({ page }) => {
  await page.goto("/dishes/dish-egusi");
  await expect(page.getByRole("heading", { level: 1, name: /Egusi/ })).toBeVisible();
  await expect(page.locator("main")).not.toContainText("Jollof Rice & Chicken");

  await page.goto("/drops/drop-saturday-bakery");
  await expect(page.getByRole("heading", { level: 1, name: /Saturday Bakery Drop/ })).toBeVisible();
  await expect(page.getByRole("button", { name: "Cutoff passed" })).toBeDisabled();

  await page.goto("/k/butter-and-crumb");
  await expect(page.getByRole("heading", { level: 1, name: /Butter & Crumb/ })).toBeVisible();
  await expect(page.locator("main")).toContainText(/pickup/i);
  await expect(page.locator("main")).not.toContainText("Sunday Party Jollof");
});

test("search, category and order routes respect their requested records", async ({ page }) => {
  await page.goto("/search/results?q=zzzz-no-match");
  await expect(page.getByRole("heading", { name: /No matches for/ })).toBeVisible();
  await expect(page.locator("main")).not.toContainText("Jollof Rice & Chicken");

  await page.goto("/categories/bakes");
  await expect(page.getByRole("heading", { level: 1, name: "Bakes & snacks" })).toBeVisible();
  await expect(page.locator("main")).toContainText(/Bakery/);
  await expect(page.locator("main")).not.toContainText("Jollof Rice & Chicken");

  await page.goto("/orders/confirmation/not-a-real-order");
  await expect(page.getByRole("heading", { name: "We couldn’t find that page" })).toBeVisible();
  await page.goto("/orders/not-a-real-order/review");
  await expect(page.getByRole("heading", { name: "We couldn’t find that page" })).toBeVisible();
});

test("dialogs restore focus and keep invalid address forms open", async ({ page }) => {
  await page.goto("/profile/addresses");
  const addAddress = page.getByRole("button", { name: "Add address" });
  await addAddress.click();
  await page.getByRole("button", { name: "Save address" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Review this address" })).toBeFocused();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Close address form" }).click();
  await expect(addAddress).toBeFocused();

  await page.goto("/discover");
  const location = page.getByRole("button", { name: /Delivering to Ikotun/ }).first();
  await location.click();
  await page.getByRole("button", { name: "Close location" }).click();
  await expect(location).toBeFocused();
});

test("payment preview progresses without exposing internal states", async ({ page }) => {
  await page.goto("/checkout/payment-result");
  await expect(page.getByRole("heading", { name: "Processing your payment preview" })).toBeVisible();
  await expect(page.getByRole("tablist")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Payment preview complete" })).toBeVisible();
  await expect(page.getByRole("link", { name: "View order confirmation" })).toBeVisible();
});

test("payment preview retains a recoverable demo failure state", async ({ page }) => {
  await page.goto("/checkout/payment-result?demo=failed");
  await expect(page.getByRole("heading", { name: "Payment preview was not completed" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Try preview again" })).toBeVisible();
});

test("delivery area persists into server-rendered eligibility", async ({ page }) => {
  await page.goto("/discover");
  await page.getByRole("button", { name: /Delivering to Ikotun/ }).click();
  await page.getByRole("combobox", { name: "Area" }).selectOption("Ikeja");
  await page.getByRole("button", { name: "Use Ikeja" }).click();
  await page.goto("/k/amakas-kitchen");
  await expect(page.locator("main")).toContainText(/outside|does not.*deliver|unavailable/i);
});

test("cart edits remain authoritative through checkout and pickup", async ({ page }) => {
  await page.goto("/dishes/dish-jollof-chicken");
  await page.getByRole("button", { name: "Increase quantity" }).click();
  await page.getByRole("button", { name: "Add to order" }).click();
  await expect(page.getByRole("link", { name: "Cart with 2 items" })).toBeVisible();

  await page.goto("/cart");
  await expect(page.getByRole("heading", { name: "Amaka's Kitchen" })).toBeVisible();
  await expect(page.getByText("₦7,000").first()).toBeVisible();
  await page.getByRole("button", { name: /Increase Jollof Rice & Chicken quantity/ }).click();

  await page.getByRole("link", { name: "Continue to checkout" }).click();
  await expect(page.getByText("Qty 3")).toBeVisible();
  await expect(page.getByText("₦11,950")).toBeVisible();
  await page.getByRole("radio", { name: /Pickup/ }).check();
  await expect(page.getByRole("heading", { name: "Delivery address" })).toHaveCount(0);
  await expect(page.getByText("₦10,750")).toBeVisible();
  await page.getByRole("button", { name: "Continue to simulated payment" }).click();
  await expect(page.getByRole("heading", { name: "Processing your payment preview" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Payment preview complete" })).toBeVisible();
  await page.getByRole("link", { name: "View order confirmation" }).click();
  await expect(page.getByRole("heading", { name: "Amaka's Kitchen has your preview order" })).toBeVisible();
  await expect(page.getByText("₦10,750")).toBeVisible();
  await expect(page.getByText("Pickup")).toBeVisible();
});

test("expired drops and order receipts expose truthful totals", async ({ page }) => {
  await page.goto("/drops/drop-sunday-jollof");
  await expect(page.getByRole("button", { name: "Cutoff passed" })).toBeDisabled();
  await page.goto("/orders/confirmation/order-mh-20481");
  await expect(page.getByText("₦4,950")).toBeVisible();
});
