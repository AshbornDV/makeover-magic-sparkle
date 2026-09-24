# NEXA TOPUP — Multi-country Top-up Platform

A deployable starter for a Nepal-first, multi-country digital game top-up store. It includes the storefront, searchable catalog, multi-currency display, checkout flow, eSewa ePay v2 initiation, Khalti KPG v2 initiation, order tracking, admin product management, supplier adapter hooks, and a demo-safe mode.

## Important: what is and is not live

This repository is **not production payment/fulfillment ready by itself**. Real eSewa/Khalti acceptance requires your own approved merchant account and credentials. Real game fulfillment requires an authorized B2B supplier account/API and region-compatible SKUs. The default `.env.example` keeps `DEMO_MODE=true` and no supplier will be contacted.

## Run locally

```bash
cp .env.example .env
# edit .env as needed
node server.js
```

Open http://localhost:3000

Admin: http://localhost:3000/admin

## Free public preview on Render

`render.yaml` configures a free Node web service with the demo storefront and health check. To publish it, push this repository to GitHub, sign in to Render, choose **New → Blueprint**, connect the repository, and deploy. Render will provide a public `onrender.com` address.

The free service may sleep after inactivity and take about a minute to wake. Purchases, order creation, payment initiation, and payment simulation are intentionally disabled in this preview. Product/package prices are illustrative. Do not add payment credentials or claim that game credit is delivered. To add live checkout later, implement and verify payment callbacks and an authorized supplier adapter first; then update the explicit `livePaymentsReady` guard in `server.js` as part of that reviewed integration.

## What you need to provide for production

### Business
- Final brand name and logo
- Business/sole-proprietor registration details
- PAN/tax information
- Business bank account for settlement
- Business address, support phone, support email
- Refund/terms/privacy/support policies
- Domain name (or let me use a temporary one)

### Payments
- eSewa merchant account / product code / secret key
- Khalti merchant account / live secret key
- Fonepay merchant/checkout details if you want Fonepay Checkout
- A compliant India setup for UPI if you want direct India UPI settlement
- Any other regional gateways after their merchant approval

Never send passwords or private API keys in chat. Put live secrets in your hosting provider's encrypted environment variables.

### Suppliers
- Supplier name(s)
- API base URL
- server-side API key/secret
- webhook secret
- allowed countries/regions
- product/SKU catalog
- wholesale price or pricing API
- refund/reversal rules
- balance funding/settlement method that is lawful and supported for your business

### Product/business decisions
- Countries to launch first
- Games to launch first
- Whether you sell gift cards in addition to ID top-ups
- Your target margin per SKU
- Your desired refund window
- Whether guest checkout is allowed

## Production architecture

Browser → your server → payment gateway → verified payment → supplier router → game publisher. Payment is confirmed server-side before fulfillment. Supplier API keys stay on the server. Webhooks are used for asynchronous supplier status. Each order gets an idempotent unique ID.

## Regional payment architecture

Nepal: eSewa + Khalti + Fonepay/QR/bank via merchant relationships.

India: UPI/card gateway via an appropriately eligible Indian or cross-border merchant arrangement.

Other markets: add regional gateway adapters as merchant approval and settlement eligibility allow. Do not promise a payment method to a country until the provider confirms your business/category is eligible.

## eSewa notes
The server implements the current documented ePay v2 signing pattern for `total_amount,transaction_uuid,product_code`, with success/failure URLs and server-side initiation. After production approval, replace the UAT credentials/URL and implement response verification + status checks before fulfilling orders.

## Khalti notes
The server implements current KPG v2 initiation. Production uses the live secret key. After callback, the merchant should verify/lookup the payment before fulfillment.

## Supplier router

Replace `routeSupplier()` in `server.js` with a real provider adapter. For scale, keep a provider table with:
- provider
- game
- region
- supplier SKU
- cost in supplier currency
- FX cost
- availability
- recent failure rate
- delivery SLA

Then route each order to the cheapest currently healthy compatible supplier.

## Production hardening required

Before taking real money, move orders/products to a real database, use an authenticated admin system with 2FA, put the app behind HTTPS, add rate limiting/WAF, verify all payment and supplier webhooks, use idempotency, implement refunds and reconciliation, add monitoring/alerts, back up the database, keep audit logs, and complete tax/accounting and gateway/supplier contractual requirements.

## Why one global gateway is not enough

Payment availability is country- and merchant-category-dependent. eSewa/Khalti are strong Nepal options; India requires a suitable UPI arrangement; some global processors restrict third-party sales of in-game currency. Therefore the app uses gateway adapters rather than forcing every country through one processor.
