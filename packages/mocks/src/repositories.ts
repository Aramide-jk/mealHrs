import { fail, ok, type AppRepositories } from "@mealhrs/contracts";
import type { AreaId, DishId, MealDropId, OfferId, OrderId, VendorId } from "@mealhrs/domain";
import { addresses, areas, cart, dishes, mealDrops, offers, orders, posts, profile, vendors } from "./data";
import { vendorDashboard } from "./vendor-dashboard";
import { adminDashboard } from "./admin-dashboard";

const notFound = (label: string) => fail({ code: "not_found", message: `${label} was not found.`, retryable: false });

const findVendor = (vendorId: VendorId) => vendors.find((vendor) => vendor.id === vendorId);
const findDish = (dishId: DishId) => dishes.find((dish) => dish.id === dishId);
const findOffer = (offerId: OfferId) => offers.find((offer) => offer.id === offerId);
const toFeedItem = (post: (typeof posts)[number]) => {
  const vendor = findVendor(post.vendorId);
  if (!vendor) return null;
  const offer = post.linkedOfferId ? findOffer(post.linkedOfferId) : undefined;
  const dish = offer ? findDish(offer.dishId) : undefined;
  return {
    post,
    vendor,
    ...(offer ? { offer } : {}),
    ...(dish ? { dish } : {}),
  };
};

export const mockRepositories: AppRepositories = {
  discovery: {
    async getFeed({ mode, areaId, cursor }) {
      const start = cursor ? Number.parseInt(cursor, 10) : 0;
      const eligibleVendorIds = areaId === "area-ikeja" ? new Set<VendorId>() : new Set(vendors.slice(0, 2).map((vendor) => vendor.id));
      const followedVendorIds = new Set(vendors.slice(0, 2).map((vendor) => vendor.id));
      const filtered = posts.filter((post) =>
        mode === "near_me" ? eligibleVendorIds.has(post.vendorId) :
        mode === "following" ? followedVendorIds.has(post.vendorId) : true,
      );
      const items = filtered.slice(start, start + 3).flatMap((post) => {
        const item = toFeedItem(post);
        return item ? [item] : [];
      });
      const nextCursor = start + items.length < filtered.length ? String(start + items.length) : null;
      return ok({ items, nextCursor });
    },
    async search({ query, areaId }) {
      const normalized = query.trim().toLocaleLowerCase();
      const matches = (value: string) => value.toLocaleLowerCase().includes(normalized);
      const localVendorIds = areaId === "area-ikeja" ? new Set<VendorId>() : new Set(vendors.map((vendor) => vendor.id));
      return ok({
        dishes: offers.flatMap((offer) => {
          const dish = findDish(offer.dishId);
          const vendor = findVendor(offer.vendorId);
          if (!dish || !vendor || !localVendorIds.has(vendor.id) || (!matches(dish.name) && !matches(dish.category) && !matches(vendor.name))) return [];
          return [{ dish, offer, vendor }];
        }),
        vendors: vendors.filter((vendor) => localVendorIds.has(vendor.id) && (matches(vendor.name) || matches(vendor.category))),
        posts: posts.filter((post) => matches(post.caption)),
      });
    },
    async getSavedPosts() {
      return ok(posts.slice(0, 2).flatMap((post) => {
        const item = toFeedItem(post);
        return item ? [item] : [];
      }));
    },
    async getFollowedVendors() {
      return ok(vendors.slice(0, 2));
    },
  },
  catalog: {
    async listMeals() {
      return ok(offers.flatMap((offer) => {
        const dish = findDish(offer.dishId);
        const vendor = findVendor(offer.vendorId);
        return dish && vendor ? [{ dish, offer, vendor }] : [];
      }));
    },
    async getVendorBySlug(slug) {
      const vendor = vendors.find((candidate) => candidate.slug === slug);
      return vendor ? ok(vendor) : notFound("Kitchen");
    },
    async getVendorMenu(vendorId) {
      return ok(offers.flatMap((offer) => {
        if (offer.vendorId !== vendorId) return [];
        const dish = findDish(offer.dishId);
        return dish ? [{ dish, offer }] : [];
      }));
    },
    async getVendorMealDrops(vendorId) {
      return ok(mealDrops.filter((mealDrop) => mealDrop.vendorId === vendorId));
    },
    async getDish(dishId) {
      const dish = findDish(dishId);
      if (!dish) return notFound("Dish");
      const offer = offers.find((candidate) => candidate.dishId === dishId);
      const vendor = findVendor(dish.vendorId);
      return offer && vendor ? ok({ dish, offer, vendor }) : notFound("Offer");
    },
    async getOffer(offerId) {
      const offer = findOffer(offerId);
      return offer ? ok(offer) : notFound("Offer");
    },
    async getMealDrop(mealDropId: MealDropId) {
      const mealDrop = mealDrops.find((candidate) => candidate.id === mealDropId);
      if (!mealDrop) return notFound("Meal Drop");
      const vendor = findVendor(mealDrop.vendorId);
      const dropDishes = mealDrop.items.flatMap((item) => {
        const dish = findDish(item.dishId);
        return dish ? [dish] : [];
      });
      return vendor ? ok({ mealDrop, vendor, dishes: dropDishes }) : notFound("Kitchen");
    },
  },
  delivery: {
    async getAreas() {
      return ok(areas.map((area) => ({ id: area.id, name: area.name, state: area.state })));
    },
    async checkEligibility({ vendorId, areaId }: { vendorId: VendorId; areaId: AreaId }) {
      if (areaId === "area-ikeja") {
        return ok({ status: "outside_area", vendorId, areaId, reason: "This kitchen does not deliver to Ikeja yet." });
      }
      if (vendorId === "vendor-butter-crumb") {
        return ok({ status: "pickup_only", vendorId, areaId, pickupWindow: "Saturday, 9:00 AM–12:00 PM", reason: "This bakery drop is pickup only." });
      }
      return ok({ status: "eligible", vendorId, areaId, deliveryFee: { amount: 1200, currency: "NGN" }, estimate: "35–50 min" });
    },
  },
  commerce: {
    async getCart() {
      return ok(cart);
    },
    async getOrders() {
      return ok(orders);
    },
    async getOrder(orderId: OrderId) {
      const order = orders.find((candidate) => candidate.id === orderId);
      return order ? ok(order) : notFound("Order");
    },
  },
  account: {
    async getProfile() {
      return ok(profile);
    },
    async getAddresses() {
      return ok(addresses);
    },
  },
  vendor: {
    async getDashboard() {
      return ok(vendorDashboard);
    },
  },
  admin: {
    async getDashboard() {
      return ok(adminDashboard);
    },
  },
};
