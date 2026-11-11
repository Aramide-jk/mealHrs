import type {
  AreaId,
  Cart,
  CustomerAddress,
  CustomerProfile,
  DeliveryEligibility,
  Dish,
  DishId,
  FeedMode,
  MealDrop,
  MealDropId,
  MenuOffer,
  OfferId,
  Order,
  OrderId,
  SocialPost,
  Vendor,
  VendorId,
  VendorDashboardSnapshot,
  AdminDashboardSnapshot,
} from "@mealhrs/domain";
import type { Result } from "./result";

export type Page<T> = Readonly<{
  items: readonly T[];
  nextCursor: string | null;
}>;

export type FeedItem = Readonly<{
  post: SocialPost;
  vendor: Vendor;
  dish?: Dish;
  offer?: MenuOffer;
}>;

export type MealListing = Readonly<{
  dish: Dish;
  offer: MenuOffer;
  vendor: Vendor;
}>;

export interface DiscoveryRepository {
  getFeed(input: Readonly<{ mode: FeedMode; areaId: AreaId; cursor?: string }>): Promise<Result<Page<FeedItem>>>;
  search(input: Readonly<{ query: string; areaId: AreaId }>): Promise<Result<Readonly<{
    dishes: readonly MealListing[];
    vendors: readonly Vendor[];
    posts: readonly SocialPost[];
  }>>>;
  getSavedPosts(): Promise<Result<readonly FeedItem[]>>;
  getFollowedVendors(): Promise<Result<readonly Vendor[]>>;
}

export interface CatalogRepository {
  listMeals(): Promise<Result<readonly MealListing[]>>;
  getVendorBySlug(slug: string): Promise<Result<Vendor>>;
  getVendorMenu(vendorId: VendorId): Promise<Result<readonly Readonly<{ dish: Dish; offer: MenuOffer }>[]>>;
  getVendorMealDrops(vendorId: VendorId): Promise<Result<readonly MealDrop[]>>;
  getDish(dishId: DishId): Promise<Result<Readonly<{ dish: Dish; offer: MenuOffer; vendor: Vendor }>>>;
  getOffer(offerId: OfferId): Promise<Result<MenuOffer>>;
  getMealDrop(mealDropId: MealDropId): Promise<Result<Readonly<{ mealDrop: MealDrop; vendor: Vendor; dishes: readonly Dish[] }>>>;
}

export interface DeliveryRepository {
  getAreas(): Promise<Result<readonly Readonly<{ id: AreaId; name: string; state: string }>[]>>;
  checkEligibility(input: Readonly<{ vendorId: VendorId; areaId: AreaId }>): Promise<Result<DeliveryEligibility>>;
}

export interface CommerceRepository {
  getCart(): Promise<Result<Cart | null>>;
  getOrders(): Promise<Result<readonly Order[]>>;
  getOrder(orderId: OrderId): Promise<Result<Order>>;
}

export interface AccountRepository {
  getProfile(): Promise<Result<CustomerProfile | null>>;
  getAddresses(): Promise<Result<readonly CustomerAddress[]>>;
}

export interface VendorRepository {
  getDashboard(): Promise<Result<VendorDashboardSnapshot>>;
}

export interface AdminRepository {
  getDashboard(): Promise<Result<AdminDashboardSnapshot>>;
}

export interface AppRepositories {
  discovery: DiscoveryRepository;
  catalog: CatalogRepository;
  delivery: DeliveryRepository;
  commerce: CommerceRepository;
  account: AccountRepository;
  vendor: VendorRepository;
  admin: AdminRepository;
}
