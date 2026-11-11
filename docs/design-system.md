# Design system

## Intent

The approved design is light, calm, modern, compact, and operationally clear. It favors white surfaces on a warm off-white canvas, restrained green action color, quiet borders, modest shadows, and soft but legible typography. The static `mockup/` directory is the visual reference for implementation decisions.

## Tokens

The canonical CSS custom properties live in `packages/ui/src/tokens.css`.

| Category | Tokens / value direction |
| --- | --- |
| Canvas and surfaces | `#FCFAF5` canvas, white surface, soft neutral surface |
| Primary | `--color-green-600` `#1F6B45`; darker green for emphasis |
| Accent | orange (`--color-orange-500` / `600`) for selective food or attention cues |
| Semantic status | success green, warning amber, danger red, info blue |
| Text | `--color-ink`, softened ink, muted text |
| Radius | 10, 14, 20, and 28px (`sm` through `xl`) |
| Spacing | 4, 8, 12, 16, 20, 24, 32, 40px equivalents |
| Shadows | restrained `small` and `sheet` shadows |

## Typography

Use Manrope at 400, 500, and 600 only. The root layout imports these weights. Headings use 500 with tight negative tracking; interface copy is typically 400 or 500. Do not introduce heavier font weights, decorative display fonts, or large marketing-scale type into operational screens.

Global type scale: `h1` is responsive from 1.85–2.65rem (smaller on mobile); `h2` 1.35–1.85rem; `h3` 1rem. Feature pages should keep operational headings more compact where existing styles do so.

## Components and patterns

- `Button`: primary, secondary, ghost, danger; compact and block forms are available.
- `Status`: semantic compact state label with a dot.
- `Notice`: contextual success, warning, or danger information.
- `Skeleton` and `EmptyState`: loading/absence patterns.
- Shells: separate customer, vendor, and admin desktop/mobile navigation.
- Dialogs/sheets: use established Radix dialog patterns and ensure their actions clear fixed mobile navigation.
- Cards: white surface, thin `--color-line` border, moderate rounding; avoid unnecessary elevation.

## Responsive and accessible behavior

Desktop content widths are tokenized; mobile layouts shift to single columns at 780px. Customer, vendor, and admin mobile navigation is fixed at the bottom, so page and sheet content must include sufficient bottom/safe-area clearance. Global visible focus, skip links, semantic labels, keyboard interaction, and reduced-motion fallbacks are already established and must be preserved.
