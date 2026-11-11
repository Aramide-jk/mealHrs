import { describe, expect, it } from "vitest";
import { validateAddressDraft } from "./address-validation";

describe("address validation", () => {
  it("blocks an otherwise complete address outside delivery coverage", () => {
    expect(validateAddressDraft({ label: "Work", line1: "4 Allen Avenue", area: "Ikeja", directions: "" })).toEqual([
      "Choose a supported area before saving this delivery address.",
    ]);
  });

  it("accepts a complete supported address", () => {
    expect(validateAddressDraft({ label: "Home", line1: "12 Community Road", area: "Ikotun", directions: "Blue gate" })).toEqual([]);
  });

  it("reports every missing required field together", () => {
    expect(validateAddressDraft({ label: "", line1: "", area: "Ikotun", directions: "" })).toHaveLength(2);
  });
});
