# AI-Powered Post-Purchase Offers for Wix Stores

## Product Requirements & Technical Specification

**Working title:** Smart Post-Purchase Offers\
**Product type:** Wix App Market application\
**Target platform:** Wix Stores\
**Primary AI provider:** DeepSeek API\
**Document status:** Implementation specification\
**Version:** 1.0

------------------------------------------------------------------------

## 1. Product overview

Build a Wix app that helps Wix Stores merchants increase average order
value (AOV) and generate additional sales by presenting relevant product
offers after a customer completes an order.

The app combines configurable campaign rules with AI-powered product
recommendations. DeepSeek analyses the purchased products and a curated
set of eligible catalogue products, then returns ranked recommendations
and short explanations. The application---not the AI model---remains
responsible for validating product eligibility, calculating prices and
discounts, checking availability, and initiating any additional purchase
flow.

The first release focuses on merchants promoting **their own Wix Stores
products**. Partner-brand advertising, affiliate revenue sharing, and
third-party offer networks are explicitly out of scope for the MVP.

### Product goals

1.  Help merchants create post-purchase upsell and cross-sell campaigns
    without coding.
2.  Recommend relevant products using order context and catalogue
    information.
3.  Let customers discover and purchase an additional product after
    their original order.
4.  Give merchants measurable campaign performance and recommendation
    insights.
5.  Keep AI costs and storefront latency predictable.
6.  Use Wix's supported extension points and commerce APIs; do not rely
    on unsupported checkout or order mutations.

### Non-goals for the MVP

-   Modifying a paid/completed order by injecting new line items.
-   Claiming true one-click upsells unless Wix explicitly supports the
    required payment and order flow for the relevant extension.
-   Replacing Wix checkout or payment processing.
-   Partner-brand advertising or revenue sharing.
-   Training a custom foundation model.
-   Making AI the authority for product price, inventory, discount
    eligibility, tax, shipping, or payment decisions.

------------------------------------------------------------------------

## 2. Target users and use cases

### Primary users

-   Small and medium-sized Wix Stores merchants.
-   Merchants with complementary products, bundles, accessories, or
    repeat-purchase items.
-   Store owners who want to run promotions without manually selecting
    every recommendation.

### Core use cases

-   A customer buys a phone; the store recommends a compatible case or
    charger.
-   A customer buys a dress; the store recommends matching accessories.
-   A customer buys skincare; the store recommends a complementary
    product.
-   A merchant offers a discount on a complementary item after an order.
-   A merchant targets offers based on order subtotal, purchased
    products, collections, or customer/order attributes available
    through supported Wix APIs.
-   A merchant reviews impressions, clicks, accepted offers, conversion
    rate, and attributed additional sales.

------------------------------------------------------------------------

## 3. Customer journey

1.  Customer completes the normal Wix checkout and the original order is
    successfully placed.
2.  Wix displays the order confirmation / Thank You experience.
3.  The app's Thank You page extension loads the eligible campaign
    context.
4.  The app obtains only the order and product information permitted by
    the extension and applicable Wix APIs.
5.  The recommendation service retrieves eligible candidate products.
6.  The recommendation engine ranks candidates using deterministic rules
    and, where enabled, DeepSeek.
7.  The extension displays one or more offers.
8.  The customer chooses to view or accept an offer.
9.  The app creates a separate purchase flow using supported Wix
    eCommerce APIs and Wix checkout/payment infrastructure.
10. The app records the offer interaction and correlates the additional
    order with the campaign and original order where permitted.
11. The merchant sees the result in the dashboard.

**Important UX and commerce constraint:** The original order is already
completed. The MVP must treat an accepted offer as a separate purchase
unless current Wix documentation explicitly confirms another supported
approach. Do not add products to, alter, or charge against a completed
order by assumption. Do not describe the flow as "one-click" if the
customer must complete another checkout or payment authorization.

------------------------------------------------------------------------

## 4. Functional scope

### 4.1 Merchant dashboard

Build a Wix dashboard application with these sections:

  -----------------------------------------------------------------------
  Section                             Purpose
  ----------------------------------- -----------------------------------
  Overview                            Summary of revenue, impressions,
                                      clicks, conversions, and active
                                      campaigns

  Campaigns                           Create, edit, duplicate, pause,
                                      activate, and archive campaigns

  Offers                              Configure promoted products,
                                      discounts, offer copy, and display
                                      order

  AI recommendations                  Configure AI mode, recommendation
                                      rules, exclusions, and fallback
                                      behaviour

  Targeting                           Set order, product, collection, and
                                      customer eligibility rules
                                      supported by available data

  Analytics                           Campaign and product performance,
                                      date filters, conversion funnel

  Settings                            Storefront appearance, language,
                                      privacy, and app preferences

  Billing                             Subscription plan, usage, upgrade,
                                      and billing status
  -----------------------------------------------------------------------

Use a clean dashboard layout with a sidebar and main content area.

**UI requirements** - Use shadcn/ui components. - Use `lucide-react`
icons. - Use Sonner for toast notifications. - Use Zod for client and
server validation. - Support responsive dashboard layouts. - Use a
consistent Arial font stack. - Localize all customer-facing and
dashboard text; do not hardcode visible strings in components. - Do not
use browser-native validation as the primary validation UX. - During
form submission, keep the button label unchanged and show a spinner
inside the button. - Display plugin placement / installation status and
provide an action to add or configure the extension when absent, where
Wix exposes the relevant status. - Display a clear offline / connection
error message when the dashboard cannot reach required services.

### 4.2 Campaign management

A campaign must support:

-   Campaign name and internal description.
-   Status: draft, active, paused, archived.
-   Start and optional end date/time.
-   Campaign priority.
-   Number of offers to display.
-   Eligible order conditions.
-   Trigger products and/or collections.
-   Excluded products and/or collections.
-   Minimum and optional maximum original order subtotal.
-   Customer eligibility rules, limited to data available and permitted
    by Wix.
-   Recommendation mode.
-   Discount configuration.
-   Offer display settings.
-   Fallback behaviour when AI is unavailable or returns no eligible
    products.

Campaign activation must validate all required settings and warn if the
Thank You page extension is not installed or configured.

### 4.3 Offer configuration

Each offer may include:

-   Wix product ID and selected product/variant where supported.
-   Offer title and description.
-   Optional discount: percentage or fixed amount.
-   Optional campaign-specific promotional price, only where it can be
    applied through a supported Wix pricing/checkout mechanism.
-   Offer priority.
-   Optional offer expiry.
-   Product exclusions.
-   Display image sourced from Wix product data.
-   Call-to-action label.
-   Optional badge such as "Recommended for you".

The server must calculate and validate the final price using trusted Wix
product/pricing data. Never trust a price, discount, inventory status,
or product ID supplied by the browser or generated by AI.

### 4.4 AI recommendation settings

Provide these modes:

1.  **Automatic AI recommendations** --- DeepSeek ranks products based
    on the original order and eligible catalogue candidates.
2.  **Frequently bought together** --- data-driven recommendations based
    on observed order co-occurrence, when enough data exists.
3.  **Complementary products** --- AI and rules identify products that
    complement the purchased items.
4.  **Same category** --- recommend other eligible products in relevant
    categories.
5.  **Manual selection** --- merchant chooses products; AI is not
    required.
6.  **Hybrid** --- merchant-selected products are prioritized and AI
    fills remaining slots.

Merchant controls:

-   Enable or disable AI.
-   Choose recommendation mode.
-   Set maximum recommendations.
-   Exclude products and collections.
-   Exclude products already purchased in the original order.
-   Set a permitted price range or maximum price ratio relative to the
    original order.
-   Set minimum stock / availability requirements where supported.
-   Choose whether AI-generated explanations are displayed to customers.
-   Choose fallback mode: manual offers, rule-based recommendations, or
    no offer.

The MVP should not expose model temperature, token limits, or other
advanced model parameters to ordinary merchants.

### 4.5 Targeting rules

Support rules only where the relevant fields are available from Wix's
supported APIs and the extension context:

-   Original order subtotal.
-   Products in the original order.
-   Product collections/categories.
-   Product IDs to include or exclude.
-   Campaign date range.
-   Currency compatibility.
-   Customer/order attributes that Wix permits the app to access.

If a rule depends on data not available in the Thank You page context,
the campaign builder must explain the limitation rather than silently
assuming the data exists.

### 4.6 Storefront offer experience

The Thank You page extension should:

-   Match the merchant's brand using configurable typography, colours,
    border radius, and button styling.
-   Display responsive product cards.
-   Show product image, name, offer price, original price when valid,
    discount, and concise reason.
-   Support loading, empty, error, and success states.
-   Avoid blocking or delaying the original order confirmation content.
-   Provide accessible labels, keyboard navigation, and sufficient
    colour contrast.
-   Avoid displaying an offer if the original order cannot be validated.
-   Revalidate product availability and price immediately before
    creating the additional purchase flow.
-   Prevent duplicate submissions through idempotency controls.
-   Respect customer privacy and applicable consent requirements.

Recommended default layout: - Heading: "A little something extra for
you" - One to three recommended products. - One primary action per
offer. - A clear "No thanks" or dismiss action. - No forced countdown
timers or deceptive urgency.

All customer-facing copy must be localizable.

------------------------------------------------------------------------

## 5. AI recommendation architecture

### 5.1 Provider

Use the DeepSeek API as the primary AI provider, accessed only from the
backend.

Keep the AI provider behind an internal adapter so another provider can
be added later without changing campaign, storefront, or recommendation
interfaces.

Suggested interface:

``` ts
interface RecommendationProvider {
  recommend(input: RecommendationInput): Promise<RecommendationResult>;
}
```

The implementation must use the currently supported DeepSeek API
endpoint, model identifier, authentication method, and structured-output
capabilities verified against the official DeepSeek documentation at
implementation time. Do not hardcode an assumed model name in multiple
files; keep it in server-side configuration.

### 5.2 Recommendation pipeline

Use a hybrid pipeline rather than asking an LLM to inspect the entire
store catalogue for every order.

**Stage 1 --- Retrieve order context** - Read the original order through
the supported Wix API / extension context. - Extract product IDs,
variant IDs where relevant, quantities, currency, and permitted product
attributes. - Exclude sensitive customer information unless strictly
necessary and explicitly permitted.

**Stage 2 --- Build candidate set** - Retrieve a bounded set of store
products from Wix Catalog / Stores APIs. - Exclude products already in
the order. - Exclude unavailable, hidden, deleted, or otherwise
ineligible products using authoritative Wix data. - Apply campaign
exclusions, currency and price rules. - Limit candidates to a
configurable maximum for cost and latency control.

**Stage 3 --- Deterministic scoring** Apply non-AI checks and signals,
such as: - Campaign eligibility. - Product/collection match. -
Complementary category rules. - Merchant priority. - Historical
co-purchase frequency, if sufficient data exists. - Product performance
and conversion data, if available. - Price compatibility.

**Stage 4 --- DeepSeek ranking** Send the order context and bounded
candidate list to DeepSeek. Ask it to: - Rank candidate product IDs. -
Explain relevance briefly. - Identify the relationship to the purchased
products. - Return structured JSON matching a strict schema.

The model must only select IDs from the candidate list. It must not
invent products, prices, discounts, stock levels, URLs, or checkout
details.

**Stage 5 --- Validate and filter** - Parse the response using Zod. -
Reject unknown product IDs. - Re-check exclusions and campaign rules. -
Re-check price and inventory with Wix before rendering or purchase. -
Clamp the number of results. - Remove unsupported or unsafe generated
copy. - Fall back to deterministic recommendations if AI fails.

**Stage 6 --- Display and learn** - Display ranked offers. - Record
impressions, clicks, dismissals, and completed additional purchases. -
Use aggregate campaign performance as a future ranking signal. - Do not
send customer-identifying information to DeepSeek unless there is a
documented, necessary, permitted use and the merchant/customer
disclosures and privacy requirements have been addressed.

### 5.3 Example AI request

Send a compact payload containing only the information needed for
product matching:

``` json
{
  "currency": "USD",
  "purchased_products": [
    {
      "product_id": "wix-product-123",
      "name": "Wireless Headphones",
      "description": "Over-ear Bluetooth headphones",
      "category": "Electronics"
    }
  ],
  "candidate_products": [
    {
      "product_id": "wix-product-456",
      "name": "Headphone Carrying Case",
      "description": "Protective hard case",
      "category": "Accessories",
      "price": 19.99
    },
    {
      "product_id": "wix-product-789",
      "name": "USB-C Charging Cable",
      "description": "Braided charging cable",
      "category": "Electronics",
      "price": 12.99
    }
  ],
  "max_recommendations": 2
}
```

### 5.4 Example expected response

``` json
{
  "recommendations": [
    {
      "product_id": "wix-product-456",
      "relevance": "high",
      "relationship": "complementary_accessory",
      "reason": "A protective case helps keep the headphones safe while travelling."
    },
    {
      "product_id": "wix-product-789",
      "relevance": "medium",
      "relationship": "related_accessory",
      "reason": "A compatible cable may be useful as an additional charging accessory."
    }
  ]
}
```

The example is an application-level contract, not a claim about the
exact DeepSeek response format. Implement structured output according to
the currently documented API behaviour and validate it server-side.

### 5.5 AI reliability and fallback

-   Set request timeouts and bounded retries.
-   Use exponential backoff for transient provider errors, with a strict
    retry limit.
-   Never block the original order confirmation page while waiting
    indefinitely for AI.
-   Use cached or precomputed recommendations where possible.
-   Fall back to manual campaign offers or deterministic rules.
-   Log provider errors without logging unnecessary customer data or API
    secrets.
-   Add per-store and per-campaign usage limits.
-   Track token usage and estimated AI cost.
-   Provide an admin kill switch to disable AI recommendations globally.

### 5.6 Embeddings and catalogue scale

Do not require embeddings for the first MVP. Start with product
metadata, deterministic candidate retrieval, and DeepSeek ranking over a
bounded candidate set.

For larger catalogues, evaluate a dedicated vector search / embedding
service. Do not assume DeepSeek provides a compatible embedding endpoint
or treat an LLM as a vector database. Select an embedding provider
separately after validating its API, price, data handling, and Wix app
architecture requirements.

------------------------------------------------------------------------

## 6. Wix platform architecture

### 6.1 App structure

Use Wix CLI with an Astro-based project. Do not introduce Next.js.

Recommended logical components:

-   Wix Dashboard Extension --- merchant dashboard.
-   Thank You page Site Plugin --- storefront post-purchase offer UI.
-   Backend API routes under `pages/api` --- authenticated app
    operations.
-   Wix Data --- app-owned persistence.
-   Wix eCommerce / Stores APIs --- catalogue, order, cart, checkout and
    payment-related operations.
-   Wix Events --- relevant order/product lifecycle events, where
    supported and needed.
-   Wix Billing --- app subscription plans and entitlements.
-   DeepSeek API --- server-side recommendation provider.

Use `fetchWithAuth` for authenticated Wix API requests in the Astro app
where applicable. Keep credentials and provider API keys on the server.

### 6.2 Wix documentation verification gate

Before implementation, verify the current official Wix documentation and
API scopes for each capability. Wix APIs and extension contracts can
change; do not rely on assumptions or undocumented endpoints.

Required verification:

1.  **Thank You page Site Plugin**
    -   Confirm the current extension slot, registration process,
        supported component framework, props/context, lifecycle, and App
        Market requirements.
    -   Confirm precisely which order and customer fields are available
        to the extension.
    -   Confirm whether the extension can render reliably for guest and
        logged-in checkout flows.
2.  **Orders API**
    -   Confirm how to retrieve the original order and which scopes are
        required.
    -   Confirm which fields are available to the app and whether the
        extension context supplies an order ID.
    -   Do not assume a completed order can be modified.
3.  **Catalog / Stores APIs**
    -   Confirm product and variant retrieval, pagination,
        inventory/availability fields, visibility, price, currency,
        media, and collection/category fields.
    -   Confirm rate limits and supported product types.
4.  **Cart V2 and checkout**
    -   Confirm the supported method for creating a new cart from a
        selected product/variant.
    -   Confirm how to apply supported discounts or pricing rules.
    -   Confirm how to obtain and redirect to a checkout URL.
    -   Confirm whether a post-purchase offer can be purchased without a
        second checkout. If not explicitly supported, retain the
        separate checkout flow.
5.  **Payment**
    -   Use Wix's supported checkout/payment infrastructure.
    -   Do not store payment card data.
    -   Confirm payment status from trusted server-side Wix events or
        API responses before recording a conversion.
6.  **Events**
    -   Verify relevant order-created/paid and product-updated events,
        event payloads, retries, signatures, and idempotency guidance.
    -   Do not assume an event name or payload without checking current
        docs.
7.  **Recommendations Service Plugin**
    -   Evaluate as a possible later integration for exposing
        recommendations through Wix's recommendation infrastructure.
    -   It is not a prerequisite for the Thank You page MVP.
8.  **Billing**
    -   Verify Wix Billing APIs, trial eligibility, plan status, and
        subscription lifecycle events.
    -   Enforce subscription entitlements server-side (default deny
        until verified).

Record the exact documentation URLs, API versions, scopes, and
implementation decisions in a technical decision log before coding.

### 6.3 Suggested API route boundaries

Route names are proposed internal application routes, not Wix-provided
endpoints.

  ------------------------------------------------------------------------
  Route                                Responsibility
  ------------------------------------ -----------------------------------
  `GET /api/dashboard/overview`        Dashboard metrics

  `GET /api/campaigns`                 List campaigns

  `POST /api/campaigns`                Create campaign

  `GET /api/campaigns/:id`             Read campaign

  `PATCH /api/campaigns/:id`           Update campaign

  `DELETE /api/campaigns/:id`          Archive/delete campaign safely

  `POST /api/campaigns/:id/activate`   Validate and activate

  `POST /api/recommendations`          Generate or retrieve
                                       recommendations

  `POST /api/offers/:id/interaction`   Record impression/click/dismiss

  `POST /api/offers/:id/checkout`      Validate offer and create supported
                                       checkout flow

  `POST /api/webhooks/wix`             Handle verified Wix events

  `GET /api/settings`                  Read settings

  `PATCH /api/settings`                Update settings

  `GET /api/billing`                   Read verified entitlement state
  ------------------------------------------------------------------------

All routes must authenticate the Wix app instance and authorize access
to the correct site/store. Validate request bodies with Zod. Add rate
limiting to public/storefront-facing endpoints.

------------------------------------------------------------------------

## 7. Data model

Use Wix Data collections with site-level ownership and strict permission
rules. Collection names below are proposed.

### 7.1 `Campaigns`

  Field                     Type         Description
  ------------------------- ------------ ------------------------------------
  `_id`                     string       Wix Data record ID
  `siteId`                  string       Owning Wix site
  `name`                    string       Campaign name
  `description`             string       Internal description
  `status`                  string       draft / active / paused / archived
  `priority`                number       Campaign priority
  `startAt`                 date         Optional start
  `endAt`                   date         Optional end
  `triggerProductIds`       string\[\]   Trigger products
  `triggerCollectionIds`    string\[\]   Trigger collections
  `excludedProductIds`      string\[\]   Excluded products
  `excludedCollectionIds`   string\[\]   Excluded collections
  `minOrderSubtotal`        number       Minimum order value
  `maxOrderSubtotal`        number       Optional maximum
  `currency`                string       Campaign currency
  `recommendationMode`      string       AI / rules / manual / hybrid
  `maxOffers`               number       Maximum offers
  `fallbackMode`            string       Manual / rules / none
  `createdAt`               date         Created timestamp
  `updatedAt`               date         Updated timestamp

### 7.2 `Offers`

  Field             Type      Description
  ----------------- --------- ---------------------------
  `_id`             string    Record ID
  `siteId`          string    Owning site
  `campaignId`      string    Parent campaign
  `productId`       string    Wix product ID
  `variantId`       string    Optional variant
  `discountType`    string    none / percentage / fixed
  `discountValue`   number    Discount value
  `title`           string    Offer title
  `description`     string    Offer description
  `priority`        number    Offer priority
  `active`          boolean   Offer status

### 7.3 `RecommendationCache`

  --------------------------------------------------------------------------
  Field                   Type                    Description
  ----------------------- ----------------------- --------------------------
  `_id`                   string                  Record ID

  `siteId`                string                  Owning site

  `cacheKey`              string                  Hash of relevant
                                                  order/candidate/campaign
                                                  context

  `campaignId`            string                  Campaign

  `productIds`            string\[\]              Ranked candidate IDs

  `reasons`               object\[\]              Validated explanation data

  `provider`              string                  AI provider

  `model`                 string                  Model identifier

  `createdAt`             date                    Creation time

  `expiresAt`             date                    Cache expiry
  --------------------------------------------------------------------------

Do not store raw customer data in the cache key. Use a privacy-safe hash
of the minimum necessary context.

### 7.4 `OfferEvents`

  -----------------------------------------------------------------------
  Field                   Type                    Description
  ----------------------- ----------------------- -----------------------
  `_id`                   string                  Record ID

  `siteId`                string                  Owning site

  `campaignId`            string                  Campaign

  `offerId`               string                  Offer

  `productId`             string                  Offered product

  `originalOrderId`       string                  Original order
                                                  reference, if permitted

  `additionalOrderId`     string                  Resulting order
                                                  reference, if accepted

  `eventType`             string                  impression / click /
                                                  dismiss /
                                                  checkout_started /
                                                  purchase_confirmed

  `sessionKey`            string                  Pseudonymous session
                                                  correlation key

  `currency`              string                  Currency

  `amount`                number                  Confirmed attributed
                                                  amount where applicable

  `createdAt`             date                    Event timestamp
  -----------------------------------------------------------------------

### 7.5 `AppSettings`

Store: - Store/site ID. - AI enabled flag. - Provider configuration
reference (never API secret in a client-readable collection). - Default
recommendation mode. - Maximum recommendations. - Default fallback
mode. - Appearance settings. - Locale settings. - Privacy/retention
settings.

### 7.6 `ProcessedEvents`

Use for event idempotency: - Wix event ID or stable event key. - Site
ID. - Event type. - Processed timestamp. - Processing status.

### 7.7 Data security

-   Apply least-privilege collection permissions.
-   Never expose private collections directly to storefront clients.
-   Scope every query by the authenticated site ID.
-   Validate ownership for every campaign and offer operation.
-   Do not store card details or unnecessary personal information.
-   Define retention and deletion policies.
-   Provide a way to remove app-owned data on uninstall where required
    by Wix policy and applicable law.

------------------------------------------------------------------------

## 8. Analytics

Track the funnel:

1.  Eligible order.
2.  Offer request.
3.  Offer rendered / impression.
4.  Offer clicked.
5.  Checkout started.
6.  Additional order paid / confirmed.

Dashboard metrics:

-   Total attributed additional revenue.
-   Offer impressions.
-   Offer click-through rate.
-   Checkout-start rate.
-   Purchase conversion rate.
-   Average additional order value.
-   Revenue by campaign.
-   Revenue by recommended product.
-   AI recommendation acceptance rate.
-   AI provider cost and request count.

Metric definitions must be consistent: - **CTR** = offer clicks / offer
impressions. - **Offer conversion rate** = confirmed additional
purchases / offer impressions. - **Attributed revenue** = confirmed paid
amount from additional orders linked to an offer, excluding the original
order amount.

Do not count checkout starts as purchases. Confirm payment status using
trusted Wix data/events. Avoid double-counting event retries by using
idempotency keys.

------------------------------------------------------------------------

## 9. Monetization and entitlements

Suggested initial plans (validate through market research before
launch):

  ------------------------------------------------------------------------
  Plan                               Suggested price Limits
  --------------------- ---------------------------- ---------------------
  Free                                     \$0/month 1 active campaign,
                                                     limited monthly offer
                                                     impressions

  Basic                                 \$9.99/month More campaigns and
                                                     higher monthly
                                                     impression allowance

  Pro                                  \$19.99/month Unlimited campaigns,
                                                     advanced targeting,
                                                     A/B testing, expanded
                                                     analytics
  ------------------------------------------------------------------------

The final limits should be based on infrastructure cost, DeepSeek usage,
Wix billing constraints, and competitor research.

### Billing requirements

-   Use Wix Billing for app subscriptions.
-   Verify entitlement server-side on every paid feature operation.
-   Default to deny paid features until subscription status is verified.
-   Support free trial eligibility only when confirmed by Wix Billing
    data.
-   Handle active, trial, expired, cancelled, and resubscribed states.
-   Do not rely on client-side plan labels or query parameters to
    authorize features.
-   Give the merchant a clear upgrade path when a limit is reached.

### AI cost controls

-   Set a monthly AI request allowance by plan.
-   Cache results where safe.
-   Limit candidate products per request.
-   Limit prompt and response token sizes.
-   Record token usage and estimated cost.
-   Use deterministic recommendations after a store's AI allowance is
    exhausted, according to plan policy.

------------------------------------------------------------------------

## 10. Security, privacy, and abuse prevention

-   Keep DeepSeek API keys in server-side secrets/environment
    configuration.
-   Never send API keys to dashboard or storefront JavaScript.
-   Treat all AI output as untrusted.
-   Use strict JSON schema validation.
-   Treat product descriptions and merchant content as untrusted input;
    defend prompts against instruction injection.
-   The AI must not be allowed to call Wix APIs or perform transactions
    directly.
-   The AI must not set prices, discounts, stock, payment status, or
    checkout URLs.
-   Revalidate every product and offer on the server before checkout
    creation.
-   Verify Wix webhook/event authenticity according to current
    documentation.
-   Add replay protection and idempotency.
-   Rate-limit recommendation and interaction endpoints.
-   Avoid exposing order/customer details in logs.
-   Publish a clear privacy policy describing AI data processing and the
    DeepSeek service provider.
-   Review applicable Wix App Market data handling and third-party AI
    disclosure requirements before submission.

------------------------------------------------------------------------

## 11. Localization and accessibility

-   Prepare the app for at least the top 20 target languages.
-   Store translation keys separately from UI components.
-   Localize campaign dates, currency, number formats, and
    customer-facing copy.
-   Use the store's supported locale/currency context where available.
-   Ensure responsive storefront layouts.
-   Support keyboard navigation and screen readers.
-   Use accessible contrast and focus indicators.
-   Ensure AI-generated explanations can be translated or generated in
    the customer's supported language without changing product facts.

------------------------------------------------------------------------

## 12. Error handling

  -----------------------------------------------------------------------
  Scenario                            Expected behaviour
  ----------------------------------- -----------------------------------
  AI provider unavailable             Use cached, manual, or rule-based
                                      offers

  AI returns invalid JSON             Reject response and use fallback

  AI recommends unknown product       Reject that recommendation

  Product becomes unavailable         Remove it and refresh candidate
                                      list

  Product price changes               Recalculate from trusted Wix data

  Original order cannot be verified   Do not display personalized offer

  Checkout creation fails             Show a clear retry message; do not
                                      record a sale

  Payment remains pending             Do not count as converted revenue

  Duplicate event received            Ignore safely using idempotency

  Campaign expired                    Do not show its offers

  App subscription expired            Enforce plan restrictions
                                      server-side

  Network unavailable                 Show a graceful storefront state
                                      without blocking order confirmation
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 13. Testing requirements

### Unit tests

-   Campaign eligibility and priority.
-   Price and discount calculations.
-   Candidate filtering.
-   AI response schema validation.
-   Unknown product rejection.
-   Cache key generation.
-   Analytics calculations.
-   Billing entitlement checks.

### Integration tests

-   Wix product retrieval and pagination.
-   Original order retrieval.
-   DeepSeek API request and failure handling.
-   Wix cart/checkout creation.
-   Wix event verification and idempotency.
-   Data isolation between sites.
-   Subscription lifecycle.

### Storefront tests

-   Desktop and mobile Thank You page.
-   Guest checkout and member checkout where supported.
-   No campaign / no eligible product.
-   AI timeout and fallback.
-   Product unavailable after recommendation.
-   Duplicate click / repeated checkout submission.
-   Accessibility and localization.

### End-to-end acceptance criteria

-   Merchant can install and configure the app.
-   Merchant can create and activate a campaign.
-   The Thank You page extension appears in the supported placement.
-   An eligible completed order can produce relevant offers.
-   AI recommendations contain only eligible catalogue product IDs.
-   A customer can proceed through the supported additional purchase
    flow.
-   A confirmed paid additional order is attributed once.
-   Analytics reflect the confirmed purchase.
-   AI failure does not break the original order confirmation page.
-   One store cannot access another store's campaigns, settings, or
    events.
-   Paid entitlements are verified server-side.

------------------------------------------------------------------------

## 14. MVP delivery phases

### Phase 0 --- Wix technical validation

Complete before building the commerce flow: - Validate Thank You page
Site Plugin capability and data context. - Validate Orders API access
and scopes. - Validate product/catalogue retrieval. - Validate Cart V2
and checkout creation for an additional purchase. - Validate payment
confirmation and event lifecycle. - Confirm App Market policies for the
proposed customer journey. - Produce a technical decision log and
proof-of-concept.

**Exit criterion:** Demonstrate a real test order reaching the Thank You
page, retrieving permitted order/product data, and creating a separate
supported additional checkout.

### Phase 1 --- App foundation

-   Create Astro + Wix CLI app.
-   Configure dashboard extension.
-   Configure Thank You page Site Plugin.
-   Set up backend routes and authentication.
-   Create Wix Data collections and permissions.
-   Add settings and localization foundations.
-   Add billing integration skeleton.

### Phase 2 --- Manual campaigns and offers

-   Campaign CRUD.
-   Product picker and exclusions.
-   Offer configuration.
-   Targeting rules.
-   Storefront offer cards.
-   Separate additional checkout flow.
-   Basic event tracking.

### Phase 3 --- DeepSeek recommendations

-   DeepSeek provider adapter.
-   Candidate retrieval and deterministic filtering.
-   Structured AI ranking.
-   Zod response validation.
-   Caching, timeouts, retries, and fallback.
-   Merchant AI settings.
-   AI usage and cost tracking.

### Phase 4 --- Analytics and monetization

-   Dashboard overview.
-   Campaign analytics.
-   Product-level analytics.
-   Billing plans and entitlements.
-   Usage limits and upgrade prompts.

### Phase 5 --- Advanced features

-   A/B testing.
-   Frequently bought together from store order data.
-   Better catalogue search / embeddings.
-   Advanced segmentation.
-   Multiple offer steps, if supported by the extension and purchase
    flow.
-   Optional Wix Recommendations Service Plugin integration after
    separate feasibility review.

------------------------------------------------------------------------

## 15. Suggested project structure

Adapt to the actual structure generated by the current Wix CLI template;
do not force files into paths that the selected template does not
support.

``` text
src/
  components/
    dashboard/
    campaigns/
    offers/
    analytics/
    settings/
    storefront/
  pages/
    api/
      campaigns/
      recommendations/
      offers/
      analytics/
      settings/
      billing/
      webhooks/
  lib/
    wix/
      auth/
      catalog/
      orders/
      checkout/
      events/
      billing/
    ai/
      providers/
        deepseek.ts
      recommendation-service.ts
      prompts/
      schemas/
    recommendations/
      candidate-retrieval.ts
      filtering.ts
      ranking.ts
      cache.ts
    analytics/
    validation/
    localization/
  types/
  locales/
```

The actual Wix CLI extension entry points and configuration files must
follow the current official Wix app template.

------------------------------------------------------------------------

## 16. Environment configuration

Example variable names (use the secret-management mechanism supported by
the Wix app runtime):

``` env
DEEPSEEK_API_KEY=
DEEPSEEK_MODEL=
DEEPSEEK_BASE_URL=
APP_ENV=
```

-   Never commit secrets.
-   Never expose server-only variables to the browser.
-   Validate required configuration at startup.
-   Keep model and endpoint configurable.
-   Do not store the DeepSeek key in Wix Data or a client-readable
    settings record.

------------------------------------------------------------------------

## 17. Release checklist

-   [ ] Wix extension and API feasibility documented with current
    official references.
-   [ ] Thank You page placement verified on a real test site.
-   [ ] Additional purchase flow tested end to end.
-   [ ] No unsupported completed-order mutation.
-   [ ] DeepSeek integration is server-side only.
-   [ ] AI output validated and constrained to candidate IDs.
-   [ ] Rule-based fallback works.
-   [ ] Site data isolation verified.
-   [ ] Event verification and idempotency tested.
-   [ ] Billing entitlements enforced server-side.
-   [ ] Privacy policy and AI data disclosure prepared.
-   [ ] All dashboard and storefront strings localized.
-   [ ] Responsive and accessibility tests passed.
-   [ ] App Market listing assets and support documentation prepared.

------------------------------------------------------------------------

## 18. Official documentation to verify during implementation

Use the current official documentation rather than relying on copied
examples or third-party tutorials:

-   Wix Developers: https://dev.wix.com/
-   Wix App Extensions: https://dev.wix.com/docs/build-apps
-   Wix eCommerce APIs:
    https://dev.wix.com/docs/api-reference/business-solutions/e-commerce
-   Wix Stores APIs:
    https://dev.wix.com/docs/api-reference/business-solutions/stores
-   Wix Data: https://dev.wix.com/docs/velo/apis/wix-data
-   DeepSeek API documentation: https://api-docs.deepseek.com/

The exact API references, scopes, extension contracts, supported
runtime, and request/response schemas must be confirmed against the
current documentation before implementation.

------------------------------------------------------------------------

## 19. Key product decisions

  -----------------------------------------------------------------------
  Decision                            MVP choice
  ----------------------------------- -----------------------------------
  Target platform                     Wix Stores

  Main placement                      Wix Thank You page Site Plugin,
                                      subject to technical validation

  AI provider                         DeepSeek API

  Recommendation approach             Hybrid rules + AI ranking

  Products promoted                   Merchant's own Wix catalogue

  Additional purchase                 Separate supported Wix checkout
                                      flow

  Data storage                        Wix Data

  App framework                       Astro + Wix CLI

  Dashboard UI                        React + shadcn/ui

  Validation                          Zod

  Notifications                       Sonner

  Localization                        Top 20 target languages

  Partner advertising                 Not in MVP

  Embeddings                          Later phase, only if catalogue
                                      scale justifies them
  -----------------------------------------------------------------------

**Final implementation principle:** Build a reliable commerce extension
first, then layer AI recommendations on top. The customer must always
receive a valid, purchasable offer based on authoritative Wix
data---even when DeepSeek is unavailable.
