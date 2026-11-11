import type { AreaId, FeedMode } from "@mealhrs/domain";
import { asAreaId } from "@mealhrs/domain";
import { repositories } from "@/lib/repositories";

export async function loadDiscoveryFeed(
  mode: FeedMode = "explore_nigeria",
  areaId: AreaId = asAreaId("area-ikotun"),
) {
  const feed = await repositories.discovery.getFeed({ mode, areaId });
  if (!feed.ok) throw new Error(feed.error.message);
  return feed.data.items;
}

export async function loadAllMeals() {
  const result = await repositories.catalog.listMeals();
  if (!result.ok) throw new Error(result.error.message);
  return result.data;
}
