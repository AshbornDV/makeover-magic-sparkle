# Production architecture

## Customer flow
Browser → country/currency selection → product selection → game-ID validation → payment initiation → server-side payment verification → supplier routing → webhook/status → delivery/result page.

## Core modules
- Catalog service: products, regions, fields, packages, availability.
- Pricing engine: supplier cost + FX + gateway cost + reserve + markup + optional competitor cap.
- Order service: immutable order ID, status machine, idempotency.
- Payment adapters: eSewa, Khalti, Fonepay/other local gateways, India UPI provider, global provider where category-approved.
- Supplier adapters: one adapter per B2B top-up API; normalize product validation/order/status/refund.
- Customer service: order lookup, tickets, refund workflow.
- Admin: products, prices, provider health, orders, reconciliation, promotions.

## Status machine
AWAITING_PAYMENT → PAYMENT_INITIATED → PAID → FULFILLING → COMPLETED
Possible terminal states: FAILED, REFUND_PENDING, REFUNDED, CANCELED, EXPIRED.

Never fulfill an order merely because the browser returned to a success URL. Verify the payment server-side and compare amount/order identifiers first.

## Scaling path
V1: Node + PostgreSQL/managed DB + one supplier + eSewa + Khalti.
V2: Redis-backed queue + 2–3 suppliers + dynamic routing.
V3: regional payment adapters + localized landing pages + reseller program + observability and automated reconciliation.
