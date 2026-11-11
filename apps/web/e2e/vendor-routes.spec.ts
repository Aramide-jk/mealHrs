import { expect, test } from "@playwright/test";

const vendorRoutes = [
  "/vendor",
  "/vendor/onboarding",
  "/vendor/orders",
  "/vendor/menu",
  "/vendor/drops",
  "/vendor/content",
  "/vendor/delivery",
  "/vendor/earnings",
  "/vendor/analytics",
  "/vendor/storefront",
  "/vendor/settings",
] as const;

for (const route of vendorRoutes) {
  test(`${route} renders without customer-shell leakage or horizontal overflow`, async ({ page }) => {
    const response = await page.goto(route);
    expect(response?.ok()).toBe(true);
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.locator("body")).not.toContainText("Application error");
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  });
}

test("vendor operational previews remain local and separate", async ({ page, isMobile }) => {
  await page.goto("/vendor");
  await page.getByRole("button", { name: "Pause orders" }).click();
  await expect(page.getByText("Orders paused")).toBeVisible();

  await page.goto("/vendor/orders");
  await expect(page.getByRole("region", { name: "Order status summary" })).toContainText("New");
  await expect(page.getByRole("region", { name: "Order status summary" })).toContainText("Due soon");
  await expect(page.getByText("Placed 14 min ago")).toBeVisible();
  await expect(page.getByText("Paid — frontend preview").first()).toBeVisible();
  const orderStatus = page.getByRole("combobox", { name: "Order status" });
  await expect(orderStatus).toHaveValue("all");
  await orderStatus.selectOption("preparing");
  await expect(page.getByRole("tabpanel")).toContainText("Teni Adebayo");
  await orderStatus.selectOption("all");
  await page.getByLabel("Sort orders").selectOption("priority");
  await expect(page.getByLabel("Sort orders")).toHaveValue("priority");
  await page.getByRole("button", { name: "Delivery" }).click();
  await expect(page.getByRole("tabpanel")).toContainText("Delivery");
  await page.getByPlaceholder("Search order, customer or meal").fill("no matching meal");
  await expect(page.getByRole("heading", { name: "No matching immediate orders" })).toBeVisible();
  await page.getByPlaceholder("Search order, customer or meal").fill("");
  await page.getByRole("button", { name: "All fulfilment" }).click();
  const details = page.getByRole("button", { name: "Details" }).first();
  await details.click();
  if (isMobile) {
    const dialog = page.getByRole("dialog", { name: "Order MH-20481" });
    await expect(dialog).toContainText("Items");
    await expect(dialog).toContainText("Extra: Fried plantain");
    await expect(dialog).toContainText("Contact controls are preview-only; no call or message is sent.");
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(details).toBeFocused();
  } else {
    const panel = page.getByRole("complementary", { name: "Selected order details" });
    await expect(panel).toContainText("Order MH-20481");
    await expect(panel).toContainText("Teni Adebayo");
    await expect(panel).toContainText("Delivery address");
    await expect(panel).toContainText("Fulfilment timeline");
    await expect(page.getByRole("dialog")).toHaveCount(0);
  }
  const advanceOrder = isMobile
    ? page.getByRole("tabpanel").getByRole("button", { name: "Mark ready" })
    : page.getByRole("complementary", { name: "Selected order details" }).getByRole("button", { name: "Mark ready" });
  await advanceOrder.click();
  await expect(page.getByRole("status")).toContainText(/marked ready in this frontend preview only/i);
  await expect(page.getByRole("region", { name: "Order status summary" })).toContainText("Ready");
  if (!isMobile) await expect(page.getByRole("complementary", { name: "Selected order details" })).toContainText("ready");
  await page.getByRole("tab", { name: /Meal Drops/ }).click();
  await expect(page.getByText("Pre-ordered yesterday")).toBeVisible();
  await expect(page.getByRole("region", { name: "Meal Drop preparation summary" })).toContainText("Batch prep starts Sunday, 11:30 AM");
  await expect(page.getByRole("region", { name: "Meal Drop preparation summary" })).toContainText("23 of 40 portions reserved");
  await expect(page.getByRole("region", { name: "Meal Drop preparation summary" })).toContainText("2 portions to prepare");
  await page.getByRole("tab", { name: /Immediate/ }).click();
  await expect(page.getByRole("tabpanel")).toContainText("Teni Adebayo");
  const immediate = page.getByRole("tab", { name: /Immediate/ });
  await immediate.focus();
  await immediate.press("ArrowRight");
  const dropsTab = page.getByRole("tab", { name: /Meal Drops/ });
  await expect(dropsTab).toHaveAttribute("aria-selected", "true");
  await expect(dropsTab).toBeFocused();
  await expect(page.getByRole("tabpanel")).toContainText("MH-D118");
  await expect(page.locator("main")).not.toContainText("Chidera Okafor");

  await page.goto("/vendor/drops");
  await expect(page.getByRole("button", { name: "Cutoff passed" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Close pre-orders" })).toHaveCount(0);

  await page.goto("/vendor/earnings");
  await expect(page.locator("main")).toContainText(/no payout transfer is connected/i);
});

test("vendor content and delivery controls provide frontend feedback", async ({ page }) => {
  await page.goto("/vendor/content");
  await page.getByRole("button", { name: /Publish preview/ }).click();
  await expect(page.getByText("Published in this frontend preview")).toBeVisible();

  await page.goto("/vendor/delivery");
  const zone = page.getByRole("button", { name: /Pause Ikotun delivery/ });
  await zone.click();
  await expect(page.getByRole("button", { name: /Enable Ikotun delivery/ })).toHaveAttribute("aria-pressed", "false");
});

test("vendor menu renders compact dish cards and adds a local preview dish", async ({ page }) => {
  await page.goto("/vendor/menu");
  await expect(page.getByRole("region", { name: "Immediate menu dishes" })).toContainText("Jollof Rice & Chicken");
  await page.getByRole("button", { name: "Add dish" }).click();
  await page.getByLabel("Dish name").fill("Catfish pepper soup");
  await page.getByLabel("Price (₦)").fill("4200");
  await page.getByRole("button", { name: "Add to preview menu" }).click();
  await expect(page.getByRole("status")).toContainText("Catfish pepper soup was added to this frontend preview only.");
  await expect(page.getByRole("region", { name: "Immediate menu dishes" })).toContainText("Catfish pepper soup");
  await expect(page.getByLabel("Set Catfish pepper soup availability")).toBeChecked();
});

test("vendor forms and mobile navigation remain reachable and labelled", async ({ page, isMobile }) => {
  await page.goto("/vendor/storefront");
  await expect(page.getByLabel("Kitchen name")).toBeVisible();
  await expect(page.getByLabel("Kitchen story")).toBeVisible();
  if (isMobile) {
    await page.getByRole("button", { name: "More" }).click();
    await expect(page.getByRole("link", { name: "Delivery" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Settings" })).toBeVisible();
  }
});
