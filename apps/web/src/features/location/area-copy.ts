import type { AreaId } from "@mealhrs/domain";

const areaNames: Readonly<Record<string, string>> = {
  "area-ikotun": "Ikotun",
  "area-egbe": "Egbe",
  "area-ikeja": "Ikeja",
};

export function areaName(areaId: AreaId): string {
  return areaNames[areaId] ?? "your area";
}
