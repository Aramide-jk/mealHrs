import "server-only";

import { asAreaId, type AreaId } from "@mealhrs/domain";
import { cookies } from "next/headers";

export const ACTIVE_AREA_COOKIE = "mealhrs_active_area";

const knownAreas = new Set(["area-ikotun", "area-egbe", "area-ikeja"]);

export async function getActiveAreaId(): Promise<AreaId> {
  const value = (await cookies()).get(ACTIVE_AREA_COOKIE)?.value;
  return asAreaId(value && knownAreas.has(value) ? value : "area-ikotun");
}
