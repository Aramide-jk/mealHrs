import type {
  AppRepositories,
  DiscoveryRepository,
  CatalogRepository,
  DeliveryRepository,
  CommerceRepository,
  AccountRepository,
  VendorRepository,
  AdminRepository,
  Result,
} from "@mealhrs/contracts";
import { ok, fail } from "@mealhrs/contracts";

export function createHttpRepositories(baseUrl: string = process.env.API_URL || "http://127.0.0.1:4000"): AppRepositories {
  const normalizedBase = baseUrl.replace(/\/+$/, "");

  async function fetchApi<T>(path: string, init?: RequestInit): Promise<Result<T>> {
    try {
      const url = `${normalizedBase}${path.startsWith("/") ? "" : "/"}${path}`;
      const res = await fetch(url, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          ...(init?.headers ?? {}),
        },
        cache: "no-store",
      });

      if (!res.ok) {
        if (res.status === 404) {
          return fail({
            code: "not_found",
            message: `Resource not found at ${path}`,
            retryable: false,
          });
        }
        return fail({
          code: "invalid",
          message: `API request failed with status ${res.status}: ${res.statusText}`,
          retryable: res.status >= 500,
        });
      }

      const data = (await res.json()) as T;
      return ok(data);
    } catch (err) {
      return fail({
        code: "network",
        message: err instanceof Error ? err.message : "Network error contacting API",
        retryable: true,
      });
    }
  }

  const discovery: DiscoveryRepository = {
    async getFeed({ mode, areaId, cursor }) {
      const params = new URLSearchParams();
      if (mode) params.set("mode", mode);
      if (areaId) params.set("areaId", areaId);
      if (cursor) params.set("cursor", cursor);
      return fetchApi(`/v1/discovery/feed?${params.toString()}`);
    },

    async search({ query, areaId }) {
      const params = new URLSearchParams();
      params.set("query", query);
      if (areaId) params.set("areaId", areaId);
      return fetchApi(`/v1/discovery/search?${params.toString()}`);
    },

    async getSavedPosts() {
      return fetchApi(`/v1/discovery/saved-posts`);
    },

    async getFollowedVendors() {
      return fetchApi(`/v1/discovery/followed-vendors`);
    },
  };

  const catalog: CatalogRepository = {
    async listMeals() {
      return fetchApi(`/v1/catalog/meals`);
    },

    async getVendorBySlug(slug) {
      return fetchApi(`/v1/catalog/vendors/${encodeURIComponent(slug)}`);
    },

    async getVendorMenu(vendorId) {
      return fetchApi(`/v1/catalog/vendors/${encodeURIComponent(vendorId)}/menu`);
    },

    async getVendorMealDrops(vendorId) {
      return fetchApi(`/v1/catalog/vendors/${encodeURIComponent(vendorId)}/meal-drops`);
    },

    async getDish(dishId) {
      return fetchApi(`/v1/catalog/dishes/${encodeURIComponent(dishId)}`);
    },

    async getOffer(offerId) {
      return fetchApi(`/v1/catalog/offers/${encodeURIComponent(offerId)}`);
    },

    async getMealDrop(mealDropId) {
      return fetchApi(`/v1/catalog/meal-drops/${encodeURIComponent(mealDropId)}`);
    },
  };

  const delivery: DeliveryRepository = {
    async getAreas() {
      return fetchApi(`/v1/delivery/areas`);
    },

    async checkEligibility({ vendorId, areaId }) {
      const params = new URLSearchParams({ vendorId, areaId });
      return fetchApi(`/v1/delivery/eligibility?${params.toString()}`);
    },
  };

  const commerce: CommerceRepository = {
    async getCart() {
      return fetchApi(`/v1/cart`);
    },

    async getOrders() {
      return fetchApi(`/v1/orders`);
    },

    async getOrder(orderId) {
      return fetchApi(`/v1/orders/${encodeURIComponent(orderId)}`);
    },
  };

  const account: AccountRepository = {
    async getProfile() {
      return fetchApi(`/v1/account/profile`);
    },

    async getAddresses() {
      return fetchApi(`/v1/account/addresses`);
    },
  };

  const vendor: VendorRepository = {
    async getDashboard() {
      return fetchApi(`/v1/vendor/dashboard`);
    },
  };

  const admin: AdminRepository = {
    async getDashboard() {
      return fetchApi(`/v1/admin/dashboard`);
    },
  };

  return {
    discovery,
    catalog,
    delivery,
    commerce,
    account,
    vendor,
    admin,
  };
}
