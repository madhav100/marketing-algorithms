# CSV Streams Info

This file documents what records exist in each CSV stream used by Data Cloud ingestion.

## Record totals

| CSV file | Records (excluding header) | Description |
| --- | ---: | --- |
| `customer_profiles.csv` | 100 | Master customer profile records. |
| `customer_orders.csv` | 100 | Order revenue records by customer. |
| `customer_returns.csv` | 100 | Return and refund records linked to orders. |
| `customer_subscriptions.csv` | 100 | Subscription lifecycle and MRR records. |
| `customer_support_tickets.csv` | 100 | Support interactions and resolution records. |

## Record schema per CSV

### `customer_profiles.csv`
- **Primary key:** `id`
- **Columns:** `id`, `email`, `segment`, `region`, `signupDate`
- **What each record represents:** one customer identity profile row.

### `customer_orders.csv`
- **Primary key:** `orderId`
- **Columns:** `orderId`, `customerId`, `orderDate`, `grossRevenue`, `discountAmount`, `netRevenue`
- **What each record represents:** one revenue event (order) belonging to a customer.

### `customer_returns.csv`
- **Primary key:** `returnId`
- **Columns:** `returnId`, `orderId`, `customerId`, `returnDate`, `refundAmount`, `reason`
- **What each record represents:** one return/refund event tied to a customer order.

### `customer_subscriptions.csv`
- **Primary key:** `subscriptionId`
- **Columns:** `subscriptionId`, `customerId`, `planName`, `mrr`, `status`, `startDate`, `endDate`
- **What each record represents:** one subscription contract and its status window.

### `customer_support_tickets.csv`
- **Primary key:** `ticketId`
- **Columns:** `ticketId`, `customerId`, `openedDate`, `priority`, `resolutionHours`, `issueCategory`
- **What each record represents:** one support case used for CX and operational analysis.

## Data stream to object mapping

| Stream file | Object collection in lake | Object key |
| --- | --- | --- |
| `customer_profiles.csv` | `customer_profiles` | `id` |
| `customer_orders.csv` | `customer_orders` | `orderId` |
| `customer_returns.csv` | `customer_returns` | `returnId` |
| `customer_subscriptions.csv` | `customer_subscriptions` | `subscriptionId` |
| `customer_support_tickets.csv` | `customer_support_tickets` | `ticketId` |
