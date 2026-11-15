import { describe, expect, it } from "vitest";
import type { VendorOperatingSchedule } from "@mealhrs/domain";
import { isImmediateOrderingOpen } from "./menu-preview-context";

const schedule: VendorOperatingSchedule = {
  weeklyHours: [{ day: "Monday", open: true, openTime: "10:00", closeTime: "20:00" }],
  maxSimultaneousOrders: 12,
  pauseImmediate: false,
  pausePreorders: false,
  specialClosureNote: "",
};

describe("isImmediateOrderingOpen", () => {
  it("allows immediate ordering only inside the active Lagos window", () => {
    expect(isImmediateOrderingOpen(schedule, new Date("2026-11-09T12:00:00+01:00"))).toBe(true);
    expect(isImmediateOrderingOpen(schedule, new Date("2026-11-09T20:00:00+01:00"))).toBe(false);
  });

  it("honours an immediate pause and a closure note without closing Meal Drop state", () => {
    expect(isImmediateOrderingOpen({ ...schedule, pauseImmediate: true }, new Date("2026-11-09T12:00:00+01:00"))).toBe(false);
    expect(isImmediateOrderingOpen({ ...schedule, specialClosureNote: "Closed today" }, new Date("2026-11-09T12:00:00+01:00"))).toBe(false);
  });
});
