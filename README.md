# Subscription Launchpad

Subscription Launchpad is a small planning tool for merchants who want to check a subscription offer before launching it. A merchant enters the product price, discount, billing and delivery timing, shipping threshold, expected subscribers, and available inventory. The app returns a launch-readiness report and a 90-day schedule. Merchants can also save checked plans in MongoDB and reopen them later.

The project is intentionally simple. It demonstrates commerce logic, API design, validation, testing, and a clear user workflow without connecting to a real store or payment system.

## How it works

```mermaid
flowchart LR
    A["Merchant enters a plan"] --> B["Three-step Angular form"]
    B --> C["POST /api/analyze"]
    C --> D["Subscription rules"]
    C --> E["90-day schedule builder"]
    D --> F["Readiness report"]
    E --> F
    F --> G["Findings, totals, and timeline"]
    G --> H["Save plan"]
    H --> I["MongoDB"]
    I --> J["Reopen a saved plan"]
```

The rules engine checks whether:

- the discount leaves a valid positive price;
- the discounted price changes free-shipping eligibility;
- billing and delivery happen on different schedules; and
- available inventory covers the next 90 days.

The schedule builder also estimates billing events, deliveries, revenue, and inventory usage during the preview period.

## Run locally

Requirements: Node.js 22.12 or newer.

```bash
npm install
npm run dev
```

The launch checker works without a database. To enable saved plans, copy `.env.example` to `.env` and add a MongoDB Atlas connection string:

```bash
MONGODB_URI=mongodb+srv://username:password@cluster.example.mongodb.net/
MONGODB_DATABASE=subscription_launchpad
```

Then start the project:

```bash
npm run dev
```

Open `http://localhost:4200`.

## Verify the project

```bash
npm run lint
npm test
```

The tests cover the subscription rules, schedule calculations, API input, Angular build output, and deployed worker API.

## Technology

- Angular and TypeScript
- REST APIs
- MongoDB for saved plans
- Deterministic business rules
- Node test runner and TSX
- Cloudflare Workers-compatible deployment

## Project scope

This portfolio project does not process payments, change store data, or require a Shopify account. Its inputs are sample planning data, so it can be used as a general subscription-commerce prototype rather than a Shopify-only application.
