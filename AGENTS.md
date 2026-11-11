# MealHrs engineering instructions

## Source of truth

- Treat `mockup/` as the approved visual and interaction reference. Do not modify it unless explicitly asked.
- Read the relevant feature, its route, domain types, repository contract, mock data, and tests before changing behaviour.
- Preserve the distinction between **immediate orders**, **Meal Drops/pre-orders**, **delivery eligibility**, **dishes/offers**, and **Reels/posts**.
- Current screens are frontend previews. Never imply local state, fixture data, or simulated payment is a saved or authorised production action.

## Architecture boundaries

- Keep business entities in `packages/domain`, transport-facing interfaces in `packages/contracts`, fixtures/adapters in `packages/mocks`, and app composition in `apps/web/src/lib/repositories.ts`.
- Feature UI belongs in `apps/web/src/features/<feature>`; route files should primarily load data and compose a feature.
- Do not call mock data directly from feature UI. Use the typed repository interfaces.
- Keep server-only data composition out of Client Components. Add `"use client"` only for browser interaction.
- When backend work is approved, add typed mutation contracts and an HTTP adapter; do not smuggle persistence into client stores or mock repositories.
- Server-side authentication, authorisation, payment, availability, pricing, and fulfillment validation are mandatory future backend responsibilities.

## Design consistency

- Use Manrope (400/500/600) and the tokens in `packages/ui/src/tokens.css`.
- Preserve the light canvas, white surfaces, restrained green primary, orange accent, compact controls, quiet borders, and existing radius/spacing scale.
- Prefer existing `Button`, `Status`, `Notice`, `Skeleton`, and `EmptyState` primitives before adding variants.
- Avoid gradients, oversized headings/cards, heavy type weights, generic dashboard decoration, and unrelated interaction patterns.
- Keep mobile navigation and fixed actions clear of safe areas and sheet/dialog actions.

## Quality bar

- TypeScript is strict. Avoid `any`, unsafe casts, and duplicated domain shapes.
- Use semantic HTML, associated labels, keyboard access, visible focus states, and reduced-motion-safe interactions.
- Cover changed logic with Vitest where appropriate; update Playwright flows when user-visible workflows change.
- Run the smallest relevant checks, then `pnpm typecheck` and `pnpm lint` for cross-cutting changes. Do not weaken tests to make a change pass.
- Preserve user changes in a dirty worktree. Do not use destructive Git commands.
