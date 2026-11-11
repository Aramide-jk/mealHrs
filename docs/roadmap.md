# Development roadmap

The requested sequence is Customer → Vendor → Super Admin → Backend. The first three frontend role surfaces are now present, but frontend presence does not complete operational capability. Continue only with the next approved phase and preserve the mock/API boundary.

## 1. Customer frontend

**Status: Implemented frontend preview.** Maintain visual polish, accessibility, responsiveness, and clear distinction between immediate orders and Meal Drops. Any further customer work should avoid turning simulation into implied persistence.

## 2. Vendor dashboard

**Status: Implemented frontend preview.** Continue refinement and test coverage where approved. Before production release, vendor actions need authenticated server mutations, durable menu/content/storefront data, availability and capacity controls, dispatch integration, and vendor-specific authorization.

## 3. Super Admin

**Status: Implemented frontend preview.** Before operational use, introduce authenticated privileged access, server-enforced roles, auditable moderation/review actions, trustworthy finance/analytics sources, and immutable/auditable event history.

## 4. Backend

**Status: Planned.** Suggested implementation order:

1. Identity, sessions, customer/vendor/admin roles, and server authorization.
2. Persistent catalogue, vendor, address, delivery-zone, and availability models.
3. Authoritative immediate-order and Meal Drop workflows, including pricing snapshots, capacity reservation, cutoff enforcement, and transition rules.
4. Payment-provider integration with server-side verification, idempotency, refunds, payout/settlement boundaries, and webhooks.
5. Reels/content media pipeline, moderation, notifications, messaging, delivery operations, and analytics/audit events.
6. Replace `mockRepositories` at the single composition point with a tested HTTP adapter, retaining typed contracts and feature boundaries.

## Definition of production-ready

Do not call the system production-ready until every state-changing workflow has server-side validation and authorization, payments are verified server-side, sensitive screens are protected, errors/retries are handled, auditability exists where needed, and mock fixture assumptions have been replaced by tested operational rules.
