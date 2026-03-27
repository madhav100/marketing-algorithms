# Data Model (Revenue Analysis Ready)

This model is designed so customer behavior can be connected to revenue outcomes later.

## Core entities
- `customer_profiles`
  - Primary key: `id`
  - Describes segment, geography, and signup cohort
- `customer_orders`
  - Primary key: `orderId`
  - Foreign key: `customerId -> customer_profiles.id`
  - Revenue measures: `grossRevenue`, `discountAmount`, `netRevenue`
- `customer_subscriptions`
  - Primary key: `subscriptionId`
  - Foreign key: `customerId -> customer_profiles.id`
  - Recurring measure: `mrr`
- `customer_returns`
  - Primary key: `returnId`
  - Foreign keys:
    - `customerId -> customer_profiles.id`
    - `orderId -> customer_orders.orderId`
  - Revenue offset: `refundAmount`
- `customer_support_tickets`
  - Primary key: `ticketId`
  - Foreign key: `customerId -> customer_profiles.id`
  - Service metric: `resolutionHours`

## Relationship map
- One customer can have many orders.
- One customer can have many subscriptions (historical or parallel plans).
- One customer can have many returns.
- One customer can have many support tickets.
- Net realized revenue can be estimated as:
  - `SUM(customer_orders.netRevenue) - SUM(customer_returns.refundAmount)`
