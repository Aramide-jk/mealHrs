import fastify, { type FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import crypto from "node:crypto";
import { eq, desc } from "drizzle-orm";
import {
  getDb,
  usersTable,
  vendorsTable,
  vendorDeliveryZonesTable,
  dishesTable,
  mealDropsTable,
  ordersTable,
  coverageHubsTable,
  auditLogsTable,
} from "./db/index";
import {
  asAreaId,
  asVendorId,
  asDishId,
  asOrderId,
  asMealDropId,
  ngn,
} from "@mealhrs/domain";

// In-memory platform killswitch state
let platformKillswitch = {
  killswitchActive: false,
  reason: "",
  updatedAt: new Date().toISOString(),
  updatedBy: "system",
};

export function buildServer(): FastifyInstance {
  const app = fastify({ logger: false });

  // Store raw body buffer for cryptographically verified Paystack HMAC webhooks
  app.addContentTypeParser(
    "application/json",
    { parseAs: "buffer" },
    (req, body, done) => {
      (req as any).rawBody = body;
      try {
        const json = JSON.parse(body.toString("utf-8"));
        done(null, json);
      } catch (err) {
        done(err as Error, undefined);
      }
    }
  );

  // Enable CORS for web frontend
  app.register(cors, {
    origin: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  });

  // Health check
  app.get("/v1/health", async () => {
    return {
      status: "ok",
      service: "mealhrs-api",
      time: new Date().toISOString(),
      killswitchActive: platformKillswitch.killswitchActive,
    };
  });

  /* -------------------------------------------------------------------------- */
  /* DISCOVERY & SOCIAL FEED                                                    */
  /* -------------------------------------------------------------------------- */

  app.get("/v1/discovery/feed", async (req) => {
    const query = req.query as { mode?: string; areaId?: string; cursor?: string };
    const db = getDb();
    const vendors = await db.select().from(vendorsTable).where(eq(vendorsTable.status, "approved"));
    const dishes = await db.select().from(dishesTable);

    let filteredVendors = vendors;
    if (query.mode === "following") {
      filteredVendors = vendors.slice(0, 2);
    } else if (query.mode === "near_me" && query.areaId === "area-ikeja") {
      filteredVendors = [];
    }

    const start = query.cursor ? Number.parseInt(query.cursor, 10) : 0;
    const pagedVendors = filteredVendors.slice(start, start + 6);

    const items = pagedVendors.map((vendor: typeof vendorsTable.$inferSelect) => {
      const vendorDishes = dishes.filter((d: typeof dishesTable.$inferSelect) => d.vendorId === vendor.id);
      const featuredDish = vendorDishes[0];

      return {
        post: {
          id: `post-${vendor.id}`,
          vendorId: asVendorId(vendor.id),
          title: `${vendor.name} Special Daily Batch`,
          videoUrl: "/assets/reels/jollof-plating.mp4",
          caption: vendor.description,
          likesCount: 142,
          commentsCount: 18,
          timestamp: "2 hours ago",
          associatedOfferId: featuredDish ? `offer-${featuredDish.id}` : undefined,
        },
        vendor: {
          id: asVendorId(vendor.id),
          slug: vendor.slug,
          name: vendor.name,
          handle: vendor.handle,
          description: vendor.description,
          publicArea: vendor.publicArea,
          category: vendor.category,
          verified: vendor.verified,
          rating: Number(vendor.rating),
          reviewCount: vendor.reviewCount,
          avatarUrl: vendor.avatarUrl,
          coverUrl: vendor.coverUrl,
          acceptsOrders: vendor.acceptsOrders,
          fulfillmentModes: JSON.parse(vendor.fulfillmentModes),
        },
        dish: featuredDish
          ? {
              id: asDishId(featuredDish.id),
              vendorId: asVendorId(featuredDish.vendorId),
              name: featuredDish.name,
              slug: featuredDish.slug,
              description: featuredDish.description,
              category: featuredDish.category,
              allergens: JSON.parse(featuredDish.allergens),
              optionGroups: JSON.parse(featuredDish.optionGroups),
            }
          : undefined,
        offer: featuredDish
          ? {
              id: `offer-${featuredDish.id}`,
              dishId: asDishId(featuredDish.id),
              vendorId: asVendorId(featuredDish.vendorId),
              price: ngn(featuredDish.priceNgn),
              isAvailable: featuredDish.isAvailable,
              type: "immediate" as const,
            }
          : undefined,
      };
    });

    const nextCursor = start + items.length < filteredVendors.length ? String(start + items.length) : null;
    return { items, nextCursor };
  });

  app.get("/v1/discovery/search", async (req) => {
    const { query = "", areaId = "" } = req.query as { query?: string; areaId?: string };
    const db = getDb();
    const vendors = await db.select().from(vendorsTable).where(eq(vendorsTable.status, "approved"));
    const dishes = await db.select().from(dishesTable);

    const normalized = query.trim().toLowerCase();
    const matches = (v: string) => v.toLowerCase().includes(normalized);

    const matchedVendors = vendors.filter(
      (v: typeof vendorsTable.$inferSelect) =>
        matches(v.name) || matches(v.category) || matches(v.description) || matches(v.publicArea)
    );

    const matchedDishes = dishes.filter(
      (d: typeof dishesTable.$inferSelect) =>
        matches(d.name) || matches(d.category) || matches(d.description)
    );

    const mealListings = matchedDishes.map((d: typeof dishesTable.$inferSelect) => {
      const vendor = vendors.find((v: typeof vendorsTable.$inferSelect) => v.id === d.vendorId);
      return {
        dish: {
          id: asDishId(d.id),
          vendorId: asVendorId(d.vendorId),
          name: d.name,
          slug: d.slug,
          description: d.description,
          category: d.category,
          allergens: JSON.parse(d.allergens),
          optionGroups: JSON.parse(d.optionGroups),
        },
        offer: {
          id: `offer-${d.id}`,
          dishId: asDishId(d.id),
          vendorId: asVendorId(d.vendorId),
          price: ngn(d.priceNgn),
          isAvailable: d.isAvailable,
          type: "immediate" as const,
        },
        vendor: vendor
          ? {
              id: asVendorId(vendor.id),
              slug: vendor.slug,
              name: vendor.name,
              handle: vendor.handle,
              description: vendor.description,
              publicArea: vendor.publicArea,
              category: vendor.category,
              verified: vendor.verified,
              rating: Number(vendor.rating),
              reviewCount: vendor.reviewCount,
              avatarUrl: vendor.avatarUrl,
              coverUrl: vendor.coverUrl,
              acceptsOrders: vendor.acceptsOrders,
              fulfillmentModes: JSON.parse(vendor.fulfillmentModes),
            }
          : undefined,
      };
    });

    const posts = matchedVendors.map((v: typeof vendorsTable.$inferSelect) => ({
      id: `post-${v.id}`,
      vendorId: asVendorId(v.id),
      title: `${v.name} Freshly Cooked`,
      videoUrl: "/assets/reels/jollof-plating.mp4",
      caption: v.description,
      likesCount: 120,
      commentsCount: 14,
      timestamp: "Today",
    }));

    return {
      dishes: mealListings,
      vendors: matchedVendors.map((v: typeof vendorsTable.$inferSelect) => ({
        id: asVendorId(v.id),
        slug: v.slug,
        name: v.name,
        handle: v.handle,
        description: v.description,
        publicArea: v.publicArea,
        category: v.category,
        verified: v.verified,
        rating: Number(v.rating),
        reviewCount: v.reviewCount,
        avatarUrl: v.avatarUrl,
        coverUrl: v.coverUrl,
        acceptsOrders: v.acceptsOrders,
        fulfillmentModes: JSON.parse(v.fulfillmentModes),
      })),
      posts,
    };
  });

  app.get("/v1/discovery/saved-posts", async () => {
    const db = getDb();
    const vendors = await db.select().from(vendorsTable).limit(2);
    return vendors.map((v: typeof vendorsTable.$inferSelect) => ({
      post: {
        id: `post-${v.id}`,
        vendorId: asVendorId(v.id),
        title: `${v.name} Daily Feature`,
        videoUrl: "/assets/reels/jollof-plating.mp4",
        caption: v.description,
        likesCount: 215,
        commentsCount: 30,
        timestamp: "Yesterday",
      },
      vendor: {
        id: asVendorId(v.id),
        slug: v.slug,
        name: v.name,
        handle: v.handle,
        description: v.description,
        publicArea: v.publicArea,
        category: v.category,
        verified: v.verified,
        rating: Number(v.rating),
        reviewCount: v.reviewCount,
        avatarUrl: v.avatarUrl,
        coverUrl: v.coverUrl,
        acceptsOrders: v.acceptsOrders,
        fulfillmentModes: JSON.parse(v.fulfillmentModes),
      },
    }));
  });

  app.get("/v1/discovery/followed-vendors", async () => {
    const db = getDb();
    const vendors = await db.select().from(vendorsTable).limit(3);
    return vendors.map((v: typeof vendorsTable.$inferSelect) => ({
      id: asVendorId(v.id),
      slug: v.slug,
      name: v.name,
      handle: v.handle,
      description: v.description,
      publicArea: v.publicArea,
      category: v.category,
      verified: v.verified,
      rating: Number(v.rating),
      reviewCount: v.reviewCount,
      avatarUrl: v.avatarUrl,
      coverUrl: v.coverUrl,
      acceptsOrders: v.acceptsOrders,
      fulfillmentModes: JSON.parse(v.fulfillmentModes),
    }));
  });

  /* -------------------------------------------------------------------------- */
  /* CATALOG                                                                    */
  /* -------------------------------------------------------------------------- */

  app.get("/v1/catalog/meals", async () => {
    const db = getDb();
    const dishes = await db.select().from(dishesTable);
    const vendors = await db.select().from(vendorsTable);

    return dishes.map((dish: typeof dishesTable.$inferSelect) => {
      const vendor = vendors.find((v: typeof vendorsTable.$inferSelect) => v.id === dish.vendorId);
      return {
        dish: {
          id: asDishId(dish.id),
          vendorId: asVendorId(dish.vendorId),
          name: dish.name,
          slug: dish.slug,
          description: dish.description,
          category: dish.category,
          allergens: JSON.parse(dish.allergens),
          optionGroups: JSON.parse(dish.optionGroups),
        },
        offer: {
          id: `offer-${dish.id}`,
          dishId: asDishId(dish.id),
          vendorId: asVendorId(dish.vendorId),
          price: ngn(dish.priceNgn),
          isAvailable: dish.isAvailable,
          type: "immediate" as const,
        },
        vendor: vendor
          ? {
              id: asVendorId(vendor.id),
              slug: vendor.slug,
              name: vendor.name,
              handle: vendor.handle,
              description: vendor.description,
              publicArea: vendor.publicArea,
              category: vendor.category,
              verified: vendor.verified,
              rating: Number(vendor.rating),
              reviewCount: vendor.reviewCount,
              avatarUrl: vendor.avatarUrl,
              coverUrl: vendor.coverUrl,
              acceptsOrders: vendor.acceptsOrders,
              fulfillmentModes: JSON.parse(vendor.fulfillmentModes),
            }
          : null,
      };
    });
  });

  app.get("/v1/catalog/vendors/:slug", async (req, reply) => {
    const { slug } = req.params as { slug: string };
    const db = getDb();
    const vendors = await db.select().from(vendorsTable).where(eq(vendorsTable.slug, slug));
    const vendor = vendors[0];

    if (!vendor) {
      return reply.code(404).send({ error: "Vendor not found" });
    }

    return {
      id: asVendorId(vendor.id),
      slug: vendor.slug,
      name: vendor.name,
      handle: vendor.handle,
      description: vendor.description,
      publicArea: vendor.publicArea,
      category: vendor.category,
      verified: vendor.verified,
      rating: Number(vendor.rating),
      reviewCount: vendor.reviewCount,
      avatarUrl: vendor.avatarUrl,
      coverUrl: vendor.coverUrl,
      acceptsOrders: vendor.acceptsOrders,
      fulfillmentModes: JSON.parse(vendor.fulfillmentModes),
    };
  });

  app.get("/v1/catalog/vendors/:vendorId/menu", async (req) => {
    const { vendorId } = req.params as { vendorId: string };
    const db = getDb();
    const dishes = await db.select().from(dishesTable).where(eq(dishesTable.vendorId, vendorId));

    return dishes.map((d: typeof dishesTable.$inferSelect) => ({
      dish: {
        id: asDishId(d.id),
        vendorId: asVendorId(d.vendorId),
        name: d.name,
        slug: d.slug,
        description: d.description,
        category: d.category,
        allergens: JSON.parse(d.allergens),
        optionGroups: JSON.parse(d.optionGroups),
      },
      offer: {
        id: `offer-${d.id}`,
        dishId: asDishId(d.id),
        vendorId: asVendorId(d.vendorId),
        price: ngn(d.priceNgn),
        isAvailable: d.isAvailable,
        type: "immediate" as const,
      },
    }));
  });

  app.get("/v1/catalog/vendors/:vendorId/meal-drops", async (req) => {
    const { vendorId } = req.params as { vendorId: string };
    const db = getDb();
    const drops = await db.select().from(mealDropsTable).where(eq(mealDropsTable.vendorId, vendorId));

    return drops.map((drop: typeof mealDropsTable.$inferSelect) => ({
      id: asMealDropId(drop.id),
      vendorId: asVendorId(drop.vendorId),
      name: drop.title,
      summary: drop.title,
      scheduledDate: drop.batchDate,
      orderCutoff: drop.cutoffTime,
      fulfillmentWindow: drop.batchDate + ", 1:00–4:00 PM",
      totalPortions: drop.portionsMax,
      reservedPortions: drop.portionsReserved,
      status: drop.status,
      imageUrl: "/assets/hero-jollof.png",
      items: [
        {
          offerId: `offer-${drop.dishId}`,
          dishId: asDishId(drop.dishId),
          quantityLimit: 4,
        },
      ],
    }));
  });

  app.get("/v1/catalog/dishes/:dishId", async (req, reply) => {
    const { dishId } = req.params as { dishId: string };
    const db = getDb();
    const dishes = await db.select().from(dishesTable).where(eq(dishesTable.id, dishId));
    const dish = dishes[0];

    if (!dish) {
      return reply.code(404).send({ error: "Dish not found" });
    }

    const vendors = await db.select().from(vendorsTable).where(eq(vendorsTable.id, dish.vendorId));
    const vendor = vendors[0];

    return {
      dish: {
        id: asDishId(dish.id),
        vendorId: asVendorId(dish.vendorId),
        name: dish.name,
        slug: dish.slug,
        description: dish.description,
        category: dish.category,
        allergens: JSON.parse(dish.allergens),
        optionGroups: JSON.parse(dish.optionGroups),
      },
      offer: {
        id: `offer-${dish.id}`,
        dishId: asDishId(dish.id),
        vendorId: asVendorId(dish.vendorId),
        price: ngn(dish.priceNgn),
        isAvailable: dish.isAvailable,
        type: "immediate" as const,
      },
      vendor: vendor
        ? {
            id: asVendorId(vendor.id),
            slug: vendor.slug,
            name: vendor.name,
            handle: vendor.handle,
            description: vendor.description,
            publicArea: vendor.publicArea,
            category: vendor.category,
            verified: vendor.verified,
            rating: Number(vendor.rating),
            reviewCount: vendor.reviewCount,
            avatarUrl: vendor.avatarUrl,
            coverUrl: vendor.coverUrl,
            acceptsOrders: vendor.acceptsOrders,
            fulfillmentModes: JSON.parse(vendor.fulfillmentModes),
          }
        : null,
    };
  });

  app.get("/v1/catalog/offers/:offerId", async (req, reply) => {
    const { offerId } = req.params as { offerId: string };
    const db = getDb();
    const dishId = offerId.startsWith("offer-") ? offerId.replace("offer-", "") : offerId;
    const dishes = await db.select().from(dishesTable).where(eq(dishesTable.id, dishId));
    const dish = dishes[0];

    if (!dish) {
      return reply.code(404).send({ error: "Offer not found" });
    }

    return {
      id: offerId,
      dishId: asDishId(dish.id),
      vendorId: asVendorId(dish.vendorId),
      price: ngn(dish.priceNgn),
      isAvailable: dish.isAvailable,
      type: "immediate" as const,
    };
  });

  app.get("/v1/catalog/meal-drops/:mealDropId", async (req, reply) => {
    const { mealDropId } = req.params as { mealDropId: string };
    const db = getDb();
    const drops = await db.select().from(mealDropsTable).where(eq(mealDropsTable.id, mealDropId));
    const drop = drops[0];

    if (!drop) {
      return reply.code(404).send({ error: "Meal Drop not found" });
    }

    const vendors = await db.select().from(vendorsTable).where(eq(vendorsTable.id, drop.vendorId));
    const vendor = vendors[0];
    const dropDishes = await db.select().from(dishesTable).where(eq(dishesTable.id, drop.dishId));

    return {
      mealDrop: {
        id: asMealDropId(drop.id),
        vendorId: asVendorId(drop.vendorId),
        name: drop.title,
        summary: drop.title,
        scheduledDate: drop.batchDate,
        orderCutoff: drop.cutoffTime,
        fulfillmentWindow: drop.batchDate + ", 1:00–4:00 PM",
        totalPortions: drop.portionsMax,
        reservedPortions: drop.portionsReserved,
        status: drop.status,
        imageUrl: "/assets/hero-jollof.png",
        items: [
          {
            offerId: `offer-${drop.dishId}`,
            dishId: asDishId(drop.dishId),
            quantityLimit: 4,
          },
        ],
      },
      vendor: vendor
        ? {
            id: asVendorId(vendor.id),
            slug: vendor.slug,
            name: vendor.name,
            handle: vendor.handle,
            description: vendor.description,
            publicArea: vendor.publicArea,
            category: vendor.category,
            verified: vendor.verified,
            rating: Number(vendor.rating),
            reviewCount: vendor.reviewCount,
            avatarUrl: vendor.avatarUrl,
            coverUrl: vendor.coverUrl,
            acceptsOrders: vendor.acceptsOrders,
            fulfillmentModes: JSON.parse(vendor.fulfillmentModes),
          }
        : null,
      dishes: dropDishes.map((d: typeof dishesTable.$inferSelect) => ({
        id: asDishId(d.id),
        vendorId: asVendorId(d.vendorId),
        name: d.name,
        slug: d.slug,
        description: d.description,
        category: d.category,
        allergens: JSON.parse(d.allergens),
        optionGroups: JSON.parse(d.optionGroups),
      })),
    };
  });

  /* -------------------------------------------------------------------------- */
  /* DELIVERY & REGIONAL COVERAGE                                               */
  /* -------------------------------------------------------------------------- */

  app.get("/v1/delivery/areas", async () => {
    const db = getDb();
    const hubs = await db.select().from(coverageHubsTable).where(eq(coverageHubsTable.enabled, true));
    return hubs.map((h: typeof coverageHubsTable.$inferSelect) => ({
      id: asAreaId(h.areaId),
      name: h.name,
      state: h.state,
      customerDemand: h.customerDemand,
      activeVendors: h.activeVendors,
      isAutoDiscovered: h.isAutoDiscovered,
    }));
  });

  app.get("/v1/delivery/eligibility", async (req) => {
    const { vendorId, areaId } = req.query as { vendorId: string; areaId: string };
    const db = getDb();

    // Check specific vendor delivery zone rule
    const zones = await db
      .select()
      .from(vendorDeliveryZonesTable)
      .where(eq(vendorDeliveryZonesTable.vendorId, vendorId));

    const zone = zones.find(
      (z: typeof vendorDeliveryZonesTable.$inferSelect) => z.areaId === areaId && z.enabled
    );

    if (zone) {
      return {
        status: "eligible",
        vendorId,
        areaId,
        deliveryFee: { amount: zone.deliveryFeeNgn, currency: "NGN" },
        estimate: zone.estimate,
      };
    }

    if (vendorId === "vendor-butter-crumb") {
      return {
        status: "pickup_only",
        vendorId,
        areaId,
        pickupWindow: "Saturday, 9:00 AM–12:00 PM",
        reason: "This bakery drop is pickup only.",
      };
    }

    if (areaId === "area-ikeja" || zones.length === 0) {
      return {
        status: "outside_area",
        vendorId,
        areaId,
        reason: "This kitchen does not deliver to this area yet.",
      };
    }

    // Default eligible fallback
    return {
      status: "eligible",
      vendorId,
      areaId,
      deliveryFee: { amount: 1200, currency: "NGN" },
      estimate: "35–50 min",
    };
  });

  /* -------------------------------------------------------------------------- */
  /* COMMERCE & CART                                                            */
  /* -------------------------------------------------------------------------- */

  app.get("/v1/cart", async () => {
    return {
      vendorId: asVendorId("vendor-amaka"),
      orderingMode: "immediate",
      items: [
        {
          id: "cart-item-jollof",
          dishId: asDishId("dish-jollof-party"),
          offerId: "offer-dish-jollof-party",
          name: "Smoky Party Jollof Rice & Peppered Chicken",
          imageUrl: "/assets/hero-jollof.png",
          unitPrice: ngn(4200),
          quantity: 2,
          selectedOptions: [
            { name: "Protein", value: "Peppered Chicken", priceDelta: ngn(0) },
          ],
          instructions: "Pack plantain in separate container.",
        },
      ],
    };
  });

  app.get("/v1/orders", async () => {
    const db = getDb();
    const orders = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt));
    return orders.map((o: typeof ordersTable.$inferSelect) => ({
      id: asOrderId(o.id),
      reference: o.reference,
      vendorId: asVendorId(o.vendorId),
      vendorName: o.vendorName,
      total: ngn(o.totalNgn),
      subtotal: ngn(o.subtotalNgn),
      deliveryFee: ngn(o.deliveryFeeNgn),
      serviceFee: ngn(o.packagingFeeNgn),
      fulfillmentMode: o.fulfillmentMode as "delivery" | "pickup",
      orderingMode: "immediate" as const,
      fulfillmentStatus: o.fulfillmentStatus as any,
      orderStatus: "confirmed" as const,
      paymentStatus: o.paymentStatus as any,
      fulfillmentWindow: "35–50 min",
      deliveryAddress: o.deliveryAddress,
      customerName: o.customerName,
      customerPhone: o.customerPhone,
      items: JSON.parse(o.items),
      createdAt: o.createdAt.toISOString(),
      events: [
        { label: "Order received", occurredAt: "10:15 AM", detail: "Kitchen confirmed ticket." },
      ],
    }));
  });

  app.get("/v1/orders/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const db = getDb();
    const matches = await db.select().from(ordersTable).where(eq(ordersTable.id, id));
    const order = matches[0] ?? (await db.select().from(ordersTable).where(eq(ordersTable.reference, id)))[0];

    if (!order) {
      return reply.code(404).send({ error: "Order not found" });
    }

    return {
      id: asOrderId(order.id),
      reference: order.reference,
      vendorId: asVendorId(order.vendorId),
      vendorName: order.vendorName,
      total: ngn(order.totalNgn),
      subtotal: ngn(order.subtotalNgn),
      deliveryFee: ngn(order.deliveryFeeNgn),
      serviceFee: ngn(order.packagingFeeNgn),
      fulfillmentMode: order.fulfillmentMode as "delivery" | "pickup",
      orderingMode: "immediate" as const,
      fulfillmentStatus: order.fulfillmentStatus as any,
      orderStatus: "confirmed" as const,
      paymentStatus: order.paymentStatus as any,
      fulfillmentWindow: "35–50 min",
      deliveryAddress: order.deliveryAddress,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      items: JSON.parse(order.items),
      createdAt: order.createdAt.toISOString(),
      events: [
        { label: "Order confirmed", occurredAt: "10:15 AM", detail: "Kitchen confirmed ticket." },
      ],
    };
  });

  app.post("/v1/orders/checkout", async (req, reply) => {
    const body = req.body as any;
    const db = getDb();

    if (platformKillswitch.killswitchActive) {
      return reply.code(503).send({
        error: "Emergency platform freeze active",
        reason: platformKillswitch.reason,
      });
    }

    const orderId = `order-mh-${Math.floor(10000 + Math.random() * 90000)}`;
    const reference = `MH-${Math.floor(20000 + Math.random() * 80000)}`;
    const paystackRef = `pstk_${Math.random().toString(36).substring(2, 12)}`;

    const newOrder = {
      id: orderId,
      reference,
      customerId: body.customerId ?? "customer-teni",
      vendorId: body.vendorId,
      vendorName: body.vendorName ?? "Independent Kitchen",
      totalNgn: Number(body.totalNgn ?? 9500),
      subtotalNgn: Number(body.subtotalNgn ?? 8400),
      deliveryFeeNgn: Number(body.deliveryFeeNgn ?? 800),
      packagingFeeNgn: Number(body.packagingFeeNgn ?? 300),
      fulfillmentMode: body.fulfillmentMode ?? "delivery",
      fulfillmentStatus: "received",
      paymentStatus: "paid",
      deliveryAddress: body.deliveryAddress ?? "12 Community Road, Ikotun, Lagos",
      customerName: body.customerName ?? "Teni Adebayo",
      customerPhone: body.customerPhone ?? "+234 803 123 4567",
      paystackReference: paystackRef,
      items: JSON.stringify(body.items ?? []),
    };

    await db.insert(ordersTable).values(newOrder);

    return reply.code(201).send({
      success: true,
      order: {
        id: asOrderId(newOrder.id),
        reference: newOrder.reference,
        vendorId: asVendorId(newOrder.vendorId),
        vendorName: newOrder.vendorName,
        orderingMode: "immediate",
        fulfillmentMode: newOrder.fulfillmentMode,
        fulfillmentStatus: "scheduled",
        orderStatus: "confirmed",
        paymentStatus: "paid",
        fulfillmentWindow: "35–50 min",
        subtotal: ngn(newOrder.subtotalNgn),
        deliveryFee: ngn(newOrder.deliveryFeeNgn),
        serviceFee: ngn(newOrder.packagingFeeNgn),
        total: ngn(newOrder.totalNgn),
        createdAt: new Date().toISOString(),
        items: body.items ?? [],
        events: [{ label: "Order placed", occurredAt: "Just now", detail: "Payment received." }],
      },
      paystackAuthorizationUrl: `https://checkout.paystack.com/${paystackRef}`,
      paystackReference: paystackRef,
    });
  });

  /* -------------------------------------------------------------------------- */
  /* PAYSTACK PAYMENT INTEGRATION                                               */
  /* -------------------------------------------------------------------------- */

  app.post("/v1/payments/paystack/initialize", async (req, reply) => {
    const { orderId, email, amountNgn, callbackUrl } = req.body as {
      orderId: string;
      email: string;
      amountNgn: number;
      callbackUrl?: string;
    };

    if (!orderId || !email || !amountNgn) {
      return reply.code(400).send({ error: "orderId, email, and amountNgn are required" });
    }

    const reference = `pstk_${orderId}_${Date.now()}`;
    const authorizationUrl = `https://checkout.paystack.com/${reference}`;
    const accessCode = `pstk_acc_${reference}`;

    return {
      authorizationUrl,
      accessCode,
      reference,
    };
  });

  app.post("/v1/payments/paystack/webhook", async (req, reply) => {
    const signature = req.headers["x-paystack-signature"] as string | undefined;
    const secretKey = process.env.PAYSTACK_SECRET_KEY || "mealhrs_paystack_secret_key_prod";

    // 1. Verify HMAC SHA-512 signature in constant-time
    if (!signature) {
      return reply.code(401).send({ error: "Missing x-paystack-signature header" });
    }

    const rawBuffer = (req as any).rawBody as Buffer | undefined;
    const rawContent = rawBuffer ? rawBuffer.toString("utf-8") : JSON.stringify(req.body);

    const computedHash = crypto
      .createHmac("sha512", secretKey)
      .update(rawContent)
      .digest("hex");

    let signaturesMatch = false;
    try {
      const sigBuf = Buffer.from(signature, "hex");
      const hashBuf = Buffer.from(computedHash, "hex");
      signaturesMatch = sigBuf.length === hashBuf.length && crypto.timingSafeEqual(sigBuf, hashBuf);
    } catch {
      signaturesMatch = false;
    }

    if (!signaturesMatch) {
      return reply.code(401).send({ error: "Invalid HMAC signature" });
    }

    const payload = req.body as any;
    const db = getDb();

    // 2. Process Paystack charge.success event with replay-attack protection
    if (payload.event === "charge.success") {
      const reference = payload.data?.reference;
      if (reference) {
        const matches = await db
          .select()
          .from(ordersTable)
          .where(eq(ordersTable.paystackReference, reference));

        const order = matches[0];
        if (order && order.paymentStatus === "paid") {
          return { received: true, alreadyProcessed: true };
        }

        // Update order status in database
        await db
          .update(ordersTable)
          .set({ paymentStatus: "paid" })
          .where(eq(ordersTable.paystackReference, reference));

        // Audit log NUBAN settlement event
        await db.insert(auditLogsTable).values({
          id: `audit-${Date.now()}`,
          adminName: "Paystack Settlement Gateway",
          action: "paystack_payment_verified",
          target: reference,
          category: "finance",
        });
      }
    }

    return { received: true, event: payload.event };
  });

  /* -------------------------------------------------------------------------- */
  /* ACCOUNT & PROFILES                                                         */
  /* -------------------------------------------------------------------------- */

  app.get("/v1/account/profile", async () => {
    const db = getDb();
    const users = await db.select().from(usersTable).where(eq(usersTable.id, "customer-teni"));
    const user = users[0];

    return {
      id: user?.id ?? "customer-teni",
      name: user?.name ?? "Teni Adebayo",
      email: user?.email ?? "teni@example.com",
      phone: user?.phone ?? "+234 803 123 4567",
      status: user?.status ?? "active",
      role: "customer",
    };
  });

  app.get("/v1/account/addresses", async () => {
    return [
      {
        id: "addr-1",
        label: "Home",
        line1: "12 Community Road",
        area: "Ikotun",
        state: "Lagos",
        isDefault: true,
      },
      {
        id: "addr-2",
        label: "Office",
        line1: "Plot 4, Admiralty Way",
        area: "Lekki Phase 1",
        state: "Lagos",
        isDefault: false,
      },
    ];
  });

  /* -------------------------------------------------------------------------- */
  /* VENDOR PORTAL DASHBOARD                                                    */
  /* -------------------------------------------------------------------------- */

  app.get("/v1/vendor/dashboard", async () => {
    const db = getDb();
    const vendors = await db.select().from(vendorsTable).where(eq(vendorsTable.id, "vendor-amaka"));
    const vendor = vendors[0] || (await db.select().from(vendorsTable).limit(1))[0];
    const dishes = await db.select().from(dishesTable).where(eq(dishesTable.vendorId, vendor.id));
    const drops = await db.select().from(mealDropsTable).where(eq(mealDropsTable.vendorId, vendor.id));
    const orders = await db.select().from(ordersTable).where(eq(ordersTable.vendorId, vendor.id));

    const vendorEntity = {
      id: asVendorId(vendor.id),
      slug: vendor.slug,
      name: vendor.name,
      handle: vendor.handle,
      description: vendor.description,
      publicArea: vendor.publicArea,
      category: vendor.category,
      verified: vendor.verified,
      rating: Number(vendor.rating),
      reviewCount: vendor.reviewCount,
      avatarUrl: vendor.avatarUrl,
      coverUrl: vendor.coverUrl,
      acceptsOrders: vendor.acceptsOrders,
      fulfillmentModes: JSON.parse(vendor.fulfillmentModes),
    };

    const menu = dishes.map((d: typeof dishesTable.$inferSelect) => ({
      dish: {
        id: asDishId(d.id),
        vendorId: asVendorId(d.vendorId),
        name: d.name,
        slug: d.slug,
        description: d.description,
        category: d.category,
        allergens: JSON.parse(d.allergens),
        optionGroups: JSON.parse(d.optionGroups),
      },
      offer: {
        id: `offer-${d.id}`,
        dishId: asDishId(d.id),
        vendorId: asVendorId(d.vendorId),
        price: ngn(d.priceNgn),
        isAvailable: d.isAvailable,
        type: "immediate" as const,
      },
    }));

    return {
      vendor: vendorEntity,
      onboarding: {
        status: "ready",
        completedSteps: ["profile", "fulfillment", "payout_preview", "first_menu"],
        nextStep: "Your kitchen is ready to receive orders.",
      },
      verification: {
        status: "approved",
        accountVerified: true,
        businessReviewed: true,
        foodSafetyCertified: true,
        reviewerNote: "Verified CAC RC-1849201 and NUBAN ledger account with Access Bank.",
        documents: [
          { id: "doc-id", label: "Owner identity (NIN / BVN match)", detail: "Matched to Amaka Okafor", status: "verified" },
          { id: "doc-phone", label: "Verified Nigerian contact number", detail: "+234 803 219 4481", status: "verified" },
          { id: "doc-payout", label: "Payout bank account verification", detail: "Access Bank •••• 6789", status: "verified" },
        ],
      },
      overview: {
        todaySales: ngn(28650),
        openImmediateOrders: orders.length,
        upcomingMealDrops: drops.length,
        activePosts: 1,
        outstandingDeliveries: 1,
        nextCutoffLabel: "Sunday Party Jollof · Batch prep 11:30 AM",
        recentActivity: [
          { id: "act-1", title: "Order MH-20481 preparing", detail: "Teni Adebayo · 1× Smoky Jollof", timeLabel: "14 min ago" },
        ],
      },
      immediateOrders: orders.map((o: typeof ordersTable.$inferSelect) => ({
        id: asOrderId(o.id),
        reference: o.reference,
        vendorId: asVendorId(o.vendorId),
        vendorName: o.vendorName,
        orderingMode: "immediate" as const,
        fulfillmentMode: o.fulfillmentMode as any,
        items: JSON.parse(o.items),
        paymentStatus: o.paymentStatus as any,
        orderStatus: "confirmed" as const,
        fulfillmentStatus: o.fulfillmentStatus as any,
        fulfillmentWindow: "35–50 min",
        subtotal: ngn(o.subtotalNgn),
        deliveryFee: ngn(o.deliveryFeeNgn),
        serviceFee: ngn(o.packagingFeeNgn),
        total: ngn(o.totalNgn),
        createdAt: o.createdAt.toISOString(),
        customer: { name: o.customerName, phoneMasked: "+234 80••• 4567" },
        operational: {
          ageLabel: "Placed 15 min ago",
          priority: "normal" as const,
          paymentLabel: "Paid via Paystack",
          fulfillmentDetail: o.deliveryAddress,
          contactLabel: "Contact customer",
        },
        events: [{ label: "Order received", occurredAt: "10:15 AM", detail: "Kitchen confirmed ticket." }],
      })),
      mealDropOrders: [],
      menu,
      mealDrops: drops.map((drop: typeof mealDropsTable.$inferSelect) => ({
        id: asMealDropId(drop.id),
        vendorId: asVendorId(drop.vendorId),
        name: drop.title,
        summary: drop.title,
        scheduledDate: drop.batchDate,
        orderCutoff: drop.cutoffTime,
        fulfillmentWindow: drop.batchDate + ", 1:00–4:00 PM",
        totalPortions: drop.portionsMax,
        reservedPortions: drop.portionsReserved,
        status: drop.status,
        imageUrl: "/assets/hero-jollof.png",
        items: [{ offerId: `offer-${drop.dishId}`, dishId: asDishId(drop.dishId), quantityLimit: 4 }],
      })),
      posts: [
        {
          id: `post-${vendor.id}`,
          vendorId: asVendorId(vendor.id),
          title: `${vendor.name} Special Batch`,
          videoUrl: "/assets/reels/jollof-plating.mp4",
          caption: vendor.description,
          likesCount: 142,
          commentsCount: 18,
          timestamp: "2 hours ago",
        },
      ],
      postInsights: [],
    };
  });

  /* -------------------------------------------------------------------------- */
  /* SUPER ADMIN GOVERNANCE & EMERGENCY CONTROLS                                */
  /* -------------------------------------------------------------------------- */

  app.get("/v1/admin/dashboard", async () => {
    const db = getDb();
    const vendors = await db.select().from(vendorsTable);
    const hubs = await db.select().from(coverageHubsTable);
    const orders = await db.select().from(ordersTable);
    const users = await db.select().from(usersTable);
    const logs = await db.select().from(auditLogsTable).orderBy(desc(auditLogsTable.timestamp));

    return {
      access: { name: "Nneka Okafor", role: "super_admin", workspaceReady: true },
      overview: {
        pendingVendorReviews: vendors.filter((v: typeof vendorsTable.$inferSelect) => v.status === "pending_review").length,
        openDisputes: 1,
        ordersNeedingReview: 1,
        flaggedContent: 0,
      },
      vendors: vendors.map((vendor: typeof vendorsTable.$inferSelect) => ({
        vendor: {
          id: asVendorId(vendor.id),
          slug: vendor.slug,
          name: vendor.name,
          handle: vendor.handle,
          description: vendor.description,
          publicArea: vendor.publicArea,
          category: vendor.category,
          verified: vendor.verified,
          rating: Number(vendor.rating),
          reviewCount: vendor.reviewCount,
          avatarUrl: vendor.avatarUrl,
          coverUrl: vendor.coverUrl,
          acceptsOrders: vendor.acceptsOrders,
          fulfillmentModes: JSON.parse(vendor.fulfillmentModes),
        },
        status: vendor.status,
        submittedAt: "Nov 3, 2026",
        reviewNote: "Approved production record.",
        compliance: {
          cacNumber: vendor.cacNumber ?? "RC-1849201",
          foodSafetyCertified: true,
          hygieneCertNumber: "LSMOH-EHO-1020",
          kitchenAddress: vendor.kitchenAddress ?? vendor.publicArea,
          managerPhone: "+234 803 219 4481",
          bankName: vendor.bankName ?? "Access Bank",
          accountNumber: vendor.accountNumber ?? "0123456789",
          accountName: vendor.accountName ?? vendor.name,
          kitchenPhotoUrl: vendor.coverUrl,
        },
      })),
      customers: users.map((u: typeof usersTable.$inferSelect) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone ?? "+234 800 000 0000",
        orderCount: 4,
        status: u.status,
        joinedAt: u.joinedAt.toISOString(),
        ltv: ngn(24500),
        addresses: ["12 Community Road, Ikotun, Lagos"],
      })),
      orders: orders.map((o: typeof ordersTable.$inferSelect) => ({
        order: {
          id: asOrderId(o.id),
          reference: o.reference,
          vendorId: asVendorId(o.vendorId),
          vendorName: o.vendorName,
          orderingMode: "immediate" as const,
          fulfillmentMode: o.fulfillmentMode as any,
          items: JSON.parse(o.items),
          paymentStatus: o.paymentStatus as any,
          orderStatus: "confirmed" as const,
          fulfillmentStatus: o.fulfillmentStatus as any,
          fulfillmentWindow: "35–50 min",
          subtotal: ngn(o.subtotalNgn),
          deliveryFee: ngn(o.deliveryFeeNgn),
          serviceFee: ngn(o.packagingFeeNgn),
          total: ngn(o.totalNgn),
          createdAt: o.createdAt.toISOString(),
          events: [],
        },
        interventionStatus: "none" as const,
      })),
      disputes: [],
      moderation: [],
      deliveryZones: hubs.map((h: typeof coverageHubsTable.$inferSelect) => ({
        areaId: asAreaId(h.areaId),
        name: h.name,
        state: h.state,
        enabled: h.enabled,
        activeVendors: h.activeVendors,
        customerDemand: h.customerDemand,
        isAutoDiscovered: h.isAutoDiscovered,
      })),
      coverage: hubs.map((h: typeof coverageHubsTable.$inferSelect) => ({
        areaId: asAreaId(h.areaId),
        name: h.name,
        state: h.state,
        enabled: h.enabled,
        activeVendors: h.activeVendors,
        customerDemand: h.customerDemand,
        isAutoDiscovered: h.isAutoDiscovered,
      })),
      analytics: {
        activeKitchensToday: vendors.filter((v: typeof vendorsTable.$inferSelect) => v.acceptsOrders).length,
        gmvToday: ngn(94500),
        settlementReadyGmv: ngn(82000),
        disputeRate: "0.2%",
      },
      auditLog: logs.map((l: typeof auditLogsTable.$inferSelect) => ({
        id: l.id,
        adminName: l.adminName,
        action: l.action,
        target: l.target,
        timestamp: l.timestamp.toISOString(),
      })),
      auditLogs: logs.map((l: typeof auditLogsTable.$inferSelect) => ({
        id: l.id,
        adminName: l.adminName,
        action: l.action,
        target: l.target,
        timestamp: l.timestamp.toISOString(),
      })),
      roles: [],
      settings: {
        platformFreeze: platformKillswitch.killswitchActive,
        instantSettlement: true,
        paystackIntegrationLive: true,
      },
      finance: {
        todaySettlementNgn: 82000,
        pendingEscrowNgn: 12500,
      },
    };
  });

  // Emergency Platform Killswitch Controls
  app.get("/v1/admin/killswitch", async () => {
    return platformKillswitch;
  });

  app.post("/v1/admin/killswitch", async (req, reply) => {
    const body = req.body as { enabled: boolean; reason?: string; adminId?: string };
    const db = getDb();

    platformKillswitch = {
      killswitchActive: Boolean(body.enabled),
      reason: body.reason ?? "Manual administrative platform control invoked",
      updatedAt: new Date().toISOString(),
      updatedBy: body.adminId ?? "super_admin_nneka",
    };

    await db.insert(auditLogsTable).values({
      id: `audit-killswitch-${Date.now()}`,
      adminName: body.adminId ?? "super_admin_nneka",
      action: platformKillswitch.killswitchActive ? "emergency_platform_freeze_activated" : "emergency_platform_freeze_lifted",
      target: "platform_commerce_engine",
      category: "governance",
    });

    return platformKillswitch;
  });

  return app;
}
