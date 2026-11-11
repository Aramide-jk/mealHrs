import { describe, expect, it } from "vitest";
import { mockRepositories } from "./repositories";

describe("admin dashboard mock adapter", () => {
  it("returns preview-safe operational, moderation, and finance data", async () => {
    const result = await mockRepositories.admin.getDashboard();
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.access.role).toBe("super_admin");
    expect(result.data.vendors.some((item) => item.status === "pending_review")).toBe(true);
    expect(result.data.moderation.some((item) => item.status === "flagged")).toBe(true);
    expect(result.data.finance.note).toMatch(/Preview only/i);
  });
});
