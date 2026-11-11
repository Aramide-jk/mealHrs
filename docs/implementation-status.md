# Implementation status and limitations

Status terms: **Implemented** means the described frontend code exists. **Mocked/local preview** means it functions in the UI using fixtures or component/browser state but is not durable or authoritative. **Planned** means no production implementation exists.

## Implemented frontend surfaces

| Area | Status | Notes |
| --- | --- | --- |
| Customer discovery | Implemented / Mocked-local preview | Reels, search, categories, dish/kitchen/drop pages, saved/following/notifications and interaction sheets are present; social effects are local. |
| Customer commerce | Implemented / Mocked-local preview | Cart, checkout, payment-result, orders, reviews, support/disputes are present; payment and order submission are simulations. |
| Customer account | Implemented / Mocked-local preview | Auth, profile, addresses, and settings routes are present; sign-in and data edits are not real accounts. |
| Vendor | Implemented / Mocked-local preview | Onboarding, overview, orders, menu, Meal Drops, content, delivery, earnings, analytics, storefront, and settings are present. Operational actions remain local. |
| Super Admin | Implemented / Mocked-local preview | Access, overview, vendors, customers, orders, disputes, moderation, delivery, finance, analytics, roles, audit, settings are navigable frontend screens. |
| Shared foundations | Implemented | Typed domain/contracts/mocks, repository composition, design tokens, shells, responsive navigation, and test configuration are present. |

## Known limitations

- No real API, database, server mutation, authentication, authorization, or role protection.
- No payment gateway, charge, refund, payout, settlement, or financial ledger.
- No durable orders, cart synchronization, inventory reservation, Meal Drop capacity reservation, delivery dispatch, messaging, notification, or media upload.
- Admin access is a preview acknowledgement, not access control. Admin finance, analytics, audit, and marketplace actions are fixture displays/local UI state.
- Vendor menu additions, availability edits, Meal Drop changes, content actions, zones, storefront, and settings are not published to the customer experience.
- Current eligibility logic and metrics are intentionally narrow fixture examples, not production business policy.
- Most changes reset on refresh; cart/payment preview is the explicit browser-persisted exception.

## Review guidance

Review a proposed change against the role shell, feature module, corresponding domain type, contract, mock adapter, and test. If it claims a real effect, verify the server-side authority exists; currently it does not.
