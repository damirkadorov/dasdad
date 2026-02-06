# NovaPay Payment Network - API Documentation

## 🌟 Overview

**NovaPay** is a proprietary closed-loop payment network designed for sandbox banking environments. It provides a complete payment processing solution with its own terminology, flows, and card network.

### Key Principles

- **Closed-Loop Network**: All transactions stay within the NovaPay ecosystem
- **Card Prefix "7"**: All NovaPay cards start with digit "7" for easy identification
- **Flow-Based Processing**: Payments follow a clear state machine from creation to settlement
- **Serverless-Ready**: Designed for Vercel serverless deployment
- **Idempotency Support**: Built-in protection against duplicate requests

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Authentication](#authentication)
3. [Payment Flow States](#payment-flow-states)
4. [API Endpoints](#api-endpoints)
5. [Result Codes](#result-codes)
6. [Webhooks](#webhooks)
7. [Integration Examples](#integration-examples)
8. [Checkout Page](#checkout-page)
9. [Internal Bank API](#internal-bank-api)

---

## Getting Started

### Base URL

```
Production: https://yourapp.com/api/novapay
Development: http://localhost:3000/api/novapay
```

### Quick Integration

1. Create an API key in the Developer Portal (`/developer`)
2. Use the API key to create a payment flow
3. Redirect customer to the checkout URL
4. Customer pays with their NovaPay card
5. Receive webhook notification
6. Charge the flow to finalize payment

---

## Authentication

All API requests require authentication using an API key in the header:

```
X-NovaPay-Key: np_your_api_key_here
```

API keys can be created in the Developer Portal. Keys starting with `pk_` (legacy) are also accepted.

### Idempotency

For POST requests, include an idempotency key to prevent duplicate processing:

```
Idempotency-Key: unique-request-id-12345
```

Idempotency keys are valid for 24 hours.

---

## Payment Flow States

NovaPay uses a flow-based state machine:

```
┌─────────────┐
│   CREATED   │  Payment flow initialized
└──────┬──────┘
       │ Customer authorizes card
       ▼
┌─────────────┐         ┌─────────────┐
│    HELD     │────────►│   VOIDED    │  Cancelled
└──────┬──────┘  void() └─────────────┘
       │
       │ charge()
       ▼
┌─────────────┐         ┌─────────────┐
│   SETTLED   │────────►│  RETURNED   │  Fully refunded
└─────────────┘ refund()└─────────────┘
```

### State Descriptions

| State | Description |
|-------|-------------|
| `CREATED` | Flow created, awaiting card authorization |
| `HELD` | Funds reserved on customer's card |
| `SETTLED` | Payment completed, funds transferred to merchant |
| `VOIDED` | Reservation cancelled, funds released |
| `RETURNED` | Payment fully refunded |
| `DENIED` | Authorization failed |
| `EXPIRED` | Hold expired (auto-void after 7 days) |

---

## API Endpoints

### 1. Reserve (Create Payment Flow)

Initialize a new payment and get a checkout URL.

**Endpoint:** `POST /api/novapay/reserve`

**Headers:**
```
Content-Type: application/json
X-NovaPay-Key: your_api_key
Idempotency-Key: unique-id (optional)
```

**Request Body:**
```json
{
  "amount": 99.99,
  "currency": "USD",
  "memo": "Order #12345 - Premium Widget",
  "merchantRef": "order_12345",
  "merchantData": {
    "productId": "widget_001",
    "customerId": "cust_abc"
  },
  "customerEmail": "customer@example.com",
  "customerName": "John Doe",
  "onComplete": "https://yoursite.com/success",
  "onCancel": "https://yoursite.com/cancel",
  "notifyUrl": "https://yoursite.com/webhook"
}
```

**Required Fields:**
- `amount` (number): Payment amount (must be > 0)
- `currency` (string): Currency code (USD, EUR, GBP, CHF, JPY, CAD, AUD)
- `memo` (string): Payment description

**Optional Fields:**
- `merchantRef`: Your order/reference ID
- `merchantData`: Custom metadata object
- `customerEmail`: Pre-fill checkout email
- `customerName`: Customer name
- `onComplete`: Redirect URL after successful payment
- `onCancel`: Redirect URL if payment cancelled
- `notifyUrl`: Webhook URL for notifications

**Response:**
```json
{
  "ok": true,
  "resultCode": 1000,
  "message": "Request approved",
  "flowId": "npf_a1b2c3d4e5f6g7h8i9j0",
  "data": {
    "flowId": "npf_a1b2c3d4e5f6g7h8i9j0",
    "checkoutUrl": "https://yourapp.com/checkout/npf_a1b2c3d4e5f6g7h8i9j0",
    "state": "CREATED",
    "expiresAt": "2024-01-08T00:00:00.000Z"
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

### 2. Charge (Finalize Payment)

Commit a held flow and transfer funds to your account.

**Endpoint:** `POST /api/novapay/charge`

**Request Body:**
```json
{
  "flowId": "npf_a1b2c3d4e5f6g7h8i9j0",
  "amount": 99.99
}
```

**Fields:**
- `flowId` (required): The flow to charge
- `amount` (optional): Partial capture amount (defaults to full hold)

**Response:**
```json
{
  "ok": true,
  "resultCode": 1002,
  "message": "Payment settled successfully",
  "flowId": "npf_a1b2c3d4e5f6g7h8i9j0",
  "data": {
    "flowId": "npf_a1b2c3d4e5f6g7h8i9j0",
    "state": "SETTLED",
    "settledAmount": 99.99,
    "netAmount": 97.49,
    "fee": 2.50
  },
  "timestamp": "2024-01-01T12:05:00.000Z"
}
```

**Note:** A 2.5% platform fee is deducted from the settled amount.

---

### 3. Void (Cancel Reservation)

Cancel a held flow and release funds back to customer.

**Endpoint:** `POST /api/novapay/void`

**Request Body:**
```json
{
  "flowId": "npf_a1b2c3d4e5f6g7h8i9j0"
}
```

**Response:**
```json
{
  "ok": true,
  "resultCode": 1003,
  "message": "Reservation cancelled, funds released",
  "flowId": "npf_a1b2c3d4e5f6g7h8i9j0",
  "data": {
    "flowId": "npf_a1b2c3d4e5f6g7h8i9j0",
    "state": "VOIDED",
    "releasedAmount": 99.99
  },
  "timestamp": "2024-01-01T12:05:00.000Z"
}
```

---

### 4. Refund

Refund a settled payment to the customer.

**Endpoint:** `POST /api/novapay/refund`

**Request Body:**
```json
{
  "flowId": "npf_a1b2c3d4e5f6g7h8i9j0",
  "amount": 50.00,
  "reason": "Customer returned item"
}
```

**Fields:**
- `flowId` (required): The flow to refund
- `amount` (optional): Partial refund amount (defaults to full settled amount)
- `reason` (optional): Refund reason for records

**Response:**
```json
{
  "ok": true,
  "resultCode": 1004,
  "message": "Refund processed successfully",
  "flowId": "npf_a1b2c3d4e5f6g7h8i9j0",
  "data": {
    "flowId": "npf_a1b2c3d4e5f6g7h8i9j0",
    "state": "SETTLED",
    "refundedAmount": 50.00,
    "totalRefunded": 50.00
  },
  "timestamp": "2024-01-01T12:10:00.000Z"
}
```

---

### 5. Lookup (Check Status)

Get the current status of a payment flow.

**Endpoint:** `GET /api/novapay/lookup?flowId={flowId}`

**Response:**
```json
{
  "ok": true,
  "resultCode": 1000,
  "message": "Request approved",
  "flowId": "npf_a1b2c3d4e5f6g7h8i9j0",
  "data": {
    "flowId": "npf_a1b2c3d4e5f6g7h8i9j0",
    "state": "SETTLED",
    "amount": 99.99,
    "currency": "USD",
    "memo": "Order #12345 - Premium Widget",
    "merchantRef": "order_12345",
    "heldAmount": 0,
    "settledAmount": 99.99,
    "returnedAmount": 0,
    "createdAt": "2024-01-01T12:00:00.000Z",
    "heldAt": "2024-01-01T12:02:00.000Z",
    "settledAt": "2024-01-01T12:05:00.000Z"
  },
  "timestamp": "2024-01-01T12:15:00.000Z"
}
```

---

## Result Codes

NovaPay uses proprietary result codes:

### Success Codes (1xxx)

| Code | Name | Description |
|------|------|-------------|
| 1000 | APPROVED | Request approved |
| 1001 | HOLD_CREATED | Funds successfully reserved |
| 1002 | CHARGE_COMPLETE | Payment settled successfully |
| 1003 | VOID_COMPLETE | Reservation cancelled |
| 1004 | REFUND_COMPLETE | Refund processed |

### Client Errors (4xxx)

| Code | Name | Description |
|------|------|-------------|
| 4000 | INVALID_REQUEST | Invalid request format |
| 4001 | MISSING_FIELD | Required field missing |
| 4002 | INVALID_AMOUNT | Amount must be positive |
| 4003 | INVALID_CURRENCY | Currency not supported |
| 4004 | INVALID_CARD_FORMAT | Card number format invalid |
| 4005 | NOT_NOVAPAY_CARD | Card must start with 7 |
| 4006 | FLOW_NOT_FOUND | Payment flow not found |
| 4007 | INVALID_STATE_TRANSITION | Invalid operation for state |
| 4008 | DUPLICATE_REQUEST | Duplicate request detected |
| 4009 | CARD_NOT_FOUND | Card not in NovaPay network |
| 4010 | CARD_INACTIVE | Card is not active |
| 4011 | CARD_EXPIRED | Card has expired |
| 4012 | INVALID_SECURITY_CODE | CVV does not match |

### Decline Codes (5xxx)

| Code | Name | Description |
|------|------|-------------|
| 5000 | INSUFFICIENT_FUNDS | Not enough balance |
| 5001 | ACCOUNT_FROZEN | Account is frozen |
| 5002 | MERCHANT_NOT_FOUND | Merchant not found |
| 5003 | HOLD_EXPIRED | Reservation expired |
| 5004 | REFUND_EXCEEDS_ORIGINAL | Refund > original amount |

### System Errors (9xxx)

| Code | Name | Description |
|------|------|-------------|
| 9000 | INTERNAL_ERROR | Internal system error |
| 9001 | SERVICE_UNAVAILABLE | Service unavailable |
| 9002 | TIMEOUT | Request timed out |

---

## Webhooks

Configure a `notifyUrl` to receive real-time flow updates.

### Event Types

| Event | Description |
|-------|-------------|
| `flow.held` | Funds successfully reserved |
| `flow.settled` | Payment completed |
| `flow.voided` | Reservation cancelled |
| `flow.returned` | Payment fully refunded |
| `flow.denied` | Authorization failed |
| `flow.expired` | Hold expired |

### Webhook Payload

```json
{
  "eventType": "flow.settled",
  "flowId": "npf_a1b2c3d4e5f6g7h8i9j0",
  "merchantRef": "order_12345",
  "state": "SETTLED",
  "amount": 99.99,
  "currency": "USD",
  "timestamp": "2024-01-01T12:05:00.000Z",
  "data": {
    "productId": "widget_001"
  }
}
```

### Webhook Headers

```
Content-Type: application/json
X-NovaPay-Event: flow.settled
```

---

## Integration Examples

### JavaScript/TypeScript

```typescript
// Create a payment flow
async function createPayment() {
  const response = await fetch('https://yourapp.com/api/novapay/reserve', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-NovaPay-Key': 'np_your_api_key',
      'Idempotency-Key': `order_${Date.now()}`
    },
    body: JSON.stringify({
      amount: 99.99,
      currency: 'USD',
      memo: 'Order #12345',
      merchantRef: 'order_12345',
      onComplete: 'https://yoursite.com/success',
      notifyUrl: 'https://yoursite.com/webhook'
    })
  });

  const result = await response.json();
  
  if (result.ok) {
    // Redirect customer to checkout
    window.location.href = result.data.checkoutUrl;
  }
}

// Charge after customer authorization
async function chargePayment(flowId: string) {
  const response = await fetch('https://yourapp.com/api/novapay/charge', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-NovaPay-Key': 'np_your_api_key'
    },
    body: JSON.stringify({ flowId })
  });

  const result = await response.json();
  console.log('Net amount received:', result.data.netAmount);
}
```

### Webhook Handler

```typescript
// Express.js webhook handler
app.post('/webhook', express.json(), (req, res) => {
  const { eventType, flowId, amount, merchantRef } = req.body;
  
  switch (eventType) {
    case 'flow.held':
      // Customer authorized - now charge
      chargePayment(flowId);
      break;
    case 'flow.settled':
      // Payment complete - fulfill order
      fulfillOrder(merchantRef);
      break;
    case 'flow.denied':
      // Authorization failed
      notifyCustomerOfFailure(merchantRef);
      break;
  }
  
  res.status(200).send('OK');
});
```

---

## Checkout Page

When customers are redirected to the checkout URL, they see a branded NovaPay checkout page where they enter their card details.

### NovaPay Cards

- All NovaPay cards start with digit **"7"**
- 16-digit card number
- MM/YY expiry format
- 3-digit CVV

### Checkout URL Format

```
https://yourapp.com/checkout/{flowId}
```

### Post-Checkout Redirect

- **Success**: Redirects to `onComplete` URL or default success page
- **Cancel**: Redirects to `onCancel` URL or home page
- **Failure**: Shows error message on checkout page

---

## Internal Bank API

NovaPay interacts with the bank core through internal endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/internal/hold` | POST | Create a hold on funds |
| `/api/internal/commit` | POST | Commit a hold to transfer |
| `/api/internal/release` | POST | Release a hold |
| `/api/internal/refund` | POST | Process a refund |
| `/api/internal/transaction` | GET | Get transaction details |

These endpoints are for internal use only and should not be exposed publicly.

---

## Environment Variables

```env
# Application URL
NEXT_PUBLIC_APP_URL=https://yourapp.com

# MongoDB connection
MONGODB_URI=mongodb+srv://...

# JWT Secret (for user auth)
JWT_SECRET=your-secret-key
```

---

## Fees

**Platform Fee:** 2.5% per successful payment

Example: For a $100 payment, merchant receives $97.50 (fee = $2.50)

---

## Supported Currencies

- USD - US Dollar
- EUR - Euro  
- GBP - British Pound
- CHF - Swiss Franc
- JPY - Japanese Yen
- CAD - Canadian Dollar
- AUD - Australian Dollar

---

## Testing

This is a sandbox/educational system. All transactions are simulated:

1. Create a NovaPay card in your account (card number starting with 7)
2. Create a test API key in the Developer Portal
3. Use the API to create payment flows
4. Complete checkout with your test card

---

## Changelog

### Version 2.0.0

- Complete API redesign with flow-based architecture
- Proprietary NovaPay card network (prefix "7")
- New state machine (CREATED → HELD → SETTLED)
- Idempotency support
- Webhook notifications
- Partial capture and refund support
- Internal bank API integration
