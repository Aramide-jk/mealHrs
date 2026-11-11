# MealHrs customer experience contract

Status: implementation contract for the customer-only HTML/CSS/JS mockup. This document is authoritative for routes, links, shared states, and interaction behavior. Vendor workspace and platform administration are deliberately excluded.

## 1. Product hierarchy

The customer experience is commerce-led social discovery. Its visual priority is:

1. Food media.
2. Current orderability for the selected delivery area.
3. Vendor identity and trust.
4. Price, fulfillment timing, and the next purchase action.
5. Social engagement.

Mobile discovery is a vertical, one-post-per-viewport Reels surface. It borrows the natural scroll model, not the visual density of entertainment apps. All non-feed pages use warm porcelain canvas, white surfaces, thin neutral borders, Manrope 400/500/600, compact controls, and leaf green as the only primary action color.

## 2. Shared paths and URL rules

Every HTML file imports `../shared/base.css`, `../shared/shared.js`, and SVG symbols from `../shared/icons.svg#<id>`. Media uses `../assets/<filename>`. No page may rely on absolute disk paths, a server root, or query parameters for core navigation.

Cross-slice links use these exact relative prefixes:

| Current slice | Discovery target | Commerce target | Account target |
|---|---|---|---|
| `discovery/` | `./file.html` | `../commerce/file.html` | `../account/file.html` |
| `commerce/` | `../discovery/file.html` | `./file.html` | `../account/file.html` |
| `account/` | `../discovery/file.html` | `../commerce/file.html` | `./file.html` |

The root `mockup/index.html` routes to `discovery/discover.html`.

### Persistent customer navigation

The only customer bottom-navigation items are:

| Label | Target from discovery | Target from commerce | Target from account |
|---|---|---|---|
| Discover | `./discover.html` | `../discovery/discover.html` | `../discovery/discover.html` |
| Search | `./search.html` | `../discovery/search.html` | `../discovery/search.html` |
| Orders | `../commerce/orders.html` | `./orders.html` | `../commerce/orders.html` |
| Profile | `../account/profile.html` | `../account/profile.html` | `./profile.html` |

No Create tab exists for customers. Vendor publishing is not exposed in this experience.

## 3. Route inventory and ownership

### Discovery slice (`mockup/discovery/`)

| File | Purpose | Primary inbound/outbound links |
|---|---|---|
| `discover.html` | Reels feed with Near Me, Following, Explore Nigeria modes | meal tray opens `#meal-sheet`; vendor identity → `vendor.html`; search → `search.html`; notifications → `notifications.html` |
| `search.html` | Search entry, recent searches, categories, nearby suggestions | submitted query → `results.html`; categories → `category.html`; result → vendor/dish/drop |
| `results.html` | Segmented results for Meals, Kitchens, Videos | meal → `dish.html`; vendor → `vendor.html`; video → `discover.html` |
| `category.html` | Category results with availability and location filters | cards → `dish.html`/`drop.html`; filters remain local mock interactions |
| `vendor.html` | Vendor storefront: Home, Menu, Meal Drops, Videos, Reviews, About | dishes → `dish.html`; drops → `drop.html`; review summary → review section; cart → commerce |
| `dish.html` | Full dish detail and option selection fallback route | add → `../commerce/cart.html`; vendor → `vendor.html` |
| `drop.html` | Dated Meal Drop detail, cutoff, window, dish selection | add → `../commerce/cart.html`; vendor → `vendor.html` |
| `saved.html` | Saved posts and meals, including empty-state example | items → dish/drop/vendor |
| `following.html` | Followed kitchens list and following-feed bridge | vendor → `vendor.html`; feed → `discover.html` |
| `notifications.html` | Grouped order, availability, social, and system notifications | order → `../commerce/order-detail.html`; meal/drop/vendor → discovery targets |

### Commerce slice (`mockup/commerce/`)

| File | Purpose | Primary inbound/outbound links |
|---|---|---|
| `cart.html` | One-vendor cart, quantities, compatibility message, totals | continue → `checkout.html`; add items → vendor; remove → empty state |
| `checkout.html` | Address, delivery/pickup, timing, instructions, price review, simulated payment | address → `../account/addresses.html`; submit → `payment-result.html` |
| `payment-result.html` | Demonstrates pending/success/failure/retry states | success → `confirmation.html`; retry stays local; orders → `orders.html` |
| `confirmation.html` | Recoverable confirmed-order receipt | track → `order-detail.html`; discover → feed |
| `orders.html` | Active and History tabs, order cards, empty history | order → `order-detail.html` |
| `order-detail.html` | Payment, fulfillment timeline, event history, delivery/pickup facts | support → `support.html`; review → `review.html`; dispute → `dispute.html` |
| `review.html` | Verified-purchase review dimensions and text | submit → order detail with toast/confirmation |
| `support.html` | Help categories, order-specific support entry, FAQ | issue → `dispute.html`; orders → order detail |
| `dispute.html` | Structured order issue, evidence placeholder, requested outcome | submit → success state; order → order detail |

### Account slice (`mockup/account/`)

| File | Purpose | Primary inbound/outbound links |
|---|---|---|
| `auth.html` | Email/Google/phone entry, sign-in/create modes, validation | completion → previous intent or `profile.html` |
| `profile.html` | Customer hub, identity, shortcuts, order summary | saved/following/notifications/addresses/settings/support |
| `addresses.html` | Address list, default address, add/edit sheet, unsupported area state | return → checkout/profile |
| `settings.html` | Account, notifications, data, accessibility, sign-out mock | profile; preference controls are local |

## 4. End-to-end journeys

### Immediate-order journey

`discover.html` → open meal-detail sheet → choose required protein/optional extras/quantity → add to order → `../commerce/cart.html` → `checkout.html` → `payment-result.html` success → `confirmation.html` → `order-detail.html` → `review.html`.

The sheet must be a real dialog: `role="dialog"`, `aria-modal="true"`, labelled heading, visible close control, Escape close, click-outside close, focus on first control when opened, focus returned to its trigger when closed. On mobile it rises from the bottom; on desktop it is a compact modal/sheet at the bottom-center. It contains dish image, vendor, name, description, live availability, current price, preparation estimate, required/optional modifiers, quantity, special instructions, and a sticky total/add button. `dish.html` is the shareable full-page equivalent.

### Scheduled Meal Drop journey

`discover.html` or `vendor.html` → `drop.html` → select drop dishes/quantity → `../commerce/cart.html` → compatible scheduled checkout → payment → confirmation/tracking. The UI always shows date, delivery/pickup window, time zone context (`WAT` where useful), and cutoff. Immediate and future fulfillment are never silently combined.

### Search-to-order journey

`search.html` → `results.html` or `category.html` → `vendor.html` or `dish.html` → cart → checkout. Order-focused results prioritize vendors serving the selected area.

### Account/service journey

`profile.html` → addresses/settings/saved/following/notifications/support. Order-linked support starts at `order-detail.html` and preselects the order in support/dispute screens.

## 5. Discovery Reels contract

### Mobile

- Exactly one media post occupies the available viewport above the persistent four-item navigation.
- Vertical scroll uses `scroll-snap-type: y mandatory`; each post uses `scroll-snap-align: start`.
- Still photographs and videos share the same frame. Still images do not receive artificial zoom animation.
- Top layer: light `mealhrs` wordmark, explicit `Delivering to Ikotun`, Near Me / Following / Explore Nigeria tabs, search action.
- Right rail: small vendor avatar, like, comment, save, share; metrics are visually subordinate to orderability.
- Lower layer: handle + verified mark + Follow text action; vendor public area; short caption; compact commerce tray.
- Commerce tray matches the approved reference: translucent uniform cocoa surface, thin light border, small thumbnail, first-line dish name, second-line price + compact availability label, right chevron. No giant CTA.
- Tray activation opens the meal-detail sheet without leaving the feed. Vendor identity navigates to storefront.
- Media text uses a localized uniform translucent backing only when needed; no decorative gradients.

### Desktop

- Centered vertical media frame, max width approximately 520px, with purposeful space around it.
- Left side: compact brand/primary navigation and feed mode.
- Right side: associated product/vendor facts and engagement or opened comments. Do not stretch media into a landscape banner.
- Mouse wheel, trackpad, Page Up/Down, and arrow-key behavior may move between posts in the prototype; focus order follows top controls → media actions → commerce tray → bottom/side navigation.

## 6. Storefront and product anatomy

### Vendor storefront

- Hero uses cover media without exposing a private address.
- Vendor identity includes name, verified state, public area, category, rating, fulfillment modes, Follow and Share.
- Section navigation is Home / Menu / Meal Drops / Videos / Reviews / About; sections with no content are hidden rather than empty top-level tabs.
- Menu separates Available now from Upcoming/Pre-order. Every item shows current availability and selected-area eligibility.
- Desktop may use anchored tab bar and two/three-column content; mobile uses horizontally scrollable compact tabs and single/two-column cards.

### Compact meal card

- Image, name, price, `Available now` / `Pre-order` / `Unavailable` indicator, fulfillment timing, vendor where context requires.
- Entire card is actionable with one semantic link. Secondary save is a real button with accessible pressed state.
- Never use the social post as the authority for price or availability; displayed commerce state is represented as current offer data.

## 7. Availability, location, and time semantics

| State | Visual treatment | Action behavior |
|---|---|---|
| Available now | green `status`; preparation estimate | sheet/dish permits selection and add |
| Pre-order | warm amber `status preorder`; fulfillment date and cutoff | add is enabled until cutoff |
| Cutoff approaching | amber notice with explicit time | add remains enabled; checkout revalidates |
| Cutoff passed | neutral unavailable state; next date if known | add disabled; browse/vendor remains available |
| Out of stock/capacity | neutral unavailable status | modifier/quantity and add disabled |
| Vendor paused | explanatory notice | existing orders accessible; no new add |
| Outside delivery area | location warning; pickup shown only if explicitly enabled | delivery add/checkout disabled until address changes |
| Pickup only | explicit pickup badge and collection window | never silently switches from delivery |

`Delivering to Ikotun` always means the customer's active delivery area. `Amaka's Kitchen · Ikotun` means the vendor's public operating area. `Delivers to Ikotun` means the offer is eligible for the selected area. These phrases must not be interchanged.

Changing the active location revalidates feed relevance, product eligibility, delivery charge, cart, and checkout. The mockup demonstrates this with a location sheet and at least one unsupported-area warning.

## 8. State ownership matrix

| Required state | Owning page/interaction | Observable treatment |
|---|---|---|
| Loading | `discover.html`, `results.html`, `orders.html` | toggle/demo skeleton that preserves layout; status text for assistive technology |
| Empty local discovery | `discover.html` alternate panel | no false availability; invite location change and allow Explore Nigeria |
| Empty search | `results.html` | query retained, suggestions/categories shown |
| Empty saved/following | `saved.html`, `following.html` | calm illustration/icon, explanation, discover CTA |
| Error/retry | `results.html` or notifications demo | inline error notice, retry button; no blank page |
| Unavailable/outside area | meal sheet + `dish.html` | reason, next date/location action, disabled add control |
| Cutoff passed | `drop.html` | closed state, archived content visible, add disabled |
| Cart incompatibility | `cart.html` | immediate and future items require separate orders; clear resolution |
| Empty cart | `cart.html` after remove | vendor-aware empty state and return-to-menu action |
| Disabled submit | meal sheet, checkout, auth, review, dispute | disabled until required choices/valid input; explanatory hint, not color alone |
| Checkout revalidation | `checkout.html` | notice for changed fee/item/address with explicit review action |
| Payment pending | `payment-result.html` | spinner/status, safe instruction not to pay again, recoverable order reference |
| Payment failure | `payment-result.html` | reason-safe failure, Retry payment, View orders/contact support; no duplicate-order implication |
| Payment success | `payment-result.html` → `confirmation.html` | verified success, order reference, tracking action |
| Order exceptional state | `order-detail.html` | timed out/cancelled/refund pending/delivery failed as separate payment/order/fulfillment labels |
| Address conflict | `addresses.html` and checkout | unsupported-area notice; Save/Continue disabled until corrected |
| Support submission success/error | `dispute.html` | case reference on success; retained fields and retry on failure |

Prototype state toggles may be buttons or segmented controls labelled `Preview state`; they must not look like production customer actions.

## 9. Shared components and tokens

Use existing `shared/base.css` tokens and primitives. Do not create competing colors or type scales.

- Typeface: Manrope; body 400, controls 500, headings/emphasis 600 maximum.
- Brand: `--green-600` / `--green-700`; canvas `--canvas`; surfaces `--surface`; text `--ink`; lines `--line`; orange only for restrained food/cutoff emphasis.
- Radius: controls `--r-sm`/`--r-md`; major surfaces `--r-lg`; sheets `--r-xl` where appropriate. Avoid nested large rounded cards.
- Spacing rhythm: 4/8/12/16/20/24/32/40. Typical mobile edge 14–16px; desktop content max `--desktop`.
- Core primitives: `.site-header`, `.mobile-nav`, `.btn`, `.icon-btn`, `.card`, `.surface-section`, `.chip`, `.status`, `.field`, `.choice`, `.media-card`, `.notice`, `.empty-state`, `.skeleton`, `.sheet-backdrop`, `.sheet`, `.segmented`, `.quantity`.
- No decorative gradients, heavy shadows, heavy fonts, oversized headings, neon, glassmorphism, or arbitrary vendor accent colors.

## 10. Header, navigation, and responsive rules

- Standard desktop header: brand, Discover/Search/Orders navigation, selected-area control, notification/account actions.
- Mobile non-feed header: compact back/brand/title and one or two contextual actions. The feed uses its overlay header instead.
- Bottom navigation appears on mobile customer top-level pages and remains four items. Detail, checkout, auth, review, and dispute pages may replace it with contextual back navigation to protect focus.
- At 780px and below, grids become one column, sheets become bottom sheets, and tables become stacked semantic cards.
- Tablet may use two columns where each column remains at least 280px.
- Desktop checkout/order detail uses content + summary rail; summary is sticky only while fully visible and must not trap scrolling.

## 11. Keyboard and accessibility behavior

- Use landmarks, a single `h1`, ordered heading levels, semantic links/buttons/inputs, explicit labels, and accessible names for icon-only controls.
- Visible focus is never removed. Focus order follows visual order.
- Tabs use `role="tablist"`, `role="tab"`, `aria-selected`, and associated panels; arrow-key enhancement is desirable, click/Enter is required.
- Save/like/follow controls expose state with `aria-pressed`; availability is expressed in text, never color alone.
- Modal and bottom-sheet rules are defined in section 4. Escape closes; no focus trap persists after close.
- Images have meaningful food/vendor alt text unless purely decorative. Media controls have labels. Autoplay video is muted; reduced-motion preference prevents nonessential motion.
- Form errors are adjacent to fields and connected with `aria-describedby`; focus moves to the error summary after invalid submit.
- Status/toast updates use polite live regions; payment and destructive outcomes are not communicated only through transient toasts.

## 12. Shared realistic data scenario

The same records should recur across all slices so the mockup feels like one product:

- Customer: Teni Adebayo; active area Ikotun, Lagos; default address `12 Community Road, Ikotun`.
- Primary vendor: Amaka's Kitchen; verified; public area Ikotun; delivery to Ikotun and Egbe; rating 4.8 from 86 verified purchases.
- Immediate offer: Jollof Rice & Chicken, ₦3,500; chicken/turkey/fish options; plantain and extra rice; 25–35 minute preparation; delivery ₦1,200.
- Pre-order: Sunday Party Jollof Meal Drop; cutoff Saturday 6:00 PM WAT; Sunday 1:00–4:00 PM delivery; capacity 40.
- Secondary vendor: Mama K's Soups; egusi and pounded yam; pre-order state.
- Bakery: Butter & Crumb; Saturday bakery drop; pastries and bread.
- Primary active order: `MH-20481`, Amaka's Kitchen, paid, preparing, expected today 2:10–2:40 PM.
- Historical order: `MH-19733`, delivered, eligible for verified review.
- Support case example: missing plantain from `MH-19733`; status submitted/under review.

Media assets: `hero-jollof.png`, `egusi-pounded-yam.png`, `bakery-drop.png`, and `approved-reels-reference.png`. The approved reference is a design reference, not content to embed as a fake interactive screen.

## 13. Explicit exclusions

- No vendor dashboard, vendor onboarding, menu management, staff permissions, earnings, or vendor settings.
- No admin workspace.
- No backend, real authentication, payment, geocoding, video playback service, notifications, database, or external API.
- No customer Create/publish experience.
- No multiple-vendor checkout or live rider GPS.

The prototype may simulate interactions locally, but must not imply that a backend mutation or payment actually occurred.
