# Frontend architecture

## Monorepo

MealHrs uses pnpm workspaces and Turborepo.

```text
apps/web/              Next.js 16 App Router application
packages/domain/       Branded IDs and business entity types
packages/contracts/    Result type, validation schemas, repository interfaces
packages/mocks/        Fixture data and the current repository implementation
packages/ui/           Shared CSS design tokens
mockup/                Approved static visual reference (protected)
docs/                  Project handover documentation
```

The web app uses route groups for `(customer)`, `(vendor)`, and `(admin)` and route files map those paths to feature modules. `src/features` owns feature UI and tests; `src/components` owns shells and reusable UI; `src/lib` owns provider setup, active-area support, and the repository composition root.

## Data flow

```text
Server route/layout → AppRepositories interface → mockRepositories → typed fixtures
                                          ↓
                                    feature UI
                                          ↓
                      component state / React Query / Zustand as appropriate
```

`apps/web/src/lib/repositories.ts` is the single application composition point. It currently binds `mockRepositories`. A future HTTP adapter should implement the same contracts and replace this binding without forcing feature UI to understand transport.

## Rendering and state

- Next App Router performs route/layout composition; browser-interactive modules are Client Components.
- `Providers` installs TanStack Query with a 30-second stale time, one query retry, no window-focus refetch, and no mutation retry.
- `CustomerContext` holds the selected area, preview sign-in state, and pending intent. It writes the selected area cookie client-side.
- Zustand persists the cart and payment preview under `mealhrs-cart` in the browser.
- Other dashboard, social, and form interactions intentionally use local component state for this preview.

## Architectural decisions

| Decision | Reason |
| --- | --- |
| Typed domain + contracts packages | Keeps UI independent of backend transport and prevents repeated ad-hoc record shapes. |
| Mock adapter rather than temporary API | Enables complete frontend workflows without inventing a throwaway backend. |
| Separate role route groups and shells | Keeps customer, vendor, and admin navigation/responsibilities isolated. |
| Distinct immediate and Meal Drop models | Prevents scheduled capacity/cutoff behavior from leaking into on-demand order paths. |
| Client persistence only for cart/payment preview | Makes the preview usable across refreshes without suggesting operational persistence. |

## Current boundaries

There is no real HTTP client, database, authentication/session validation, authorization, mutation contract, payment provider, media service, messaging system, or notification service. Those concerns must be added behind contracts and enforced by the backend; they must not be inferred from the current frontend screens.
