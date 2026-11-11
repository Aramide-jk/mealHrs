import { describe, expect, it } from "vitest";
import { formatMoney, ngn } from "./money";

describe("money", () => {
  it("formats Nigerian naira without fractional noise", () => {
    expect(formatMoney(ngn(3500))).toContain("3,500");
  });
});
