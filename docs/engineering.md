# Engineering standards

## Stack

- Next.js 16, React 19, TypeScript 5.9, App Router
- pnpm workspaces and Turborepo
- Tailwind CSS/PostCSS plus project CSS tokens and CSS modules
- TanStack Query, Zustand, React Hook Form, Zod
- Radix Dialog, CVA, Lucide
- Vitest + Testing Library and Playwright

## Commands

```bash
pnpm dev
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm test:e2e
```

Use package-scoped commands during focused work, for example `pnpm --filter @mealhrs/web test`. Playwright runtime tests target `http://127.0.0.1:3100` with Desktop Chrome and Pixel 7 projects.

## Code conventions

- Use strict TypeScript and `Readonly` domain values; avoid parallel, untyped UI models.
- Put reusable domain rules in a feature utility or package, not in a page component.
- Use `formatMoney`/typed `Money` rather than hand-built currency strings where domain amounts are displayed.
- Keep server composition separate from browser interaction. Do not import server-only adapters into client code.
- Keep UI interactions truthful: label non-persistent actions as preview/local where a real user could otherwise infer a durable side effect.
- Add accessible names to non-text controls; preserve focus return/escape handling in dialogs.

## Verification expectations

- Unit test calculations, availability/eligibility rules, reducers/stores, and interaction-heavy components.
- Maintain route-level E2E coverage for role-critical journeys at mobile and desktop sizes.
- Run the smallest relevant test first. Before handoff, run typecheck and lint; run build/E2E proportionate to routing or cross-feature changes.
- A green static typecheck is not evidence that a local preview persists or that a backend operation is safe.

## Security and reliability boundary

The frontend cannot authorize an actor, validate a payment, protect Admin routes, reserve Meal Drop capacity, or provide an immutable audit log. Treat all of those as backend concerns. Never add secrets to client bundles or encode security policy solely in display logic.
