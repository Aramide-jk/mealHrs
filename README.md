# MealHrs

MealHrs is a responsive food discovery and ordering frontend for independent kitchens. Customers discover food through Reels, browse dishes and Meal Drops, and complete a simulated checkout. Vendors and Super Admins have separate operational dashboards.

This repository is **frontend-only**. Its repositories, payment result, dashboard actions, access screens, and metrics are mock-backed or local-preview behaviour unless documentation says otherwise.

## Run locally

Requirements: Node.js compatible with Next.js 16 and `pnpm 12.3.4`.

```bash
pnpm install
pnpm dev
```

Open the local URL printed by Next.js. Useful routes include `/discover`, `/vendor`, and `/admin`.

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm test:e2e
```

The Playwright runtime configuration uses port `3100`; see `apps/web/playwright.runtime.config.ts` before running E2E checks alongside another local service.

## Documentation

- [Product and workflows](docs/product.md)
- [Architecture and project structure](docs/architecture.md)
- [Design system](docs/design-system.md)
- [Data, contracts, and business rules](docs/data-and-contracts.md)
- [Engineering standards](docs/engineering.md)
- [Implementation status and limitations](docs/implementation-status.md)
- [Development roadmap](docs/roadmap.md)

The approved static design reference remains in [`mockup/`](mockup/README.md). It is protected: implementation should follow it, not replace it.
