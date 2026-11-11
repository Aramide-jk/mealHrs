export type Brand<T, TBrand extends string> = T & {
  readonly __brand: TBrand;
};

export type VendorId = Brand<string, "VendorId">;
export type DishId = Brand<string, "DishId">;
export type OfferId = Brand<string, "OfferId">;
export type MealDropId = Brand<string, "MealDropId">;
export type SocialPostId = Brand<string, "SocialPostId">;
export type OrderId = Brand<string, "OrderId">;
export type AddressId = Brand<string, "AddressId">;
export type AreaId = Brand<string, "AreaId">;

export const asVendorId = (value: string) => value as VendorId;
export const asDishId = (value: string) => value as DishId;
export const asOfferId = (value: string) => value as OfferId;
export const asMealDropId = (value: string) => value as MealDropId;
export const asSocialPostId = (value: string) => value as SocialPostId;
export const asOrderId = (value: string) => value as OrderId;
export const asAddressId = (value: string) => value as AddressId;
export const asAreaId = (value: string) => value as AreaId;
