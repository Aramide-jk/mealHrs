# MealHrs customer experience mockup

This is the complete standalone HTML/CSS/JavaScript customer prototype used to review MealHrs before production development begins. Open `index.html`; it routes to the Reels-first discovery experience.

## Coverage

- Discovery Reels, search, results, categories and location states
- Vendor storefront, dish details, Meal Drops and meal-selection bottom sheet
- Saved meals, followed kitchens and notifications
- Cart, checkout, simulated payment states and confirmation
- Active/history orders, tracking, verified review, help and disputes
- Authentication, profile, addresses and settings
- Responsive mobile, tablet and desktop layouts

## Structure

- `discovery/` — customer food discovery and vendor/product browsing
- `commerce/` — cart through fulfillment, review and support
- `account/` — authentication, profile, addresses and preferences
- `shared/` — design tokens, UI primitives, icons and shared interactions
- `docs/customer-flow-contract.md` — authoritative route and state contract

Run `node verify.mjs` to check the route inventory, local references, shared styles, headings, typography limits and no-gradient constraint.

This mockup intentionally contains no backend, real authentication, payment, geocoding, notifications, vendor dashboard or administration interface.
