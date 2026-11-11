import type { Metadata } from "next";
import { ReelsFeed, type ReelItem } from "@/features/discovery/reels-feed";
import { loadDiscoveryFeed } from "@/features/discovery/load";
import { asAreaId, type FeedMode } from "@mealhrs/domain";

export const metadata: Metadata = { title: "Discover food" };

export default async function DiscoverPage() {
  const areas=[asAreaId("area-ikotun"),asAreaId("area-egbe"),asAreaId("area-ikeja")] as const;
  const modes=["near_me","following","explore_nigeria"] as const satisfies readonly FeedMode[];
  const feeds:Record<string,Record<FeedMode,ReelItem[]>>={};
  const loaded=await Promise.all(areas.flatMap(area=>modes.map(async mode=>({area,mode,records:await loadDiscoveryFeed(mode,area)}))));
  for(const area of areas)feeds[area]={near_me:[],following:[],explore_nigeria:[]};
  for(const {area,mode,records} of loaded){feeds[area]![mode]=records.map(({post,vendor,dish,offer}) => ({
    id: post.id,
    vendor: { id: vendor.id, name: vendor.name, handle: vendor.handle, slug: vendor.slug, publicArea: vendor.publicArea, verified: vendor.verified },
    caption: post.caption,
    media: post.media,
    engagement: post.engagement,
    ...(dish && offer ? { meal: { dishId: dish.id, offerId: offer.id, name: dish.name, imageUrl: dish.imageUrl, price: offer.price, offerStatus: offer.orderingMode === "meal_drop" ? "preorder" as const : "available" as const, ...(offer.mealDropId ? { mealDropId: offer.mealDropId } : {}) } } : {}),
  }));}
  return <ReelsFeed feeds={feeds}/>;
}
