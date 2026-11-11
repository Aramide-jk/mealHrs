import type { AddressId } from "./ids";

export type CustomerProfile = Readonly<{
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  defaultAddressId: AddressId;
}>;
