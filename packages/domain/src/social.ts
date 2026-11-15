import type { OfferId, SocialPostId, VendorId } from "./ids";

type MediaAssetBase = Readonly<{
  src: string;
  width: number;
  height: number;
  alt: string;
}>;

export type ImageMediaAsset = MediaAssetBase & Readonly<{ kind: "image" }>;

export type VideoMediaAsset = MediaAssetBase & Readonly<{
  kind: "video";
  poster?: string;
}>;

export type CarouselMediaAsset = Readonly<{
  kind: "carousel";
  items: readonly ImageMediaAsset[];
}>;

export type MediaAsset = ImageMediaAsset | VideoMediaAsset | CarouselMediaAsset;

export type SocialPost = Readonly<{
  id: SocialPostId;
  vendorId: VendorId;
  caption: string;
  publishedAt: string;
  media: MediaAsset;
  linkedOfferId?: OfferId;
  engagement: Readonly<{
    likes: number;
    comments: number;
    saves: number;
  }>;
}>;

export type FeedMode = "near_me" | "following" | "explore_nigeria";
