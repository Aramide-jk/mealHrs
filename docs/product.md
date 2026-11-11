# Product and workflows

## Vision

MealHrs helps people discover food from independent kitchens and place either an immediate order or a scheduled Meal Drop/pre-order. The product combines a short-form food feed with catalogue, delivery, and commerce views. Its intended visual character is calm, bright, compact, and premium rather than a dense marketplace.

## Roles

| Role | Primary outcome | Current surface |
| --- | --- | --- |
| Customer | Discover, assess availability, add a meal, and follow an order | Discovery, commerce, account routes |
| Vendor | Prepare immediate and Meal Drop orders, maintain a menu, delivery zones, content, and storefront | `/vendor` |
| Super Admin | Review marketplace operations, users, content, delivery, finance, and access records | `/admin` |

## Customer workflows

### Discover to basket

The Reels feed supports nearby, following, and Nigeria-wide modes. Area selection affects mock feed/search eligibility. A reel can expose a linked meal and lead to a dish, kitchen, or Meal Drop detail. Like, save, follow, comment, share, and repost interactions are **Mocked/local preview** state; they do not update a social service.

### Immediate ordering

1. A customer chooses a dish/offer and its options.
2. Delivery eligibility and pickup-only constraints are evaluated through the current repository.
3. The item is added to the browser-persisted cart.
4. Cart identity permits one vendor and one ordering mode. An incompatible addition replaces the existing cart.
5. Checkout derives subtotal, delivery fee, service fee, and total, then creates a simulated payment preview.
6. The result screen defaults to a pending-to-success preview and also supports an explicit failed preview with retry controls. It never charges a card or creates an order.

### Meal Drops

Meal Drops are scheduled limited-capacity batches, separate from immediate ordering. The UI checks cutoff time, remaining capacity, and eligibility before allowing a `meal_drop` cart item. A Meal Drop is not interchangeable with an immediate offer, even when it contains the same dish.

### Account and support

Profile, addresses, settings, reviews, support, and disputes are navigable frontend flows. Address checks validate local input and supported mock areas; no geocoding or support case persistence exists.

## Vendor workflows

Vendor onboarding guides profile, fulfillment, payout-preview, and first-menu steps. The dashboard separates immediate orders from Meal Drop/pre-order orders. Order controls expose searching, status filters, fulfillment filters, sort, details, a fulfillment timeline, and state-appropriate local actions. Menu availability and newly added dishes are local preview state. Content, delivery zones, storefront, earnings, analytics, and settings use seeded data and local controls.

## Super Admin workflows

The control-room interface covers vendor review, customers, orders, disputes, moderation, delivery zones, finance, analytics, roles, audit, and settings. Its actions are demonstrations of future operations; they do not enforce access, alter marketplace records, transfer funds, or create a durable audit trail.

## Product rules that must remain distinct

- An offer is a vendable configuration of a dish; a dish is the underlying food item.
- A cart has one vendor and exactly one ordering mode.
- Immediate orders and Meal Drops use different availability and fulfillment semantics.
- Delivery eligibility belongs to the vendor + area pairing; pickup-only is not the same as unavailable.
- A Reel/post is content and may link to an offer, but it is not itself an orderable item.
