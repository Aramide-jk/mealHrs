# Data, contracts, and business rules

## Domain model

`packages/domain` supplies branded identifiers and immutable TypeScript entity types. Principal entities are Vendor, Dish, MenuOffer, SocialPost, MealDrop, Cart, Order, CustomerProfile/Address, VendorDashboardSnapshot, and AdminDashboardSnapshot. Money is represented as a typed `Money` value in NGN fixtures rather than an untyped display string.

Orders separate payment, order, and fulfillment state:

```text
payment: pending | paid | failed | refund_pending | refunded
order: pending_vendor | confirmed | preparing | ready | cancelled | timed_out
fulfillment: scheduled | preparing | ready_for_dispatch | out_for_delivery | delivered | delivery_failed
```

## Repository contracts

`AppRepositories` groups asynchronous interfaces for discovery, catalog, delivery, commerce, account, vendor, and admin data. Every read returns `Promise<Result<T>>`, giving UI a typed success/failure boundary. Current contracts are read-oriented. Mutation APIs, authorization context, idempotency, and server error mapping are future backend work.

## Mock data

`packages/mocks` implements every current repository with seeded fixtures. It provides search, cursor-like feed pagination, catalogue lookups, delivery eligibility, cart/order/profile reads, and dashboard snapshots. It is not an in-memory backend: most feature actions do not mutate it and therefore disappear on refresh.

## Present mock business rules

| Rule | Current behavior | Status |
| --- | --- | --- |
| Feed area | `area-ikeja` has no nearby eligible vendors; other fixture areas expose seeded posts | Mocked/local preview |
| Delivery | `area-ikeja` returns outside-area; Butter & Crumb returns pickup-only; other cases are eligible with fixed fee/estimate | Mocked/local preview |
| Cart compatibility | A cart keeps one vendor and one ordering mode; an incompatible add replaces contents | Implemented client-side |
| Meal Drop | Cutoff, remaining capacity, and eligibility govern addability | Implemented against fixture data |
| Payment | Checkout derives a preview; the result defaults to pending-to-success and can demonstrate failure/retry; no transaction exists | Mocked/local preview |

## Validation

The contracts package defines Zod schemas for email, Nigerian phone syntax, delivery instructions, and address inputs. React Hook Form and Zod are installed, but form implementation is not yet uniform across all screens. Preserve current validated paths; standardize a broader form pattern only alongside actual server mutations.

## Backend integration guidance

When backend work begins:

1. Keep branded IDs/domain models and extend repository interfaces with validated mutation operations.
2. Implement an HTTP adapter, then change only the `repositories.ts` composition binding.
3. Enforce eligibility, inventory/capacity, prices, order transitions, and payment verification on the server.
4. Introduce authenticated actor context and role enforcement before exposing Vendor/Admin mutations.
5. Replace fixture financial/analytics/audit records with auditable, server-derived data.
