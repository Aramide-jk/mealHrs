# MealHrs Full-Stack Validation & API Readiness Plan

This document establishes the completed Phase 0, 1, 2, 3, 4, & 5 validation roadmap for the MealHrs platform, adhering strictly to `SKILL.md` and `AGENTS.md`.

---

## 1. Project Services & Packages Map

| Package / App | Path | Role | Tech Stack | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Web Frontend** | `apps/web` | Customer, Vendor, and Super Admin UI | Next.js 15, React 19, CSS Modules | Active (25 test suites, 74 tests passing) |
| **API Backend** | `apps/api` | Fastify REST API, Drizzle ORM, Paystack | Fastify, Drizzle ORM, PGlite/node-postgres | Active (3 test suites, 30 tests passing, 93.4% coverage) |
| **Domain Entities** | `packages/domain` | Core types, business rules, calculations | TypeScript, strict typing | Production-grade (97.9% coverage, 3 tests) |
| **Contracts** | `packages/contracts` | Transport DTOs, Repository interfaces, Mutations | TypeScript, Zod schemas | Production-grade (100% coverage, 5 tests) |
| **Mocks / Fixtures**| `packages/mocks` | Seed fixtures & frontend preview adapters| TypeScript | Populated & verified (100% coverage, 11 tests) |
| **UI Primitives** | `packages/ui` | Design system tokens & base buttons | CSS Tokens, TypeScript | Production-grade |

---

## 2. Route-to-Endpoint Integration Map

### Customer Routes & Endpoints
| Frontend Route | Purpose | Backing API Endpoint | Data Reads / Writes |
| :--- | :--- | :--- | :--- |
| `/` & `/discover` | Video Reels & Category meals | `GET /v1/discovery/feed` | Reads curated social posts, dishes, and kitchen cards |
| `/k/[vendorSlug]` | Vendor public profile & menu | `GET /v1/catalog/vendors/:slug` | Reads kitchen verification, active drops, and immediate dishes |
| `/dishes/[dishId]` | Dish details & option customizer | `GET /v1/catalog/dishes/:id` | Reads proteins, extras, allergens, pricing |
| `/drops/[dropId]` | Meal Drop batch pre-order page | `GET /v1/catalog/meal-drops/:id` | Reads batch cutoff countdown, portion availability counter |
| `/cart` | Dynamic cart drawer/screen | `GET /v1/cart`, `POST /v1/cart/items` | Writes local cart sync, reads item pricing & packaging |
| `/checkout` | Checkout & address selection | `POST /v1/orders/checkout` | Validates delivery eligibility, calculates totals, creates pending order |
| `/checkout/payment-result` | Paystack redirect handler | `GET /v1/payments/verify/:reference` | Confirms Paystack transaction, transitions order to `paid` |
| `/orders` & `/orders/[id]` | Customer live order tracking | `GET /v1/orders`, `GET /v1/orders/:id` | Reads order lifecycle progress path & fulfillment mode |
| `/orders/[id]/review` | Post-delivery rating & review | `POST /v1/reviews` | Writes dish rating, food quality review, hygiene feedback |
| `/auth` | Customer phone OTP login | `POST /v1/auth/otp/send`, `POST /v1/auth/otp/verify` | Authenticates customer, issues JWT |
| `/profile/addresses` | Saved customer addresses | `GET /v1/account/addresses`, `POST /v1/account/addresses` | Reads and saves delivery addresses |

### Vendor Routes & Endpoints
| Frontend Route | Purpose | Backing API Endpoint | Data Reads / Writes |
| :--- | :--- | :--- | :--- |
| `/vendor` | Vendor operational overview | `GET /v1/vendor/dashboard` | Reads today's gross sales, active orders, pending reviews |
| `/vendor/orders` | Live kitchen incoming orders board | `GET /v1/vendor/orders`, `PATCH /v1/vendor/orders/:id/status` | Reads live orders; writes status updates (accept, prep, ready, dispatch) |
| `/vendor/menu` | Menu management & dish builder | `GET /v1/catalog/vendors/:id/menu` | Creates and updates dishes, prices, proteins, photos |
| `/vendor/drops` | Scheduled Meal Drops scheduler | `GET /v1/catalog/vendors/:id/meal-drops` | Schedules batch drop with cutoff time, max portions |
| `/vendor/delivery` | Delivery zones & pickup settings | `GET /v1/delivery/eligibility` | Writes vendor delivery radius, custom fees, pickup notes |
| `/vendor/earnings` | Payout ledger & transactions | `GET /v1/vendor/dashboard` | Reads settled earnings, pending orders balance, payout history |
| `/vendor/settings` | Kitchen profile & bank NUBAN | `PATCH /v1/vendor/profile`, `POST /v1/vendor/bank/resolve` | Resolves 10-digit NUBAN with Paystack; updates kitchen details |

### Super Admin Governance Routes & Endpoints
| Frontend Route | Purpose | Backing API Endpoint | Data Reads / Writes |
| :--- | :--- | :--- | :--- |
| `/admin` | Omnisearch & commercial pulse | `GET /v1/admin/dashboard` | Reads GMV, active deliveries, active kitchens nationwide |
| `/admin/delivery` | Regional coverage directory | `GET /v1/delivery/areas` | Reads and toggles state/city directory hubs across Nigeria |
| `/admin/vendors` | Compliance dossiers & KYC approval | `GET /v1/admin/dashboard` | Reads CAC & hygiene docs; writes approval/pause state |
| `/admin/orders` | Kitchen support mediation | `GET /v1/orders` | Logs kitchen mediation notes, adds prep buffer, refunds |
| `/admin/finance` | Vendor payout ledger & settlement | `GET /v1/admin/dashboard` | Reads weekly ledger, executes batch Paystack transfers |
| `/admin/disputes` | Customer dispute resolution | `GET /v1/admin/dashboard` | Inspects photo evidence, executes refunds or settlements |
| `/admin/settings` | Emergency Kill-Switch & Banner | `GET /v1/admin/killswitch`, `POST /v1/admin/killswitch` | Toggles immediate ordering emergency platform kill-switch |

---

## 3. Database Schema Blueprint (PostgreSQL via Drizzle ORM)

1. **`users`**: Identity, phone, email, role (`customer`, `vendor`, `admin`), status (`active`, `restricted`).
2. **`vendors`**: Kitchen profile, slug, name, handle, publicArea, state, rating, verified, bankName, accountNumber, accountName.
3. **`vendor_delivery_zones`**: Vendor ID, areaId, neighborhood, state, deliveryFee, estimate, minOrder, immediateEnabled, scheduledEnabled.
4. **`dishes`**: Kitchen ID, name, slug, description, category, price, allergens, optionGroups, imageUrl, isAvailable.
5. **`meal_drops`**: Kitchen ID, dishId, title, batchDate, cutoffTime, portionsMax, portionsReserved, status (`scheduled`, `open`, `locked`, `completed`).
6. **`orders`**: Reference (`MH-xxxxx`), customerId, vendorId, total, subtotal, deliveryFee, packagingFee, paymentStatus, fulfillmentStatus, fulfillmentMode, deliveryAddress.
7. **`coverage_hubs`**: AreaId, name, state, customerDemand, activeVendors, enabled, isAutoDiscovered.
8. **`audit_logs`**: AdminId, action, target, category, timestamp.

---

## 4. Seeding Verification

The seeder is **idempotent** (`pnpm --filter @mealhrs/api seed` can be run multiple times safely):
- Verified counts: `{ users: 4, vendors: 6, dishes: 6, mealDrops: 3, orders: 2, coverageHubs: 7 }`.
- **Nationwide Footprint:** Lagos (Ikotun, Egbe, Surulere), Abuja FCT (Wuse 2), Rivers (Old GRA Port Harcourt), Oyo (Bodija Ibadan).

---

## 5. Paystack & Security Verification

- **Timing-Safe HMAC SHA-512 Verification:** Implemented on `/v1/payments/paystack/webhook` using `crypto.timingSafeEqual` over raw request buffer. Rejects unauthenticated or tampered payloads with `401 Unauthorized`.
- **Replay Attack Protection:** Duplicate webhook triggers for already-settled references are detected and acknowledged idempotently (`alreadyProcessed: true`) without duplicating ledger entries.
- **Settlement Ledger Updating:** Automatically transitions orders from `pending` to `paid` upon verified `charge.success` events and appends audit logs.
- **Emergency Platform Killswitch:** `/v1/admin/killswitch` allows instant platform freeze. While active, any `/v1/orders/checkout` attempts are blocked with `503 Service Unavailable`.
- **Mandatory Git Secret Scan (Clean):** Full Git history scanned via `git grep -E` across all commits. Zero AWS keys, zero private keys, zero embedded passwords, zero unmasked API tokens committed. All `.env*` files properly ignored; `.env.example` templates created with placeholders only.

---

## 6. Execution Checklist & Verification Results

- [x] Phase 0: Complete system discovery & Route-to-Endpoint mapping (`validation-plan.md`)
- [x] Phase 1: Initialize `@mealhrs/api` with Fastify & Drizzle ORM
- [x] Phase 1: Define PostgreSQL schema and migrations with dual-driver connection manager (PGlite / node-postgres)
- [x] Phase 1: Build idempotent multi-state Nigerian marketplace seeder
- [x] Phase 1: Verify database state directly via query runner (`db.test.ts` passed 5/5 tests)
- [x] Phase 2: Implement REST endpoints in Fastify (`server.ts`)
- [x] Phase 2: Add Paystack transaction initialization and HMAC SHA-512 verified webhooks
- [x] Phase 2: Add Super Admin emergency kill-switch endpoints
- [x] Phase 2: Integration tests (`server.test.ts` passed 21/21 tests)
- [x] Phase 3: Add typed mutation contracts in `packages/contracts` (`mutations.ts`)
- [x] Phase 3: Implement typed HTTP repository adapter in `apps/web/src/lib/http-repositories.ts`
- [x] Phase 3: Wire `apps/web/src/lib/repositories.ts` with environment-configurable HTTP adapter
- [x] Phase 3: Full-stack live end-to-end integration test (`fullstack-integration.test.ts` passed 4/4 tests)
- [x] Phase 4: Unit test synchronization & coverage bar:
  - `@mealhrs/contracts`: 100% Statements, 100% Branches, 100% Lines (5 tests)
  - `@mealhrs/mocks`: 100% Lines, 99.3% Statements (11 tests)
  - `@mealhrs/domain`: 97.9% Lines (3 tests)
  - `@mealhrs/api`: 93.4% Lines, 98.7% Lines in `server.ts` (30 tests)
  - `@mealhrs/web`: 74 tests passing (25 test files)
- [x] Phase 5: Security & Design-Flaw Audit:
  - Constant-time `crypto.timingSafeEqual` HMAC SHA-512 verification
  - Replay-attack idempotency guard on Paystack webhook
  - Mandatory git history & working tree secret scan (clean, 0 leaks)
  - Created `.env.example` placeholder templates
- [x] Monorepo Quality: `pnpm typecheck` passed (6/6 packages, 0 errors)
- [x] Monorepo Quality: `pnpm lint` passed (6/6 packages, 0 warnings)
- [x] Monorepo Quality: `pnpm test` passed (123/123 tests passed across workspace)
