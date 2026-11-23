import { describe, expect, it, beforeAll, afterAll } from "vitest";
import http from "node:http";
import { createHttpRepositories } from "./http-repositories";
import { asAreaId, asVendorId } from "@mealhrs/domain";

describe("createHttpRepositories: Typed HTTP Repository Adapter", () => {
  let server: http.Server;
  let serverUrl: string;
  const requests: { url: string; method: string }[] = [];

  beforeAll(async () => {
    server = http.createServer((req, res) => {
      requests.push({ url: req.url ?? "", method: req.method ?? "GET" });

      if (req.url?.startsWith("/v1/discovery/feed")) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ items: [{ id: "feed-1" }], nextCursor: "2" }));
        return;
      }

      if (req.url?.startsWith("/v1/discovery/search")) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ dishes: [], vendors: [], posts: [] }));
        return;
      }

      if (req.url === "/v1/discovery/saved-posts") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify([]));
        return;
      }

      if (req.url === "/v1/discovery/followed-vendors") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify([]));
        return;
      }

      if (req.url === "/v1/catalog/meals") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify([]));
        return;
      }

      if (req.url === "/v1/catalog/vendors/amakas-kitchen") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ id: "vendor-amaka", slug: "amakas-kitchen", name: "Amaka's Kitchen" }));
        return;
      }

      if (req.url === "/v1/catalog/vendors/not-found") {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Vendor not found" }));
        return;
      }

      if (req.url?.startsWith("/v1/delivery/eligibility")) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "eligible", deliveryFee: { amount: 800, currency: "NGN" } }));
        return;
      }

      if (req.url === "/v1/admin/dashboard") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ access: { name: "Nneka Okafor", role: "super_admin" } }));
        return;
      }

      if (req.url === "/v1/server-error") {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Internal server error" }));
        return;
      }

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true }));
    });

    await new Promise<void>((resolve) => {
      server.listen(0, "127.0.0.1", () => {
        const addr = server.address();
        if (typeof addr === "object" && addr) {
          serverUrl = `http://127.0.0.1:${addr.port}`;
        }
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it("discovery.getFeed: passes mode, areaId, and cursor parameters", async () => {
    const repos = createHttpRepositories(serverUrl);
    const result = await repos.discovery.getFeed({
      mode: "explore_nigeria",
      areaId: asAreaId("area-ikotun"),
      cursor: "1",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.nextCursor).toBe("2");
    }

    const lastReq = requests[requests.length - 1];
    expect(lastReq?.url).toContain("mode=explore_nigeria");
    expect(lastReq?.url).toContain("areaId=area-ikotun");
    expect(lastReq?.url).toContain("cursor=1");
  });

  it("discovery.search: properly encodes search query and areaId", async () => {
    const repos = createHttpRepositories(serverUrl);
    const result = await repos.discovery.search({
      query: "party jollof & dodo",
      areaId: asAreaId("area-ikotun"),
    });

    expect(result.ok).toBe(true);
    const lastReq = requests[requests.length - 1];
    expect(lastReq?.url).toContain("party+jollof+%26+dodo");
    expect(lastReq?.url).toContain("areaId=area-ikotun");
  });

  it("catalog.getVendorBySlug: returns ok on success and fail with not_found on 404", async () => {
    const repos = createHttpRepositories(serverUrl);

    const successResult = await repos.catalog.getVendorBySlug("amakas-kitchen");
    expect(successResult.ok).toBe(true);
    if (successResult.ok) {
      expect(successResult.data.name).toBe("Amaka's Kitchen");
    }

    const notFoundResult = await repos.catalog.getVendorBySlug("not-found");
    expect(notFoundResult.ok).toBe(false);
    if (!notFoundResult.ok) {
      expect(notFoundResult.error.code).toBe("not_found");
      expect(notFoundResult.error.retryable).toBe(false);
    }
  });

  it("delivery.checkEligibility: checks delivery eligibility parameters", async () => {
    const repos = createHttpRepositories(serverUrl);
    const result = await repos.delivery.checkEligibility({
      vendorId: asVendorId("vendor-amaka"),
      areaId: asAreaId("area-ikotun"),
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.status).toBe("eligible");
    }
  });

  it("admin.getDashboard: fetches Super Admin overview snapshot", async () => {
    const repos = createHttpRepositories(serverUrl);
    const result = await repos.admin.getDashboard();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.access.name).toBe("Nneka Okafor");
    }
  });

  it("handles network failures gracefully with retryable network error", async () => {
    // Points to an unopened port
    const repos = createHttpRepositories("http://127.0.0.1:59999");
    const result = await repos.discovery.getFeed({
      mode: "explore_nigeria",
      areaId: asAreaId("area-ikotun"),
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("network");
      expect(result.error.retryable).toBe(true);
    }
  });
});
