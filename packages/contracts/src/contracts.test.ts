import { describe, expect, it } from "vitest";
import { ok, fail } from "./result";
import { emailSchema, phoneSchema, instructionsSchema, addressInputSchema } from "./schemas";

describe("result contract helper", () => {
  it("wraps successful value with ok: true", () => {
    const res = ok({ id: "item-1", value: 42 });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.data.id).toBe("item-1");
      expect(res.data.value).toBe(42);
    }
  });

  it("wraps failure details with ok: false and typed error", () => {
    const res = fail({ code: "not_found", message: "Resource missing", retryable: false });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("not_found");
      expect(res.error.retryable).toBe(false);
    }
  });
});

describe("schemas validation", () => {
  it("validates Nigerian phone numbers", () => {
    expect(phoneSchema.safeParse("+2348031234567").success).toBe(true);
    expect(phoneSchema.safeParse("08031234567").success).toBe(false); // must start with +234
    expect(phoneSchema.safeParse("invalid-phone").success).toBe(false);
  });

  it("validates emails", () => {
    expect(emailSchema.safeParse("user@example.com").success).toBe(true);
    expect(emailSchema.safeParse("not-an-email").success).toBe(false);
  });

  it("validates address inputs and character boundaries", () => {
    const valid = addressInputSchema.safeParse({
      label: "Home",
      line1: "12 Community Road, Ikotun",
      areaId: "area-ikotun",
      instructions: "Ring the doorbell",
    });
    expect(valid.success).toBe(true);

    const invalid = addressInputSchema.safeParse({
      label: "H", // too short (min 2)
      line1: "12 Short", // too short (min 8)
      areaId: "",
    });
    expect(invalid.success).toBe(false);

    // instructions length limit (300 chars)
    expect(instructionsSchema.safeParse("a".repeat(301)).success).toBe(false);
  });
});
