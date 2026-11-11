import { asAreaId,asVendorId } from "@mealhrs/domain";
import { describe,expect,it } from "vitest";
import { vendorServiceCopy } from "./vendor-view";
describe("vendorServiceCopy",()=>{it("describes Butter & Crumb as pickup-only",()=>{expect(vendorServiceCopy("Butter & Crumb",{status:"pickup_only",vendorId:asVendorId("vendor-butter-crumb"),areaId:asAreaId("area-ikotun"),pickupWindow:"Saturday, 9 AM–12 PM",reason:"This bakery drop is pickup only."})).toMatch(/pickup only/i);});});
