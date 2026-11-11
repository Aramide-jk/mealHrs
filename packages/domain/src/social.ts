import type { OfferId, SocialPostId, VendorId } from "./ids";

export type MediaAsset = Readonly<{
  kind: "image" | "video";
  src: string;
  poster?: string;
  width: number;
  height: number;
  alt: string;
}>;

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
