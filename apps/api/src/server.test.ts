import { describe, expect, it, beforeAll, afterAll } from "vitest";
import crypto from "node:crypto";
import { buildServer } from "./server";
import { seedDatabase } from "./db/seed";
import type { FastifyInstance } from "fastify";

describe("API End-to-End Endpoint Verification", () => {
  let app: FastifyInstance;
  const paystackSecret = "mealhrs_paystack_secret_key_prod";

  beforeAll(async () => {
    await seedDatabase();
    app = buildServer();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /v1/health: returns healthy service heartbeat", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/v1/health",
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.status).toBe("ok");
    expect(body.service).toBe("mealhrs-api");
  });

  it("GET /v1/discovery/feed: returns social reels & meals from active kitchens across modes", async () => {
    // Mode: for_you
    const resForYou = await app.inject({
      method: "GET",
      url: "/v1/discovery/feed?mode=for_you",
    });
    expect(resForYou.statusCode).toBe(200);
    const bodyForYou = JSON.parse(resForYou.body);
    expect(bodyForYou.items.length).toBeGreaterThanOrEqual(1);

    // Mode: following
    const resFollowing = await app.inject({
      method: "GET",
      url: "/v1/discovery/feed?mode=following",
    });
    expect(resFollowing.statusCode).toBe(200);
    const bodyFollowing = JSON.parse(resFollowing.body);
    expect(bodyFollowing.items.length).toBeLessThanOrEqual(2);

    // Mode: near_me in unsupported area
    const resNearMe = await app.inject({
      method: "GET",
      url: "/v1/discovery/feed?mode=near_me&areaId=area-ikeja",
    });
    expect(resNearMe.statusCode).toBe(200);
    expect(JSON.parse(resNearMe.body).items.length).toBe(0);
  });

  it("GET /v1/discovery/saved-posts & followed-vendors: returns user bookmarks and kitchens", async () => {
    const savedRes = await app.inject({
      method: "GET",
      url: "/v1/discovery/saved-posts",
    });
    expect(savedRes.statusCode).toBe(200);
    expect(JSON.parse(savedRes.body).length).toBeGreaterThanOrEqual(1);

    const followedRes = await app.inject({
      method: "GET",
      url: "/v1/discovery/followed-vendors",
    });
    expect(followedRes.statusCode).toBe(200);
    expect(JSON.parse(followedRes.body).length).toBeGreaterThanOrEqual(1);
  });

  it("GET /v1/discovery/search: searches across vendors and menu dishes", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/v1/discovery/search?query=jollof",
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.dishes.length).toBeGreaterThanOrEqual(1);
    expect(body.dishes[0].dish.name).toContain("Jollof");
  });

  it("GET /v1/catalog/meals: lists all meals and offers across nationwide kitchens", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/v1/catalog/meals",
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.length).toBeGreaterThanOrEqual(1);
    expect(body[0].dish).toBeDefined();
    expect(body[0].offer).toBeDefined();
  });

  it("GET /v1/catalog/vendors/:slug: returns vendor profile or 404 if not found", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/v1/catalog/vendors/amakas-kitchen",
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.slug).toBe("amakas-kitchen");
    expect(body.verified).toBe(true);

    const notFoundRes = await app.inject({
      method: "GET",
      url: "/v1/catalog/vendors/non-existent-vendor-xyz",
    });
    expect(notFoundRes.statusCode).toBe(404);
  });

  it("GET /v1/catalog/vendors/:vendorId/menu & meal-drops: returns vendor's specific catalog", async () => {
    const menuRes = await app.inject({
      method: "GET",
      url: "/v1/catalog/vendors/vendor-amaka/menu",
    });
    expect(menuRes.statusCode).toBe(200);
    const menu = JSON.parse(menuRes.body);
    expect(menu.length).toBeGreaterThanOrEqual(1);

    const dropsRes = await app.inject({
      method: "GET",
      url: "/v1/catalog/vendors/vendor-amaka/meal-drops",
    });
    expect(dropsRes.statusCode).toBe(200);
    const drops = JSON.parse(dropsRes.body);
    expect(drops.length).toBeGreaterThanOrEqual(1);
  });

  it("GET /v1/catalog/dishes/:dishId: returns dish details or 404", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/v1/catalog/dishes/dish-jollof-chicken",
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.dish.name).toContain("Jollof");

    const notFound = await app.inject({
      method: "GET",
      url: "/v1/catalog/dishes/dish-non-existent",
    });
    expect(notFound.statusCode).toBe(404);
  });

  it("GET /v1/catalog/offers/:offerId: returns offer or 404", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/v1/catalog/offers/offer-dish-jollof-chicken",
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.dishId).toBe("dish-jollof-chicken");

    const notFound = await app.inject({
      method: "GET",
      url: "/v1/catalog/offers/offer-unknown-id",
    });
    expect(notFound.statusCode).toBe(404);
  });

  it("GET /v1/catalog/meal-drops/:mealDropId: returns meal drop details or 404", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/v1/catalog/meal-drops/drop-amaka-sunday",
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.mealDrop.name).toContain("Sunday");
    expect(body.dishes.length).toBeGreaterThanOrEqual(1);

    const notFound = await app.inject({
      method: "GET",
      url: "/v1/catalog/meal-drops/drop-unknown",
    });
    expect(notFound.statusCode).toBe(404);
  });

  it("GET /v1/delivery/areas: returns nationwide active coverage hubs", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/v1/delivery/areas",
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.length).toBeGreaterThanOrEqual(6);

    const states = new Set(body.map((h: any) => h.state));
    expect(states.has("Lagos")).toBe(true);
    expect(states.has("Abuja (FCT)")).toBe(true);
  });

  it("GET /v1/delivery/eligibility: returns accurate delivery fee and coverage estimate", async () => {
    // 1. Explicitly eligible zone
    const resEligible = await app.inject({
      method: "GET",
      url: "/v1/delivery/eligibility?vendorId=vendor-amaka&areaId=area-ikotun",
    });
    expect(resEligible.statusCode).toBe(200);
    const bodyEligible = JSON.parse(resEligible.body);
    expect(bodyEligible.status).toBe("eligible");
    expect(bodyEligible.deliveryFee.amount).toBe(800);
    expect(bodyEligible.estimate).toBe("30–45 min");

    // 2. Pickup only vendor
    const resPickup = await app.inject({
      method: "GET",
      url: "/v1/delivery/eligibility?vendorId=vendor-butter-crumb&areaId=area-surulere",
    });
    expect(resPickup.statusCode).toBe(200);
    expect(JSON.parse(resPickup.body).status).toBe("pickup_only");

    // 3. Outside coverage area
    const resOutside = await app.inject({
      method: "GET",
      url: "/v1/delivery/eligibility?vendorId=vendor-amaka&areaId=area-ikeja",
    });
    expect(resOutside.statusCode).toBe(200);
    expect(JSON.parse(resOutside.body).status).toBe("outside_area");
  });

  it("GET /v1/cart: returns customer active cart", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/v1/cart",
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.vendorId).toBe("vendor-amaka");
    expect(body.items.length).toBeGreaterThanOrEqual(1);
  });

  it("GET /v1/account/profile & addresses: returns authenticated customer dossier", async () => {
    const profileRes = await app.inject({
      method: "GET",
      url: "/v1/account/profile",
    });
    expect(profileRes.statusCode).toBe(200);
    const profile = JSON.parse(profileRes.body);
    expect(profile.name).toBe("Teni Adebayo");

    const addressRes = await app.inject({
      method: "GET",
      url: "/v1/account/addresses",
    });
    expect(addressRes.statusCode).toBe(200);
    const addresses = JSON.parse(addressRes.body);
    expect(addresses.length).toBeGreaterThanOrEqual(1);
  });

  it("POST /v1/orders/checkout: writes order to database and returns order confirmation", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/v1/orders/checkout",
      payload: {
        vendorId: "vendor-amaka",
        vendorName: "Amaka's Kitchen",
        totalNgn: 9500,
        subtotalNgn: 8400,
        deliveryFeeNgn: 800,
        packagingFeeNgn: 300,
        fulfillmentMode: "delivery",
        deliveryAddress: "12 Community Road, Ikotun, Lagos",
        items: [
          { name: "Smoky Party Jollof", quantity: 2, unitPrice: 4200 },
        ],
      },
    });

    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(true);
    expect(body.order.reference).toMatch(/^MH-\d+/);
    expect(body.paystackReference).toBeDefined();

    // Verify it persists by querying orders list
    const listRes = await app.inject({
      method: "GET",
      url: "/v1/orders",
    });
    const list = JSON.parse(listRes.body);
    const created = list.find((o: any) => o.reference === body.order.reference);
    expect(created).toBeDefined();
    expect(created.vendorName).toBe("Amaka's Kitchen");

    // Query single order by ID
    const singleRes = await app.inject({
      method: "GET",
      url: `/v1/orders/${body.order.id}`,
    });
    expect(singleRes.statusCode).toBe(200);

    // 404 for unknown order
    const notFoundRes = await app.inject({
      method: "GET",
      url: "/v1/orders/order-non-existent-999",
    });
    expect(notFoundRes.statusCode).toBe(404);
  });

  it("POST /v1/payments/paystack/initialize: generates authorization URL and validates required fields", async () => {
    // Valid initialize
    const res = await app.inject({
      method: "POST",
      url: "/v1/payments/paystack/initialize",
      payload: {
        orderId: "order-test-101",
        email: "customer@example.com",
        amountNgn: 9500,
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.authorizationUrl).toContain("checkout.paystack.com");
    expect(body.reference).toMatch(/^pstk_order-test-101_/);

    // Missing field validation
    const invalidRes = await app.inject({
      method: "POST",
      url: "/v1/payments/paystack/initialize",
      payload: {
        orderId: "order-test-101",
        // missing email and amount
      },
    });
    expect(invalidRes.statusCode).toBe(400);
  });

  it("POST /v1/payments/paystack/webhook: rejects requests with invalid or missing HMAC SHA-512 signature", async () => {
    // 1. Missing signature
    const noSigRes = await app.inject({
      method: "POST",
      url: "/v1/payments/paystack/webhook",
      payload: { event: "charge.success" },
    });
    expect(noSigRes.statusCode).toBe(401);
    expect(JSON.parse(noSigRes.body).error).toContain("Missing");

    // 2. Tampered signature
    const res = await app.inject({
      method: "POST",
      url: "/v1/payments/paystack/webhook",
      headers: {
        "x-paystack-signature": "invalid_tampered_signature_12345",
      },
      payload: {
        event: "charge.success",
        data: { reference: "pstk_fake_ref" },
      },
    });

    expect(res.statusCode).toBe(401);
    const body = JSON.parse(res.body);
    expect(body.error).toBe("Invalid HMAC signature");
  });

  it("POST /v1/payments/paystack/webhook: verifies valid HMAC SHA-512 signature and updates payment status", async () => {
    // 1. Create a checkout order first to get its paystack reference
    const checkoutRes = await app.inject({
      method: "POST",
      url: "/v1/orders/checkout",
      payload: {
        vendorId: "vendor-amaka",
        vendorName: "Amaka's Kitchen",
        totalNgn: 9500,
        subtotalNgn: 8400,
        deliveryFeeNgn: 800,
        packagingFeeNgn: 300,
        fulfillmentMode: "delivery",
        deliveryAddress: "12 Community Road, Ikotun, Lagos",
        items: [{ name: "Smoky Party Jollof", quantity: 2, unitPrice: 4200 }],
      },
    });
    const { order, paystackReference } = JSON.parse(checkoutRes.body);

    // 2. Prepare payload and sign with HMAC SHA-512
    const webhookPayload = {
      event: "charge.success",
      data: {
        reference: paystackReference,
        amount: 950000, // in kobo
        currency: "NGN",
        status: "success",
        customer: { email: "customer@example.com" },
      },
    };
    const rawPayload = JSON.stringify(webhookPayload);
    const validSignature = crypto
      .createHmac("sha512", paystackSecret)
      .update(rawPayload)
      .digest("hex");

    // 3. Send webhook with valid signature
    const webhookRes = await app.inject({
      method: "POST",
      url: "/v1/payments/paystack/webhook",
      headers: {
        "content-type": "application/json",
        "x-paystack-signature": validSignature,
      },
      payload: rawPayload,
    });

    expect(webhookRes.statusCode).toBe(200);
    const webhookBody = JSON.parse(webhookRes.body);
    expect(webhookBody.received).toBe(true);

    // 4. Verify order payment status is marked paid in database
    const orderRes = await app.inject({
      method: "GET",
      url: `/v1/orders/${order.id}`,
    });
    expect(orderRes.statusCode).toBe(200);
    const orderData = JSON.parse(orderRes.body);
    expect(orderData.paymentStatus).toBe("paid");

    // 5. Replay attack prevention: duplicate webhook returns alreadyProcessed: true
    const replayRes = await app.inject({
      method: "POST",
      url: "/v1/payments/paystack/webhook",
      headers: {
        "content-type": "application/json",
        "x-paystack-signature": validSignature,
      },
      payload: rawPayload,
    });
    expect(replayRes.statusCode).toBe(200);
    expect(JSON.parse(replayRes.body).alreadyProcessed).toBe(true);
  });

  it("POST /v1/admin/killswitch & GET: triggers emergency platform freeze and blocks checkout", async () => {
    // 1. Initial state
    const initialGet = await app.inject({
      method: "GET",
      url: "/v1/admin/killswitch",
    });
    expect(initialGet.statusCode).toBe(200);

    // 2. Activate killswitch
    const freezeRes = await app.inject({
      method: "POST",
      url: "/v1/admin/killswitch",
      payload: {
        enabled: true,
        reason: "Suspected abnormal settlement traffic",
        adminId: "super_admin_nneka",
      },
    });
    expect(freezeRes.statusCode).toBe(200);
    const freezeBody = JSON.parse(freezeRes.body);
    expect(freezeBody.killswitchActive).toBe(true);

    // 3. Attempt checkout while killswitch is active -> must fail with 503
    const blockedCheckoutRes = await app.inject({
      method: "POST",
      url: "/v1/orders/checkout",
      payload: {
        vendorId: "vendor-amaka",
        vendorName: "Amaka's Kitchen",
        totalNgn: 9500,
        subtotalNgn: 8400,
        deliveryFeeNgn: 800,
        packagingFeeNgn: 300,
        fulfillmentMode: "delivery",
        deliveryAddress: "12 Community Road, Ikotun, Lagos",
        items: [],
      },
    });
    expect(blockedCheckoutRes.statusCode).toBe(503);
    const blockedBody = JSON.parse(blockedCheckoutRes.body);
    expect(blockedBody.error).toBe("Emergency platform freeze active");

    // 4. Lift killswitch
    const unfreezeRes = await app.inject({
      method: "POST",
      url: "/v1/admin/killswitch",
      payload: {
        enabled: false,
        reason: "Platform audit complete, normal operations restored",
        adminId: "super_admin_nneka",
      },
    });
    expect(unfreezeRes.statusCode).toBe(200);
    expect(JSON.parse(unfreezeRes.body).killswitchActive).toBe(false);

    // 5. Checkout now succeeds
    const allowedCheckoutRes = await app.inject({
      method: "POST",
      url: "/v1/orders/checkout",
      payload: {
        vendorId: "vendor-amaka",
        vendorName: "Amaka's Kitchen",
        totalNgn: 9500,
        subtotalNgn: 8400,
        deliveryFeeNgn: 800,
        packagingFeeNgn: 300,
        fulfillmentMode: "delivery",
        deliveryAddress: "12 Community Road, Ikotun, Lagos",
        items: [],
      },
    });
    expect(allowedCheckoutRes.statusCode).toBe(201);
  });

  it("GET /v1/vendor/dashboard: returns active vendor operations and orders", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/v1/vendor/dashboard",
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.vendor.name).toBe("Amaka's Kitchen");
    expect(body.onboarding.status).toBe("ready");
    expect(body.verification.status).toBe("approved");
    expect(body.menu.length).toBeGreaterThanOrEqual(1);
  });

  it("GET /v1/admin/dashboard: returns commercial pulse and nationwide directory", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/v1/admin/dashboard",
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.access.name).toBe("Nneka Okafor");
    expect(body.coverage.length).toBeGreaterThanOrEqual(6);
    expect(body.auditLogs.length).toBeGreaterThanOrEqual(1);
    expect(body.vendors.length).toBeGreaterThanOrEqual(6);
  });
});
