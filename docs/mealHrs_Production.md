# **MEALHRS**

## **Complete Product & Operations Blueprint**

**Draft 1.0 \| November 2026 \| For Product Review**

**Product category:** Social Food Discovery & Ordering Marketplace  
**Initial market:** Nigeria  
**Geographic ambition:** Nationwide vendor onboarding, with location-based customer ordering  
**Primary audience:** Home kitchens, small food vendors, restaurants, bakers, and independent food businesses

---

# **1\. Executive Product Vision**

MealHrs is a social food discovery and ordering platform that allows food businesses across Nigeria to showcase their food through short videos and images, build an audience, and receive orders directly from customers.

The platform combines three major experiences:

1. **Food discovery:** Customers explore food videos, follow food vendors, discover restaurants, and interact with food-related content.  
2. **Food commerce:** Customers order meals for immediate preparation or schedule orders for future dates.  
3. **Vendor business management:** Food vendors manage their storefronts, menus, availability, customers, orders, delivery zones, payments, and business performance.

MealHrs does not cook food, operate restaurants, employ delivery riders, or provide delivery logistics.

Each food business is responsible for preparing and fulfilling its orders, including arranging delivery wherever the vendor has enabled that service.

MealHrs provides the technology connecting food businesses with their customers.

## **1.1 Core product promise**

**For food vendors:** Turn food content into customers, manage orders professionally, and grow an independent food brand.

**For customers:** Discover food worth eating, find vendors that serve your location, and order now or ahead.

**For the platform:** Build a growing network of food businesses and customers through a combination of social discovery, vendor-owned audiences, and transaction-based commerce.

## **1.2 What makes MealHrs different**

MealHrs should not become merely another food delivery application.

Its distinguishing capabilities are:

* Food-only short-video discovery.  
* Independent, branded vendor storefronts.  
* Immediate food ordering.  
* Scheduled meal drops and pre-orders.  
* Location-restricted ordering.  
* Vendor-owned delivery operations.  
* Social following and repeat-customer discovery.  
* Shareable vendor, video, menu, and meal links.  
* A unified operational workspace for different types of food businesses.

The product combines social engagement with real ordering infrastructure.

---

# **2\. Supported Food Businesses**

MealHrs should support multiple categories of vendors without forcing them into separate applications.

| Vendor type | Typical offerings | Ordering model |
| ----- | ----- | ----- |
| Home kitchens | Jollof, soups, local meals, meal boxes | Mostly pre-order |
| Small food vendors | Rice, swallow, beans, daily meals | Immediate and/or pre-order |
| Restaurants | Everyday meals and specials | Mostly immediate |
| Fast-food sellers | Shawarma, burgers, grilled foods | Immediate and/or pre-order |
| Bakeries | Bread, pastries, cakes | Immediate and/or pre-order |
| Snacks sellers | Small chops, puff-puff, pastries | Immediate and/or pre-order |
| Caterers | Party trays, bulk meals, events | Scheduled pre-order |
| Meal-prep businesses | Weekly meal plans and packages | Scheduled pre-order |

These categories help with discovery, onboarding, and analytics. They should not determine which features a vendor is allowed to use.

A bakery should be able to sell ready-made pastries immediately and accept a birthday cake order for next week.

A restaurant should be able to sell today's jollof while collecting pre-orders for Sunday's special.

The operational model belongs to the menu item or offer, not permanently to the vendor's business category.

---

# **3\. Ordering Models**

MealHrs will have three selling configurations.

## **3.1 Immediate Ordering — Order Now**

This model is intended for vendors accepting orders during operating hours.

Example:

**Jollof Rice \+ Chicken — ₦3,500**

The customer selects their delivery address, chooses food options, pays, and submits the order.

The vendor receives the order and begins preparation or packaging.

The vendor arranges delivery through its own personnel or logistics arrangements.

### **Conditions for accepting immediate orders**

The system must verify that:

* The vendor is approved and accepting orders.  
* Immediate ordering is enabled.  
* Current time falls within configured order-taking hours.  
* The vendor has not paused immediate orders.  
* The selected item is available.  
* The item has sufficient inventory or preparation capacity.  
* The delivery address is supported.  
* Vendor delivery is currently enabled, or an eligible pickup option has been selected.  
* The vendor can still accept the requested fulfillment window.

**Order Now does not mean instant delivery.**

It means the restaurant is accepting orders now. Preparation and delivery still take time.

Vendors provide estimated preparation times, and where possible, delivery estimates.

Customers must see estimates as estimates rather than guaranteed arrival times.

## **3.2 Scheduled Pre-order — Meal Drops**

This model serves vendors who prepare food for a specific date or time window.

Example:

**Thursday Special Menu**

* Jollof Rice — ₦3,500  
* Fried Rice — ₦4,000  
* Order cutoff: Wednesday, 9 PM  
* Delivery: Thursday, 4–7 PM

The vendor creates a dated Meal Drop, attaches available dishes, configures quantities, sets the cutoff, and defines fulfillment arrangements.

Customers can place and pay for orders before the cutoff.

When the deadline arrives, ordering closes automatically.

The vendor receives the finalized order information and prepares food according to the scheduled batch.

### **Meal Drop capabilities**

* One-time meal drops.  
* Recurring weekly meal drops.  
* Multiple dishes in one drop.  
* Per-dish quantities and batch capacity.  
* Optional proteins, sides, portions, and extras.  
* Customer special instructions.  
* Scheduled delivery windows.  
* Pickup windows where enabled.  
* Manual early closure.  
* Automatic cutoff enforcement.  
* Pause or cancel an upcoming drop.  
* Copy a previous drop.  
* Share individual dishes or the complete drop.  
* Automatically hide completed drops from active ordering pages.  
* Surface the next available drop.

A previously published drop can remain visible in order history and archived content without allowing new orders.

## **3.3 Hybrid Ordering**

Hybrid vendors support both models.

For example, Amaka's Kitchen sells:

* Shawarma — available now.  
* Fried rice — available during daily operating hours.  
* Sunday party jollof — pre-order only.  
* Celebration trays — pre-order three days ahead.

The system should accommodate all these products through one storefront and one vendor dashboard.

**Recommended implementation:** A reusable dish catalog underneath, with separate selling rules determining immediate availability, scheduled availability, and drop participation.

---

# **4\. User Roles and Permissions**

MealHrs will have four core user groups.

## **4.1 Customer**

A customer can:

* Explore food content.  
* Search for vendors and dishes.  
* Set and manage delivery addresses.  
* Follow vendors.  
* Like, save, share, and comment on content.  
* View restaurant profiles and menus.  
* Order immediately.  
* Place scheduled pre-orders.  
* Pay securely.  
* Track orders.  
* Contact vendors about existing orders.  
* Review verified purchases.  
* Report inappropriate content or vendor behavior.  
* Manage profile, notification preferences, and purchase history.

Browsing public food content should not require signing in.

Authentication becomes necessary for actions such as following, commenting, saving to an account, and placing orders.

## **4.2 Vendor / Business Owner**

The vendor manages the business through a dedicated workspace.

Responsibilities include:

* Registering a business.  
* Completing business and payout verification.  
* Configuring storefront details.  
* Setting delivery coverage.  
* Managing operating schedules.  
* Creating dishes and meal drops.  
* Publishing food content.  
* Receiving and processing orders.  
* Managing delivery arrangements.  
* Responding to customers.  
* Updating order status.  
* Reviewing earnings and transactions.  
* Managing business availability.

A customer should be able to register a vendor business using the same user account, without requiring an entirely separate personal identity.

## **4.3 Vendor Staff**

A business owner may invite staff and assign limited permissions.

Suggested roles:

**Owner:** Full business control.

**Manager:** Menus, orders, availability, content, and operational reporting.

**Kitchen staff:** Assigned orders and preparation-status updates.

**Content manager:** Food posts, profile content, and authorized engagement.

Staff permissions should be enforced per vendor, with no access to unrelated businesses.

## **4.4 Platform Administration**

MealHrs administrators manage:

* Vendor onboarding and review.  
* Verification and safety checks.  
* Customer account moderation.  
* Food content moderation.  
* Marketplace configuration.  
* Delivery-area directory.  
* Payment reconciliation.  
* Refunds and disputes.  
* Platform commissions.  
* Financial reporting.  
* Reports of food safety concerns.  
* Account suspensions and appeals.  
* Platform-level performance and audit logs.

Administrative permissions should be role-based. Financial and sensitive-account actions require stronger access controls.

---

# **5\. Customer Application**

The customer-facing product should be mobile-first, while remaining fully functional on desktop.

## **5.1 First-time experience**

When a new visitor opens MealHrs:

1. They land on the food discovery experience.  
2. They can immediately view public food content.  
3. The application invites them to select their location.  
4. They may choose State → LGA/Town → Area manually.  
5. Alternatively, they may grant permission for current-location detection.  
6. They can begin exploring eligible food businesses.  
7. The selected delivery area is retained for later visits where appropriate.

The app should never require unnecessary location permissions merely to watch content.

### **Customer location without nearby vendors**

If the selected area has no eligible vendors, the application must not pretend that food is available.

Show an informative empty state, allow users to explore food content, and optionally let them request notification when MealHrs becomes available locally.

## **5.2 Primary navigation**

Recommended mobile navigation:

| Tab | Purpose |
| ----- | ----- |
| Discover | Main food feed |
| Search | Food, restaurant, and vendor discovery |
| Following | Content from followed kitchens |
| Orders | Current and previous purchases |
| Profile | Account, addresses, saved items, and settings |

The exact navigation can be simplified during interface design.

Do not overcrowd the bottom navigation.

## **5.3 Discover Feed**

The Discover Feed is a vertically scrolling, immersive food-content experience.

It should support:

* Full-screen vertical short videos.  
* Food photographs where appropriate.  
* Swipe-up navigation.  
* Autoplay of the current video.  
* Muted playback defaults appropriate for browser/device settings.  
* Like, comment, save, and share actions.  
* Vendor identity and profile links.  
* Follow actions.  
* Food descriptions and captions.  
* Meal tags linked to actual vendor listings.  
* Prices when an active offer exists.  
* Immediate-order or pre-order availability indicators.  
* Location eligibility indicators.  
* Report and hide-content options.

Videos should preload conservatively to reduce mobile-data usage.

### **Discovery sections**

**Near Me**

Shows food content from vendors that can fulfill an order to the customer's selected delivery area, prioritizing active or upcoming purchasable offers.

**Following**

Shows content from followed vendors, including new videos, daily menus, and upcoming meal drops.

**Explore Nigeria**

Shows food-related content from across the country regardless of ordering eligibility.

Customers may watch or follow distant vendors, but checkout is unavailable when their selected address falls outside the vendor's delivery coverage.

### **Feed filters**

Within local discovery, customers can filter by:

* All food.  
* Available now.  
* Pre-order.  
* Food category.  
* Price range.  
* Vendor category.  
* Delivery availability.

Filters should be optional and accessible without making the main video experience visually cluttered.

## **5.4 Search and Discovery**

Customers can search using:

* Dish names.  
* Vendor names.  
* Cuisine categories.  
* Location.  
* Meal availability.  
* Immediate ordering or pre-order.  
* Food types such as rice, soups, grilled food, pastries, and snacks.

Search results should distinguish between:

1. Food videos.  
2. Purchasable dishes.  
3. Vendors and storefronts.

An order-focused search should prioritize vendors that actually serve the selected location.

## **5.5 Vendor Storefront**

Each vendor receives a branded storefront.

Example:

`mealhrs.com/k/amakaskitchen`

The vendor can configure:

* Business name.  
* Unique store slug.  
* Logo and cover image.  
* Brand accent color within accessibility limits.  
* Business description.  
* Business category.  
* Public operating location.  
* Delivery coverage.  
* Ordering hours.  
* Social links.  
* Contact information approved for public display.  
* Storefront availability.

### **Storefront sections**

**Home:** Kitchen introduction, featured dishes, active offers, and promotions.

**Menu:** Immediately available meals and scheduled offerings.

**Meal Drops:** Upcoming dated menus and specials.

**Videos:** Public food content published by the business.

**Reviews:** Reviews from verified purchases.

**About:** Business information, service areas, fulfillment policies, and ordering details.

A vendor's private home address should not be publicly exposed merely because they operate a home kitchen.

For delivery-only businesses, the public location can be their town or area. Exact pickup directions are displayed only when the vendor explicitly enables pickup.

## **5.6 Dish Detail**

Every dish must have a structured detail page containing:

* Name and description.  
* Images and related videos.  
* Current price.  
* Available sizes or portions.  
* Required choices, if any.  
* Optional proteins, extras, and sides.  
* Quantity controls.  
* Relevant allergens or ingredient disclosures.  
* Availability.  
* Estimated preparation time or scheduled fulfillment date.  
* Pickup or delivery availability.  
* Applicable delivery-area rules.  
* Special instructions.  
* Add-to-cart action.

For pre-order dishes, show the cutoff prominently.

For unavailable dishes, show an appropriate status and any available next date.

---

# **6\. Food-Only Social Content**

The social system is a core part of MealHrs, but it must support commerce rather than undermine it.

## **6.1 Who can publish content?**

**Initial release:** Approved vendors can publish public feed content.

Customers can interact with vendor posts and submit verified-order reviews, but do not receive general-purpose video publishing accounts.

**Future expansion:** Independent food creators may be allowed to publish food content and participate in approved vendor collaborations.

This phased approach keeps early content relevant and easier to moderate.

## **6.2 Allowed content**

Examples:

* Food preparation.  
* Cooking tutorials and demonstrations.  
* Meal presentations.  
* Food packaging.  
* New menu announcements.  
* Upcoming meal drops.  
* Kitchen operations.  
* Restaurant environments.  
* Food tasting and reviews.  
* Food culture and culinary storytelling.

## **6.3 Restricted content**

Disallow:

* Unrelated entertainment or general lifestyle content.  
* Spam and misleading promotions.  
* Fraudulent food listings.  
* Stolen or unauthorized food media.  
* Dangerous food-handling demonstrations presented as safe.  
* Harassment or abusive comments.  
* Content violating applicable law.  
* False claims about certifications, ingredients, or health benefits.

Food-related brand stories can remain acceptable if they are genuinely relevant to the vendor's food business.

## **6.4 Content publishing flow**

The vendor:

1. Opens **Create Post**.  
2. Uploads a video or image.  
3. Adds a caption and optional food tags.  
4. Optionally links a dish or scheduled meal drop.  
5. Reviews the post.  
6. Publishes immediately or schedules publication.

The app processes the video, generates a thumbnail, and makes it available for playback once processing succeeds and moderation requirements are satisfied.

If the linked item becomes unavailable, the video remains watchable, while its commerce action updates automatically.

**Critical rule:** A social post must never independently determine product price, quantity, cutoff, or delivery eligibility.

Only the ordering system determines whether checkout is allowed.

## **6.5 Ranking principles**

Start with a rules-based, understandable recommendation model rather than attempting a sophisticated TikTok-style algorithm immediately.

Potential ranking signals:

* Whether the vendor serves the customer's area.  
* Current orderability.  
* Recently published content.  
* Upcoming meal-drop relevance.  
* Customer-following relationships.  
* Content completion and engagement.  
* Verified vendor reliability.  
* Repeated customer interest.  
* Customer reports and moderation quality.

For an order-focused feed, location eligibility and offer availability must come before generic engagement popularity.

Avoid allowing high-engagement but unreliable vendors to dominate local discovery.

---

# **7\. Location and Delivery Management**

Location enforcement is one of MealHrs' most important business rules.

## **7.1 Geographic structure**

Use a centrally managed directory:

**Country → State → LGA → Town/Area → Supported delivery zones**

Nigeria is the initial supported country.

A vendor selects its base location and then configures the areas it can serve.

Example:

Business location: Ikotun, Lagos.

Supported delivery areas:

* Ikotun.  
* Egbe.

Unsupported area:

* Ikeja.

A customer selecting Ikeja cannot place a delivery order with that business.

## **7.2 Delivery zones**

Each vendor can configure:

* Supported areas.  
* Whether delivery is enabled.  
* Delivery charge per area.  
* Area-specific minimum order amount, if needed.  
* Immediate-order delivery availability.  
* Scheduled delivery windows.  
* Temporary area suspension.  
* Area-specific order capacity, where supported.

The platform should support an editable canonical location directory to prevent duplicate names and inconsistent spelling.

In a later stage, precise polygon-based zones can supplement named areas for complicated boundaries.

## **7.3 Delivery eligibility checks**

Eligibility must be validated:

1. When browsing local purchasable food.  
2. On the vendor storefront.  
3. On dish detail pages.  
4. When adding to cart.  
5. On checkout.  
6. Immediately before payment/order confirmation.

The backend remains authoritative.

A customer cannot bypass delivery restrictions by modifying a URL, changing frontend values, or opening a previously shared meal link.

An address must correspond to a supported delivery zone; typing a misleading area name should not override actual address validation.

## **7.4 Vendor-managed delivery**

The vendor is responsible for:

* Organizing its own rider or courier.  
* Setting delivery prices.  
* Preparing orders for dispatch.  
* Assigning or coordinating its delivery personnel.  
* Providing realistic fulfillment estimates.  
* Updating dispatch and delivery status.  
* Handling delivery issues in coordination with MealHrs support.

MealHrs does not assign riders, operate a rider marketplace, or guarantee logistics capacity.

### **Customer-facing delivery transparency**

The customer must understand that delivery is fulfilled by the food business.

Order pages should show the vendor name, delivery fee, expected window, delivery status, and appropriate contact/support options.

## **7.5 Pickup**

Pickup is optional and vendor-controlled.

Vendors may choose:

* Delivery only.  
* Pickup only.  
* Both.

Pickup orders must have valid collection windows and an explicitly authorized pickup address.

The absence of vendor delivery should not automatically change an order into pickup.

## **7.6 Pausing service**

A vendor can pause:

* Its entire storefront.  
* Immediate orders only.  
* New pre-orders only.  
* Delivery to selected areas.  
* Individual dishes.  
* Individual meal drops.

Pausing new orders must not erase existing commitments.

Previously accepted orders remain visible and require fulfillment or proper cancellation/refund processing.

---

# **8\. Menu and Meal Creation**

Menu management should feel simple to home vendors while being powerful enough for restaurants.

## **8.1 Recommended interface structure**

The dashboard should have one primary **Menu** section.

Inside it:

* Dishes.  
* Meal Drops.  
* Availability.  
* Categories and modifiers.

The vendor should not be forced into a confusing workflow involving separate technical concepts such as products, inventory records, schedules, and offers.

The app can handle those concepts internally.

## **8.2 Add Dish**

The vendor provides:

* Dish name.  
* Description.  
* Category.  
* Photos.  
* Base price.  
* Portion options.  
* Protein options.  
* Extras.  
* Customization rules.  
* Allergen/ingredient information where relevant.  
* Availability configuration.

Example:

Jollof Rice — ₦3,500.

Protein choices:

* Chicken \+ ₦1,000.  
* Turkey \+ ₦1,500.  
* Fish \+ ₦1,200.

Extras:

* Plantain \+ ₦500.  
* Extra rice \+ ₦1,000.

Required choices and optional extras must be clearly distinguished.

## **8.3 Create Meal Drop**

The vendor:

1. Selects **Create Meal Drop**.  
2. Names the drop.  
3. Selects a date or recurring schedule.  
4. Adds existing dishes or creates new ones inline.  
5. Defines prices and optional quantity limits.  
6. Sets the order cutoff.  
7. Sets delivery and/or pickup windows.  
8. Chooses eligible fulfillment areas.  
9. Reviews the customer-facing preview.  
10. Publishes.

The completed drop receives a shareable URL.

### **Recurrence rules**

A recurring drop should generate distinct dated instances.

For example, every Thursday may use the same menu template, but each Thursday has its own order count, cutoff timestamp, stock availability, and fulfillment records.

Changing next week's menu must not silently change orders already accepted for this week.

## **8.4 Immediate-menu availability**

A restaurant can configure:

* Weekly operating hours.  
* Ordering hours.  
* Item-specific availability.  
* Item preparation time.  
* Daily quantity limits.  
* Temporary stockout.  
* Maximum simultaneous orders.  
* Special opening or closing dates.

If the restaurant opens at 10 AM and closes at 9 PM, customers cannot submit immediate orders outside configured acceptance hours.

The restaurant can temporarily pause order acceptance when overwhelmed.

---

# **9\. Customer Cart and Checkout**

## **9.1 Cart behavior**

**Recommended initial rule:** One vendor per cart and one fulfillment schedule per order.

A customer can purchase multiple dishes from the same vendor.

However, orders from different vendors must be checked out separately because each vendor manages its own preparation, delivery fees, schedules, and fulfillment.

Similarly, an immediate meal and a next-Thursday pre-order should not be combined into one order unless their fulfillment arrangements are genuinely compatible.

The app should clearly explain when items require separate orders.

## **9.2 Checkout flow**

1. Customer reviews cart items.  
2. Confirms quantities and customizations.  
3. Selects delivery or eligible pickup.  
4. Confirms delivery address or pickup selection.  
5. System verifies the location against vendor coverage.  
6. System verifies availability, cutoff, and quantity.  
7. Customer sees fulfillment estimate or scheduled delivery window.  
8. Customer sees all charges.  
9. Customer supplies any necessary delivery instructions.  
10. Customer pays.  
11. System verifies payment and creates or confirms the order.  
12. Customer receives an order confirmation and tracking page.

Prices, discounts, fees, quantities, and availability must be recalculated by the backend at checkout rather than trusted from browser-provided totals.

## **9.3 Customer pricing breakdown**

Display:

* Food subtotal.  
* Options and extras.  
* Vendor delivery fee.  
* Any disclosed applicable service charge.  
* Discounts.  
* Final payable total.

There should be no undisclosed charges after payment confirmation.

## **9.4 Payment policy**

**Recommended V1 policy:** Full upfront payment for both immediate orders and pre-orders.

This protects vendors against casual or fraudulent orders, particularly when food is cooked to demand.

Supported payment methods should follow the payment provider's available Nigerian channels.

No custom financial wallet is required for the first release.

A full or partial refund should return through the approved payment/refund process, subject to payment-provider capabilities.

## **9.5 Availability reservation during checkout**

The backend should temporarily reserve limited capacity while a customer attempts payment.

If payment is not completed before reservation expiry, the held capacity is released.

A late payment confirmation must trigger a controlled reconciliation process rather than silently creating an order after the cutoff or causing overselling.

All payment and order creation operations need idempotency protection.

---

# **10\. Order Lifecycle**

Immediate orders and scheduled orders share common records but have different time-sensitive workflows.

## **10.1 Immediate-order workflow**

**Customer places order → Payment confirmed → Vendor confirms → Preparing → Ready for dispatch → Out for delivery → Delivered**

Vendor acceptance may be required before preparation.

The platform must enforce a configurable response deadline.

If a vendor fails to respond, the system follows a defined timeout policy, including cancellation and refund where appropriate.

A vendor cannot mark an unpaid order as a successfully paid order.

## **10.2 Pre-order workflow**

**Customer places pre-order → Payment confirmed → Scheduled → Order cutoff reached → Preparing → Ready for dispatch → Out for delivery → Delivered**

The system groups scheduled orders into a vendor-facing preparation list.

The vendor can view:

* Total ordered dishes.  
* Portion quantities.  
* Selected proteins.  
* Extras.  
* Customer instructions.  
* Delivery areas.  
* Fulfillment windows.  
* Customer-level order details.

This helps vendors buy ingredients and plan preparation accurately.

## **10.3 Other order states**

Support exceptional outcomes such as:

* Pending payment.  
* Pending vendor acceptance.  
* Cancelled by customer.  
* Cancelled by vendor.  
* Timed out.  
* Delivery failed.  
* Refund pending.  
* Partially refunded.  
* Refunded.  
* Disputed.

Payment status, order status, and delivery status should be stored separately rather than compressed into one overloaded field.

Every important status change should be timestamped and auditable.

## **10.4 Order tracking**

The customer receives a tracking page showing:

* Vendor.  
* Purchased items.  
* Payment status.  
* Fulfillment date/window.  
* Current order stage.  
* Delivery address or pickup details.  
* Vendor contact/support action.  
* Event history.  
* Cancellation or dispute actions where eligible.

Live rider GPS tracking is not part of the initial product because MealHrs does not operate delivery logistics.

Vendors update delivery status from their workspace.

---

# **11\. Vendor Onboarding**

The goal is to make registration accessible to a small home kitchen without sacrificing customer trust.

## **11.1 Account registration**

Recommended customer and vendor sign-in options:

* Email-based authentication.  
* Google sign-in.  
* Verified Nigerian phone number for ordering/business contact and relevant security workflows.

Phone verification and recovery processes must include rate limits and abuse prevention.

## **11.2 Vendor setup**

The vendor:

1. Creates or signs into an account.  
2. Selects **Start selling on MealHrs**.  
3. Enters business name and category.  
4. Creates a unique storefront slug.  
5. Adds a logo and optional cover photo.  
6. Selects base State, LGA, and Area.  
7. Sets supported delivery areas.  
8. Configures ordering models.  
9. Configures business hours and fulfillment options.  
10. Supplies required identity, business, and payout information.  
11. Submits for verification.  
12. Publishes its first dish or Meal Drop once the required approval conditions are met.

A vendor should be able to save progress and return later.

## **11.3 Verification and approval**

MealHrs must establish clear onboarding requirements appropriate to the vendor's activities and jurisdiction.

Potential checks include:

* Identity verification.  
* Phone verification.  
* Payout-account verification.  
* Business documentation where required.  
* Relevant food-safety and operating documentation.  
* Review of business category and service area.  
* Fraud and duplicate-account screening.

The app should distinguish between account verified, business information reviewed, and independently verified food-safety certification.

These are not interchangeable claims.

---

# **12\. Vendor Workspace**

Recommended primary navigation:

| Section | Purpose |
| ----- | ----- |
| Overview | Daily business summary |
| Orders | Immediate and scheduled order operations |
| Menu | Dishes, categories, modifiers, meal drops |
| Content | Food posts, videos, comments and engagement |
| Customers | Followers, customer records and repeat-order insights |
| Earnings | Payments, settlements, commissions and refunds |
| Settings | Business profile, team, delivery, availability, payout settings |

## **12.1 Overview**

The overview should surface actionable information rather than only decorative charts.

Examples:

* Orders requiring attention.  
* Today's orders.  
* Upcoming pre-orders.  
* Next cutoff.  
* Meals scheduled for preparation.  
* Outstanding delivery commitments.  
* Revenue summary.  
* Recent activity.  
* Current storefront availability.

## **12.2 Orders**

Provide filters by:

* New.  
* Awaiting acceptance.  
* Preparing.  
* Scheduled.  
* Ready.  
* Out for delivery.  
* Completed.  
* Cancelled/refunded.

Order detail includes item quantities, modifications, customer contact details necessary for fulfillment, delivery area, instructions, payment status and status history.

Vendors should have a mobile-friendly preparation list and printable/exportable order summaries.

## **12.3 Content**

Vendors manage:

* Published posts.  
* Drafts.  
* Scheduled posts.  
* Linked dishes.  
* Comments.  
* Post performance.  
* Reported/removed posts.

Analytics can include views, engagement, profile visits, meal clicks and attributable purchases.

## **12.4 Customers**

Provide business-relevant insights:

* Followers.  
* Returning buyers.  
* Customer order history with that vendor.  
* Repeat purchase patterns.  
* Customer feedback.  
* Saved customer notes where appropriate and authorized.

Customer information must be limited to the vendor's legitimate business needs.

Vendors must not receive other vendors' customer lists or unrelated personal data.

## **12.5 Earnings**

Show:

* Gross sales.  
* Platform fees.  
* Payment-processing charges.  
* Refunds.  
* Adjustments.  
* Net amount payable to vendor.  
* Settlement status.  
* Historical transactions.  
* Downloadable statements.

Vendor financial reporting should distinguish revenue already collected from amounts pending payout.

---

# **13\. Social Following and Notifications**

Following a kitchen should provide ongoing value.

## **13.1 Customer notifications**

Possible events:

* Followed kitchen posts a new meal drop.  
* Pre-order cutoff is approaching.  
* A saved dish becomes available.  
* A new order is accepted.  
* Food preparation begins.  
* Order is out for delivery.  
* Order is delivered.  
* An order is cancelled or refunded.  
* A vendor replies to a relevant inquiry.

## **13.2 Vendor notifications**

* New paid order.  
* Order requiring confirmation.  
* Upcoming preparation schedule.  
* Approaching cutoff.  
* Payment or refund event.  
* Customer message.  
* Customer review.  
* Content moderation decision.  
* Verification or compliance action.

## **13.3 Notification channels**

Initial channels:

* In-app notifications.  
* Transactional email.  
* Web push where supported and permitted.

SMS or WhatsApp messaging can be introduced selectively based on cost, consent, and business value.

Marketing messages require appropriate user preference controls and applicable consent.

---

# **14\. Messaging and Customer Support**

A lightweight communication system is useful, but MealHrs does not need a full social-chat application initially.

Recommended capabilities:

**Before ordering:** Customer can submit a structured vendor inquiry about availability, ingredients, or fulfillment.

**After ordering:** Customer and vendor can communicate about an existing order.

**Platform support:** Customers can raise issues directly with MealHrs.

Questions already answered by the menu should be handled through clear product information rather than requiring customers to message the vendor repeatedly.

Possible later expansion includes full vendor/customer chat, media attachments and automated responses.

Messages must support abuse reporting, and staff access should be controlled.

---

# **15\. Reviews, Trust and Quality Control**

Reviews should reflect actual fulfilled purchases.

## **15.1 Verified purchase reviews**

Customers can review a completed order.

Possible review dimensions:

* Food quality.  
* Portion/value.  
* Packaging.  
* Fulfillment reliability.  
* Overall experience.

Avoid publishing customer addresses or sensitive order information.

Prevent duplicate ratings for the same reviewable order and prohibit vendors from editing customer reviews.

## **15.2 Vendor reliability signals**

Internally, MealHrs may track:

* Order acceptance rate.  
* Vendor cancellation rate.  
* Fulfillment completion rate.  
* Late fulfillment reports.  
* Customer complaints.  
* Verified customer satisfaction.  
* Food-safety escalation history.

These signals should inform discovery and administrative intervention, with reasonable safeguards against abuse and small-sample distortion.

## **15.3 Dispute handling**

The system should support cases such as:

* Vendor did not prepare the order.  
* Wrong or missing items.  
* Food quality complaint.  
* Order not delivered.  
* Delivery significantly outside the agreed window.  
* Customer supplied an incorrect address.  
* Vendor cancelled after receiving payment.

Every dispute should contain evidence, timestamps, communications, decision history, and refund outcome where applicable.

---

# **16\. Payments, Revenue and Settlements**

MealHrs needs a financially sustainable model that works for relatively small orders.

## **16.1 Revenue options**

**Initial candidate:** Transaction commission on completed food orders.

Other possibilities:

* Optional premium vendor tools.  
* Paid vendor subscriptions with additional capabilities.  
* Promoted vendor visibility.  
* Sponsored food content, clearly labeled.  
* Creator partnership and referral revenue.  
* Business analytics packages.

The initial product should not depend on high monthly subscriptions from tiny home kitchens.

## **16.2 Payment-processing costs**

A transaction commission is not the same as profit.

MealHrs must account for:

* Payment provider charges.  
* Refund and reversal costs.  
* Support costs.  
* Video storage and playback.  
* Infrastructure.  
* Fraud losses.  
* Marketing.  
* Tax and accounting obligations.

At the time of this draft, Paystack's published standard Nigerian local fee is **1.5% \+ ₦100**, with the flat ₦100 waived on transactions below ₦2,500 and local fees capped at ₦2,000.

This is a pricing reference, not an agreed MealHrs fee structure.

Actual provider contracts and charges must be checked before implementation.

## **16.3 Vendor settlement**

Two candidate models require evaluation.

**A. Provider-managed split settlement**

The payment provider distributes the appropriate shares to MealHrs and the vendor according to supported settlement rules.

**B. Platform-coordinated payout**

Vendor proceeds are calculated and disbursed through approved payment-provider arrangements according to an agreed schedule.

The second approach may create greater control over cancellations and refunds, but it also introduces more regulatory, operational, and cash-management considerations.

**Recommendation:** Do not implement an informal escrow arrangement. Choose the settlement design only after confirming payment-provider capability, regulatory obligations, vendor cash-flow needs, and refund liability.

## **16.4 Refund principles**

* Failed or duplicate payments must be reconciled.  
* Vendor rejection or inability to fulfill should trigger the applicable refund process.  
* Pre-order cancellation rules must be visible before payment.  
* Partial refunds should be supported where operationally appropriate.  
* Customers must see the actual refund status, not an unverified claim of completion.  
* Financial adjustments must be logged.  
* Admin overrides require appropriate authority.

---

# **17\. MealHrs Administration**

The platform admin is a distinct internal product.

## **17.1 Dashboard**

High-level reporting:

* Registered vendors.  
* Approved active vendors.  
* Active customers.  
* Orders.  
* Gross merchandise value.  
* Net platform revenue.  
* Refunds and disputes.  
* Active locations.  
* Video/content activity.  
* Operational alerts.

## **17.2 Vendor management**

Admins can:

* Review registrations.  
* Approve/reject verification.  
* Request additional information.  
* Suspend vendors.  
* Reinstate eligible vendors.  
* Review repeated cancellations.  
* Examine compliance reports.  
* View operational performance.

## **17.3 Content moderation**

Moderators need:

* Report queues.  
* Content review.  
* Takedown actions.  
* Moderation history.  
* Appeals.  
* Account restrictions.  
* Copyright complaint workflows.

## **17.4 Geographic management**

Admins maintain the location directory.

This includes:

* States.  
* LGAs.  
* Towns.  
* Areas.  
* Duplicate-name cleanup.  
* Location aliases.  
* Supported marketplace expansion areas.

## **17.5 Financial management**

Admins manage:

* Commission settings.  
* Vendor payout records.  
* Payment reconciliation.  
* Refund administration.  
* Financial disputes.  
* Reporting exports.

Fee changes should have effective dates and audit trails.

## **17.6 Platform governance**

Require:

* Role-based access control.  
* Audit logs.  
* Administrative approval for sensitive actions.  
* Reason codes for suspension/refund decisions.  
* Abuse prevention.  
* Support-case tracking.  
* Feature flags.  
* Incident management.

---

# **18\. Core Business Rules**

These are proposed system-level rules rather than optional interface behaviors.

| ID | Rule |
| ----- | ----- |
| BR-01 | Only approved, eligible vendors can accept live orders. |
| BR-02 | Vendors control their own delivery operations. |
| BR-03 | MealHrs never auto-assigns independent platform riders. |
| BR-04 | Delivery orders are blocked outside supported vendor zones. |
| BR-05 | Immediate ordering requires an accepting vendor and available items. |
| BR-06 | Pre-orders are blocked after the configured cutoff. |
| BR-07 | Quantities and preparation capacity cannot be oversold. |
| BR-08 | Vendor pauses stop new applicable orders, not existing commitments. |
| BR-09 | Historical videos cannot bypass current offer availability. |
| BR-10 | Prices and fees are validated by the backend. |
| BR-11 | Payment must be verified server-side before an order is treated as paid. |
| BR-12 | A cart contains one vendor and one compatible fulfillment schedule in V1. |
| BR-13 | Fulfillment commitments are preserved when menus change. |
| BR-14 | Customers cannot access other customers' private information. |
| BR-15 | Vendors cannot access data belonging to unrelated vendors. |
| BR-16 | Only qualifying completed purchases generate verified-order reviews. |
| BR-17 | All critical payment/order transitions are idempotent and auditable. |
| BR-18 | Delivery estimates are not presented as platform-guaranteed delivery times. |
| BR-19 | Public feed content must comply with food-specific content rules. |
| BR-20 | Existing orders require fulfillment or controlled cancellation and refund handling. |

These rules must have corresponding automated tests when backend implementation begins.

---

# **19\. Important Edge Cases**

A production application must define what happens when normal assumptions fail.

### **Customer changes delivery address after creating a cart**

Revalidate the full cart, delivery fee, and eligible vendor coverage. Remove or disable unsupported checkout options.

### **Meal Drop cutoff occurs during checkout**

Payment initiation and final order acceptance must use authoritative cutoff and capacity rules. Handle late settlement safely without accepting an invalid order.

### **Two customers purchase the final available meal**

Use transactional capacity reservation so only the permitted quantity is sold.

### **Restaurant closes while an order is processing**

An already accepted order remains a fulfillment commitment. New orders must be blocked according to current availability.

### **Vendor changes dish price after the customer pays**

Retain the accepted order's price snapshot. Never retroactively reprice it.

### **Customer views an old viral food video**

Keep the video visible if appropriate, but show the current dish status and next available offer.

### **Payment succeeds but the customer loses internet connection**

The order must remain recoverable using verified payment and order records. Refreshing or retrying must not create duplicate charges or orders.

### **Vendor cannot arrange delivery**

The vendor must report the issue and follow the approved resolution process. The system should not falsely label the food delivered.

### **Customer enters an address that conflicts with selected area**

Require correction or verification before confirming delivery eligibility.

### **Meal Drop has been cancelled after customers paid**

Notify affected buyers and trigger the approved cancellation/refund process.

### **Video upload fails**

Allow retry without duplicating posts; preserve the draft and safely clean up failed media assets.

### **Vendor is suspended with outstanding orders**

Administrators need a controlled procedure for handling accepted orders, communicating with customers, and processing refunds where necessary.

---

# **20\. Core Data Model**

The eventual backend should distinguish the following business entities.

| Entity | Purpose |
| ----- | ----- |
| User | Core account identity |
| CustomerProfile | Customer preferences and account details |
| Vendor | Independent food business tenant |
| VendorMember | Staff membership and permissions |
| VendorVerification | Identity and business approval records |
| Storefront | Public business branding and slug |
| Address | Customer addresses |
| GeographicArea | State/LGA/town/area directory |
| DeliveryZone | Vendor-supported service area and charges |
| OperatingSchedule | Business and ordering hours |
| Dish | Reusable menu product |
| DishOptionGroup | Portions, proteins, extras |
| MenuOffer | Purchase conditions for a dish |
| MealDrop | Scheduled menu event |
| MealDropItem | Dish included in a particular drop |
| InventoryCapacity | Stock and preparation limits |
| MediaAsset | Uploaded image/video and processing state |
| SocialPost | Published food content |
| PostDishLink | Relationship between posts and dishes/offers |
| Follow | Customer-to-vendor following |
| Reaction | Social engagement |
| Comment | Content discussion |
| Cart | Pending customer selection |
| CartItem | Cart contents and options |
| Order | Confirmed purchase |
| OrderItem | Purchased item snapshot |
| Payment | Payment attempt and reconciliation |
| Refund | Refund processing lifecycle |
| VendorSettlement | Vendor financial settlement |
| Fulfillment | Delivery or pickup commitment |
| OrderEvent | Audit history of order changes |
| Notification | Transactional and social notification |
| Review | Verified-order feedback |
| SupportCase | Customer/vendor dispute |
| ModerationCase | Content and account enforcement |
| AuditLog | Sensitive administrative/system actions |

This is the **conceptual domain model**, not yet the finalized database schema.

Prices, order details, delivery fees, and selected options need historical snapshots to ensure old orders are not affected by future menu edits.

All tenant-owned records must have strong business scoping.

---

# **21\. Technology and Production Architecture**

## **21.1 Development approach**

**Approved product-building direction:** Build the complete, production-oriented frontend first, using realistic mocked data and a clean integration-ready architecture.

Do not build a disposable prototype that must later be rewritten.

The first phase should demonstrate realistic workflows across customer, vendor, and eventually admin surfaces.

Backend functionality follows after the frontend flows and business rules are reviewed.

## **21.2 Frontend**

Recommended stack:

* Next.js App Router.  
* TypeScript.  
* Tailwind CSS.  
* shadcn/ui-based accessible components.  
* Responsive layouts.  
* Progressive Web App enhancements.  
* Typed form validation.  
* Modular feature-oriented architecture.  
* Mock service adapters.  
* Centralized design tokens.  
* Reusable state and domain models.

A single web application can host customer, vendor, and admin experiences while keeping their routes, layouts, and permissions logically separated.

## **21.3 Future backend**

**Recommended architecture:** Modular monolith before microservices.

Candidate stack:

* NestJS with TypeScript.  
* PostgreSQL.  
* Redis for appropriate caching, queues, or transient state.  
* Background jobs for scheduled tasks.  
* Payment-provider integrations.  
* Managed media storage and processing.  
* Search infrastructure when needed.  
* Email, SMS, or notification providers.  
* Monitoring and structured logging.

Potential backend modules:

* Identity and authorization.  
* Vendors and verification.  
* Storefronts.  
* Geographic coverage.  
* Catalog and menus.  
* Scheduling and availability.  
* Content and media.  
* Social relationships.  
* Search and discovery.  
* Carts and checkout.  
* Orders and fulfillment.  
* Payments and settlements.  
* Notifications.  
* Reviews and disputes.  
* Administration and audit.

A separate microservice for every feature is unnecessary at launch.

## **21.4 Video infrastructure**

Do not build a custom video encoder/streaming service initially.

Use a managed video provider supporting:

* Direct uploads.  
* Processing/transcoding.  
* Adaptive playback.  
* Thumbnails.  
* Playback controls.  
* Delivery analytics.  
* Lifecycle management.

Cloudflare Stream is one candidate and currently documents managed uploads, encoding, adaptive playback, and usage-based pricing.

Video cost monitoring should be built into operational reporting.

## **21.5 Security**

Minimum production requirements:

* Secure session management.  
* Role- and tenant-based authorization.  
* Server-side validation.  
* Payment webhook authentication.  
* Idempotency keys.  
* Rate limiting.  
* Safe file upload validation.  
* Signed/direct upload flows.  
* Secret management.  
* Least-privilege access.  
* Database backup and recovery.  
* Audit trails.  
* Dependency and vulnerability management.  
* API abuse prevention.  
* Data-retention and deletion procedures.  
* Secure handling of vendor payout details.

Public profile URLs must not reveal private tenant records.

## **21.6 Performance**

Prioritize fast and economical use on Nigerian mobile networks.

Requirements include:

* Optimized images.  
* Adaptive video quality.  
* Limited autoplay preloading.  
* Paginated feeds.  
* Lazy loading.  
* Cached public data where appropriate.  
* Reliable checkout on unstable networks.  
* Clear error and retry states.  
* Accessible UI and keyboard support.  
* Efficient mobile layouts.

The feed should never compromise the integrity of checkout or order operations.

---

# **22\. Product UX and Visual Direction**

MealHrs should look like a dedicated premium food product—not a generic social network, and not a traditional food-delivery clone.

## **22.1 Design principles**

* Calm.  
* Fresh.  
* Appetizing.  
* Clean.  
* Minimal.  
* Contemporary.  
* Human and trustworthy.  
* Mobile-first.  
* Accessible.  
* Content-led.

Avoid heavy gradients, oversized cards, unnecessarily bold typography, excessive shadows, and decorative visual noise.

Food imagery and videos should be the strongest visual elements.

## **22.2 Proposed brand palette**

| Role | Color |
| ----- | ----- |
| Primary brand | Herb Green `#225E3A` |
| Warm background | Ivory `#FFF9EF` |
| Food accent | Tangerine `#F97316` |
| Contrast-safe orange text | `#B94A0A` |
| Main surfaces | White/off-white |
| Main text | Deep neutral charcoal |

Use green for primary brand actions, restrained orange for food-related emphasis, and neutrals for layouts and controls.

## **22.3 Feed design**

Prioritize the food itself.

The video should dominate the viewport.

Product information and ordering actions remain legible without overwhelming the media.

Use compact controls, restrained animations, and simple navigation.

## **22.4 Vendor workspace design**

Unlike the immersive consumer feed, the vendor dashboard should be a focused operational interface.

Prioritize:

* Clear order lists.  
* Compact information density.  
* Easy meal creation.  
* Fast access to pending work.  
* Consistent status indicators.  
* Minimal steps to complete common tasks.

Desktop should support efficient management. Mobile should support vendors who run their business mainly from a phone.

---

# **23\. Frontend Page Inventory**

The following page inventory defines the initial scope of the product's user-facing interfaces.

## **23.1 Public and customer pages**

* Landing/discovery entry.  
* Full-screen food feed.  
* Following feed.  
* Explore Nigeria feed.  
* Search.  
* Search results.  
* Food category results.  
* Vendor storefront.  
* Vendor menu.  
* Vendor Meal Drops.  
* Vendor videos.  
* Vendor reviews/about.  
* Food video/post detail.  
* Dish detail.  
* Meal Drop detail.  
* Cart.  
* Checkout.  
* Payment result.  
* Order confirmation.  
* Active orders.  
* Order detail/tracking.  
* Order history.  
* Saved content.  
* Followed kitchens.  
* Notifications.  
* Saved addresses.  
* Account/profile settings.  
* Authentication.  
* Help and support.

## **23.2 Vendor pages**

* Vendor onboarding.  
* Business verification.  
* Dashboard overview.  
* Order list.  
* Order details.  
* Preparation/fulfillment view.  
* Menu overview.  
* Create/edit dish.  
* Dish options/modifiers.  
* Meal Drop list.  
* Create/edit Meal Drop.  
* Content list.  
* Create/edit post.  
* Post analytics.  
* Followers/customers.  
* Earnings.  
* Transactions/settlements.  
* Storefront customization.  
* Delivery zones and fees.  
* Opening hours/availability.  
* Team and permissions.  
* Payout settings.  
* Business settings.  
* Vendor support.

## **23.3 Internal admin pages**

* Platform overview.  
* Vendor directory.  
* Vendor verification review.  
* Customer management.  
* Order monitoring.  
* Content moderation.  
* Reports/complaints.  
* Refunds and disputes.  
* Settlement and payment reporting.  
* Geographic directory.  
* Platform fee settings.  
* Feature configuration.  
* Admin staff roles.  
* Audit logs.  
* System health and operations.

Not every page requires a separate top-level navigation item. Related views can be nested or presented through contextual workflows.

---

# **24\. Implementation Roadmap**

The development plan should preserve the complete product architecture without requiring every advanced feature to launch simultaneously.

## **Phase 1 — Design System and Foundation**

Build:

* Branding and design tokens.  
* Reusable components.  
* Responsive application shell.  
* Navigation.  
* Authentication interface.  
* Shared domain types.  
* Mock data/service architecture.  
* Loading, empty, and error states.

## **Phase 2 — Customer Discovery**

Build:

* Food feed.  
* Location selector.  
* Search and filters.  
* Vendor storefront.  
* Dish detail.  
* Meal Drop detail.  
* Following and saved-content interfaces.

## **Phase 3 — Customer Commerce**

Build:

* Cart.  
* Checkout.  
* Order confirmation.  
* Order history.  
* Tracking.  
* Customer addresses.  
* Payment and refund state simulations.

## **Phase 4 — Vendor Workspace**

Build:

* Vendor onboarding.  
* Storefront settings.  
* Menu/dish creation.  
* Meal Drop creation.  
* Delivery coverage configuration.  
* Vendor availability.  
* Orders.  
* Content publishing.  
* Earnings and analytics views.

## **Phase 5 — Admin Frontend**

Build:

* Vendor approvals.  
* Customer/vendor management.  
* Moderation.  
* Disputes.  
* Financial controls.  
* Geographic configuration.  
* Audit views.

## **Phase 6 — Backend and Integration**

Implement:

* Database and authorization.  
* Vendor isolation.  
* Availability and cutoff engine.  
* Delivery-zone enforcement.  
* Order state machine.  
* Payment verification.  
* Refund and settlement integration.  
* Video processing.  
* Real notifications.  
* Search and discovery.  
* Admin enforcement.

Backend development should include independent business-rule tests, integration tests, and security review.

## **Phase 7 — Production Validation and Launch**

Run:

* Vendor onboarding pilot.  
* Real checkout testing.  
* Payment reconciliation tests.  
* Geographic eligibility tests.  
* Concurrency and cutoff tests.  
* Mobile network performance tests.  
* Cancellation/refund simulations.  
* Video-cost evaluation.  
* Vendor fulfillment training.  
* Moderation and customer-support readiness.

Launch local discovery in controlled geographic clusters, while allowing approved vendors from other Nigerian locations to build and share their storefronts.

---

# **25\. Initial Release Scope vs Later Expansion**

## **Required for initial live commerce**

* Vendor onboarding and verification.  
* Independent storefronts.  
* Dishes and modifiers.  
* Immediate ordering.  
* Scheduled pre-orders.  
* Hybrid vendor operation.  
* Vendor-controlled delivery areas.  
* Strict order-eligibility checks.  
* Payment and reconciliation.  
* Vendor order management.  
* Customer order tracking.  
* Food-image and short-video posts.  
* Local discovery.  
* Basic following and notifications.  
* Sharing.  
* Reviews.  
* Admin moderation.  
* Refund/dispute handling.  
* Production security and monitoring.

## **Later expansion candidates**

* Independent food-creator accounts.  
* Creator affiliate commissions.  
* Restaurant branch management.  
* Advanced personalized recommendations.  
* Live cooking streams.  
* Native in-app video editing.  
* Advanced vendor subscriptions.  
* Paid promotional placements.  
* More advanced loyalty/rewards.  
* Scheduled recurring customer subscriptions.  
* Group ordering.  
* More sophisticated vendor CRM.  
* Enhanced customer/vendor chat.  
* Multiple-vendor checkout orchestration.  
* Native iOS/Android applications where justified.

---

# **26\. Product Metrics and Business Validation**

MealHrs should evaluate success through real commerce outcomes, not just video views.

## **Marketplace metrics**

* Approved active vendors.  
* Vendors with active offers.  
* Orderable vendors by delivery area.  
* Active customers by city/area.  
* Successful order volume.  
* Gross merchandise value.  
* Repeat-purchase rate.  
* Customer acquisition and retention.  
* Order cancellation rate.  
* Successful fulfillment rate.

## **Social discovery metrics**

* Video completion rate.  
* Engagement rate.  
* Profile visit rate.  
* Video-to-dish click-through.  
* Video-to-order conversion.  
* Follower growth.  
* Purchases from followed vendors.  
* Orders attributed to shared links.

## **Vendor success metrics**

* Time to publish first menu.  
* Time to receive first order.  
* Orders per active vendor.  
* Repeat buyers per vendor.  
* Order acceptance time.  
* Vendor fulfillment reliability.  
* Share-link conversion.  
* Net vendor earnings.

## **Financial metrics**

* Platform revenue.  
* Payment processing cost.  
* Video delivery cost.  
* Net revenue per order.  
* Refund losses.  
* Support cost per order.  
* Contribution margin.  
* Vendor acquisition cost.  
* Customer acquisition cost.

A vendor who receives ten paid orders from a simple shared menu is providing more concrete validation than a video with thousands of views and no purchases.

---

# **27\. Regulatory and Operational Readiness**

Before live financial and food-commerce operations, MealHrs needs appropriate legal and compliance review.

Relevant areas include:

* Nigerian business registration and contracting.  
* Vendor terms and platform responsibilities.  
* Applicable food hygiene and premises rules.  
* State/local operating requirements.  
* Payment processing and settlement arrangements.  
* Customer protection and refund policies.  
* Privacy notices and personal-data handling.  
* Content ownership and copyright complaints.  
* Tax treatment.  
* Incident and consumer-complaint handling.

Nigeria's Data Protection Act 2023 provides an important privacy framework, including principles governing personal-data processing, security, and data-subject rights.

NAFDAC's Food Hygiene Regulations 2025 address food establishments and hygiene practices. Applicability and specific operating approvals must be checked against each vendor's activities and locality.

These requirements must be reflected in operational onboarding, not just placed inside a generic Terms of Service page.

---

# **28\. Key Product Decisions for Review**

The following are the principal recommendations I would use when formalizing the final requirements.

| Decision | Recommendation | Status |
| ----- | ----- | ----- |
| Overall product | Social food discovery and ordering marketplace | Proposed direction |
| Vendor categories | Home kitchens, restaurants, bakers, caterers, other food businesses | Proposed |
| Ordering models | Immediate, pre-order, and hybrid | Proposed |
| Delivery ownership | Vendor-managed only | Agreed |
| Delivery coverage | Explicit eligible vendor areas; strict blocking | Agreed |
| National access | Nationwide onboarding; phased local discovery | Recommended |
| Public content | Food-only posts | Agreed direction |
| Initial publishers | Approved food vendors | Recommended |
| Food creator accounts | Later phase | Recommended |
| Public storefront | Unique vendor URL | Agreed direction |
| Dish/catalog model | Reusable dish with flexible selling rules | Recommended |
| Checkout | One vendor, compatible fulfillment per order | Recommended |
| Payment | Full upfront for V1 | Recommended |
| Settlements | Requires provider/legal decision | Open |
| Pickup | Optional vendor setting | Recommended |
| Reviews | Verified purchases | Recommended |
| App platform | Responsive web/PWA first | Existing development direction |
| Backend | Modular monolith candidate | Recommended |
| Internal admin | Dedicated administration workspace | Required |
| Monetization | Transaction-led, with optional later services | Open |
| Discovery ranking | Eligibility-first rules, then improve from data | Recommended |

---

# **29\. Product Success Definition**

MealHrs succeeds when a vendor can:

1. Create a kitchen storefront quickly.  
2. Publish a dish or scheduled menu without technical difficulty.  
3. Share that offering with WhatsApp and Instagram customers.  
4. Publish food videos that reach relevant audiences.  
5. Receive verified paid orders.  
6. See exactly what to prepare and when.  
7. Deliver within their chosen areas.  
8. Track earnings and manage customer relationships.  
9. Build repeat demand without manually coordinating every order.

MealHrs succeeds for customers when they can:

1. Watch enjoyable food content.  
2. Discover vendors relevant to their location.  
3. Understand whether food is available now or later.  
4. See accurate prices and fulfillment information.  
5. Order and pay with confidence.  
6. Receive clear vendor-managed delivery updates.  
7. Resolve problems through a dependable support process.  
8. Follow favorite kitchens and discover new meals.

The platform succeeds commercially when these experiences produce repeat purchases, reliable fulfillment, and sustainable revenue per transaction.

---

# **30\. Final Product Positioning**

**MealHrs is a social food discovery and ordering marketplace built for independent food businesses.**

It allows home kitchens, restaurants, and other food vendors to showcase their food through videos, build branded storefronts, and sell through immediate orders or scheduled pre-orders.

Customers discover food through a food-only social feed, follow their favorite vendors, and place orders from businesses that serve their locations.

MealHrs powers discovery, ordering, and business management.

Vendors retain control of food preparation, availability, delivery zones, and fulfillment.

**Proposed tagline:**

*Discover food. Order now or plan ahead.*

**Core identity:**

*A food-first social marketplace where content leads to real orders, and independent food businesses grow on their own terms.*

---

**Draft status:** Product-review document. No final scope sign-off or Markdown-file finalization has been performed.

