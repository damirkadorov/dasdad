# Payment Gateway API Documentation

## 🚀 Quick Start

Integrate our payment gateway into your website in minutes. Accept payments from customers worldwide with our simple API.

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
- [Integration Examples](#integration-examples)
- [Webhook Events](#webhook-events)
- [Testing](#testing)
- [FAQ](#faq)

## Getting Started

### 1. Create an API Key

⚠️ **IMPORTANT: API keys are NOT created in your business banking dashboard!**

API keys are created on the **Developer Portal page**:

1. Log in to your account at [https://yourapp.com/developer](https://dasdad-alpha.vercel.app/)
2. Navigate to the **`/developer`** page (Developer Portal)
3. Click the "**Create New API Key**" button
4. Give your API key a name (e.g., "My Website")
5. Optionally, add your domain for security
6. Copy and securely store your API key (starts with `pk_`)

💡 **Tip:** If you're on the business dashboard (`/business/dashboard`), look for the "Payment Gateway API" section and click "🔑 Go to API Keys"

### 2. Test the Integration

Open `/public/integration-example.html` in your browser to see a live demo.

## Authentication

All API requests require authentication using an API key. Include your API key in the request header:

```
X-API-Key: pk_your_api_key_here
```

## API Endpoints

### Base URL

```
Production: https://yourapp.com/api/payment-gateway
Development: http://localhost:3000/api/payment-gateway
```

### 1. Create Payment

Initialize a new payment and get a payment URL.

**Endpoint:** `POST /payments`

**Headers:**
```
Content-Type: application/json
X-API-Key: your_api_key
```

**Request Body:**
```json
{
  "amount": 100,
  "currency": "USD",
  "description": "Order #12345",
  "customerEmail": "customer@example.com",
  "customerName": "John Doe",
  "orderId": "12345",
  "metadata": {
    "productId": "prod_123",
    "customField": "value"
  },
  "successUrl": "https://yoursite.com/success",
  "cancelUrl": "https://yoursite.com/cancel",
  "webhookUrl": "https://yoursite.com/webhook"
}
```

**Required Fields:**
- `amount` (number): Payment amount (must be > 0)
- `currency` (string): Currency code (USD, EUR, GBP, CHF, JPY, CAD, AUD)
- `description` (string): Payment description

**Optional Fields:**
- `customerEmail` (string): Customer's email
- `customerName` (string): Customer's name
- `orderId` (string): Your order/transaction ID
- `metadata` (object): Additional data to store with the payment
- `successUrl` (string): URL to redirect after successful payment
- `cancelUrl` (string): URL to redirect if payment is cancelled
- `webhookUrl` (string): URL to receive payment status updates

**Response:**
```json
{
  "success": true,
  "paymentId": "uuid-payment-id",
  "paymentUrl": "https://yourapp.com/payment/uuid-payment-id",
  "status": "pending",
  "amount": 100,
  "currency": "USD"
}
```

**Next Step:** Redirect the customer to `paymentUrl` to complete the payment.

### 2. Check Payment Status

Get the current status of a payment.

**Endpoint:** `GET /payments?paymentId={paymentId}`

**Headers:**
```
X-API-Key: your_api_key
```

**Response:**
```json
{
  "paymentId": "uuid-payment-id",
  "status": "completed",
  "amount": 100,
  "currency": "USD",
  "description": "Order #12345",
  "orderId": "12345",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "completedAt": "2024-01-01T00:05:00.000Z"
}
```

**Payment Statuses:**
- `pending`: Payment created, waiting for customer
- `processing`: Customer is completing payment
- `completed`: Payment successful
- `failed`: Payment failed
- `refunded`: Payment was refunded

## Integration Examples

### JavaScript/Node.js

```javascript
// Create a payment
async function createPayment() {
  const response = await fetch('https://yourapp.com/api/payment-gateway/payments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': 'pk_your_api_key_here'
    },
    body: JSON.stringify({
      amount: 100,
      currency: 'USD',
      description: 'Order #12345',
      customerEmail: 'customer@example.com',
      orderId: '12345',
      successUrl: 'https://yoursite.com/success',
      webhookUrl: 'https://yoursite.com/webhook'
    })
  });

  const data = await response.json();
  
  if (data.success) {
    // Redirect customer to payment page
    window.location.href = data.paymentUrl;
  }
}

// Check payment status
async function checkPayment(paymentId) {
  const response = await fetch(
    `https://yourapp.com/api/payment-gateway/payments?paymentId=${paymentId}`,
    {
      headers: {
        'X-API-Key': 'pk_your_api_key_here'
      }
    }
  );

  const data = await response.json();
  console.log('Payment status:', data.status);
}
```

### PHP

```php
<?php
// Create a payment
$apiKey = 'pk_your_api_key_here';
$apiUrl = 'https://yourapp.com/api/payment-gateway/payments';

$data = [
    'amount' => 100,
    'currency' => 'USD',
    'description' => 'Order #12345',
    'customerEmail' => 'customer@example.com',
    'orderId' => '12345',
    'successUrl' => 'https://yoursite.com/success',
    'webhookUrl' => 'https://yoursite.com/webhook'
];

$options = [
    'http' => [
        'header' => [
            'Content-Type: application/json',
            "X-API-Key: $apiKey"
        ],
        'method' => 'POST',
        'content' => json_encode($data)
    ]
];

$context = stream_context_create($options);
$result = file_get_contents($apiUrl, false, $context);
$response = json_decode($result);

if ($response->success) {
    // Redirect to payment page
    header('Location: ' . $response->paymentUrl);
}
?>
```

### Python

```python
import requests

# Create a payment
api_key = 'pk_your_api_key_here'
api_url = 'https://yourapp.com/api/payment-gateway/payments'

headers = {
    'Content-Type': 'application/json',
    'X-API-Key': api_key
}

data = {
    'amount': 100,
    'currency': 'USD',
    'description': 'Order #12345',
    'customerEmail': 'customer@example.com',
    'orderId': '12345',
    'successUrl': 'https://yoursite.com/success',
    'webhookUrl': 'https://yoursite.com/webhook'
}

response = requests.post(api_url, headers=headers, json=data)
result = response.json()

if result.get('success'):
    # Redirect to payment page
    payment_url = result['paymentUrl']
    print(f'Redirect customer to: {payment_url}')
```

## Webhook Events

Configure a webhook URL to receive real-time payment status updates.

### Webhook Payload

When a payment is completed, we'll send a POST request to your webhook URL:

```json
{
  "event": "payment.completed",
  "paymentId": "uuid-payment-id",
  "amount": 100,
  "currency": "USD",
  "orderId": "12345",
  "metadata": {
    "productId": "prod_123"
  },
  "timestamp": "2024-01-01T00:05:00.000Z"
}
```

### Webhook Handler Example

```javascript
// Express.js webhook handler
app.post('/webhook', express.json(), (req, res) => {
  const { event, paymentId, amount, currency, orderId } = req.body;
  
  if (event === 'payment.completed') {
    // Update your database
    console.log(`Payment ${paymentId} completed: ${amount} ${currency}`);
    
    // Process order
    fulfillOrder(orderId);
  }
  
  // Respond with 200 to acknowledge receipt
  res.status(200).send('OK');
});
```

## Testing

### Test Cards

Use these test card details on the payment page:

| Card Number | CVV | Expiry | Result |
|-------------|-----|--------|--------|
| Any active card in your account | Valid CVV | Valid date | Success |

### Test Flow

1. Create a test API key in the developer dashboard
2. Use the integration example HTML file or your own test page
3. Create a payment and complete it using your account's card
4. Check the webhook delivery and payment status

## Fees

**Transaction Fee:** 2.5% per successful payment

Example: For a $100 payment, you'll receive $97.50 (2.5% fee = $2.50)

## Supported Currencies

- USD - US Dollar
- EUR - Euro
- GBP - British Pound
- CHF - Swiss Franc
- JPY - Japanese Yen
- CAD - Canadian Dollar
- AUD - Australian Dollar

## Rate Limits

- 100 requests per minute per API key
- 1000 requests per hour per API key

## Security

### Best Practices

1. **Never expose your API key** in client-side code
2. **Use HTTPS** for all API requests
3. **Verify webhook signatures** (coming soon)
4. **Store API keys** in environment variables
5. **Rotate API keys** regularly

### Domain Whitelisting

Add your domain to your API key for additional security. We'll only accept requests from whitelisted domains.

## Error Handling

### Error Response Format

```json
{
  "error": "Error message here"
}
```

### Common HTTP Status Codes

- `200 OK`: Request successful
- `201 Created`: Payment created successfully
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Invalid or missing API key
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

### Common Errors

| Error Message | Cause | Solution |
|--------------|-------|----------|
| "API key is required" | Missing X-API-Key header | Add API key to header |
| "Invalid or inactive API key" | Wrong or deactivated key | Check your API key |
| "Missing required fields" | Missing required parameters | Check request body |
| "Amount must be greater than 0" | Invalid amount | Use positive amount |
| "Invalid currency" | Unsupported currency | Use supported currency |
| "Insufficient balance" | Customer has insufficient funds | Customer needs to top up |

## FAQ

### Q: Can I process refunds?
A: Refund functionality is coming soon. Contact support for manual refunds.

### Q: How long does it take to receive payments?
A: Payments are instant and credited to your balance immediately (minus fees).

### Q: Can I customize the payment page?
A: Custom branding is coming soon. Currently, the payment page uses our standard design.

### Q: What about PCI compliance?
A: We handle all card data securely. You never touch sensitive card information.

### Q: Can I test without real money?
A: Yes! This is a demo application. All money is fake for testing purposes.

## Changelog

### Version 1.0.0 (2024-01-01)
- Initial release
- Payment creation
- Payment status checking
- Webhook notifications
- Multi-currency support
- CORS support for external websites
