# Orders & Payments Feature

A flexible and provider-agnostic order and payment system with easy payment provider switching.

## Architecture

### Structure
```
src/features/orders/
├── types/                      # TypeScript types and interfaces
├── payment-providers/          # Payment provider implementations
│   ├── interface.ts           # Payment provider interface
│   ├── stripe.ts              # Stripe implementation
│   └── factory.ts             # Provider factory
├── repositories/               # Database operations
│   ├── order.repository.ts    # Order CRUD
│   └── payment.repository.ts  # Payment CRUD
└── services/                   # Business logic
    └── order.service.ts       # Order service
```

### Payment Provider Interface

The system uses an interface pattern to support multiple payment providers:

```typescript
interface IPaymentProvider {
  createPaymentIntent()
  processWebhook()
  confirmPayment()
  refundPayment()
  getPaymentDetails()
}
```

**Currently Supported:**
- ✅ Stripe

**Easy to Add:**
- Midtrans
- Xendit
- PayPal
- etc.

## API Endpoints

### Create Order
```http
POST /api/orders/create
Authorization: Bearer {token}

{
  "type": "SUBSCRIPTION",
  "grossAmount": 99.00,
  "currency": "USD",
  "breakdown": {
    "base": 90.00,
    "admin_fee": 5.00,
    "tax": 4.00
  },
  "referenceId": 1,
  "referenceType": "membership_level",
  "expiresInMinutes": 30,
  "paymentProvider": "STRIPE"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": 1,
      "publicId": "uuid",
      "orderNumber": "ORD-202512-0001",
      "status": "PENDING",
      "grossAmount": 99.00,
      "currency": "USD",
      "expiresAt": "2025-12-29T23:30:00Z"
    },
    "payment": {
      "id": 1,
      "publicId": "uuid",
      "provider": "STRIPE",
      "clientSecret": "pi_xxx_secret_xxx"
    }
  }
}
```

### Get Order Details
```http
GET /api/orders/{publicId}
Authorization: Bearer {token}
```

### Get User Orders
```http
GET /api/orders/my-orders?status=PAID&limit=10&offset=0
Authorization: Bearer {token}
```

### Cancel Order
```http
POST /api/orders/{publicId}/cancel
Authorization: Bearer {token}
```

### Refund Order
```http
POST /api/orders/{publicId}/refund
Authorization: Bearer {token}

{
  "reason": "Customer request"
}
```

### Webhook (Stripe)
```http
POST /api/orders/webhooks/stripe
stripe-signature: {signature}
```

## Usage Examples

### 1. Create Subscription Order

```typescript
const response = await fetch('/api/orders/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    type: 'SUBSCRIPTION',
    grossAmount: 99.00,
    currency: 'USD',
    breakdown: {
      base: 90.00,
      admin_fee: 5.00,
      tax: 4.00,
    },
    referenceId: membershipLevelId,
    referenceType: 'membership_level',
    expiresInMinutes: 30,
  }),
});

const { data } = await response.json();

// Use data.payment.clientSecret with Stripe Elements
```

### 2. Frontend Integration with Stripe

```typescript
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

// After creating order
const stripe = await stripePromise;
const { error } = await stripe!.confirmPayment({
  clientSecret: data.payment.clientSecret,
  confirmParams: {
    return_url: `${window.location.origin}/orders/${data.order.publicId}`,
  },
});
```

## Adding New Payment Provider

### Step 1: Create Provider Implementation

```typescript
// src/features/orders/payment-providers/midtrans.ts
import { PaymentProvider, PaymentStatus } from '@/generated/prisma';
import { IPaymentProvider } from './interface';

export class MidtransPaymentProvider implements IPaymentProvider {
  readonly provider = PaymentProvider.MIDTRANS;

  async createPaymentIntent(params) {
    // Implement Midtrans payment creation
  }

  async processWebhook(payload, signature) {
    // Implement Midtrans webhook handling
  }

  async confirmPayment(transactionId) {
    // Implement Midtrans payment confirmation
  }

  async refundPayment(params) {
    // Implement Midtrans refund
  }

  async getPaymentDetails(transactionId) {
    // Implement Midtrans payment details
  }
}
```

### Step 2: Register in Factory

```typescript
// src/features/orders/payment-providers/factory.ts
import { MidtransPaymentProvider } from './midtrans';

export class PaymentProviderFactory {
  constructor() {
    this.providers = new Map();
    this.providers.set(PaymentProvider.STRIPE, new StripePaymentProvider());
    this.providers.set(PaymentProvider.MIDTRANS, new MidtransPaymentProvider());
  }
}
```

### Step 3: Add Webhook Route

```typescript
// src/app/api/orders/webhooks/midtrans/route.ts
export async function POST(req: NextRequest) {
  const result = await orderService.processWebhook(
    PaymentProvider.MIDTRANS,
    body,
    signature
  );
  return apiResponse.success(result);
}
```

## Stripe Configuration

### 1. Get Webhook Secret

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/webhooks)
2. Click "Add endpoint"
3. URL: `https://yourdomain.com/api/orders/webhooks/stripe`
4. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
5. Copy the webhook signing secret
6. Add to `.env`: `STRIPE_WEBHOOK_SECRET=whsec_xxx`

### 2. Test Locally with Stripe CLI

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local
stripe listen --forward-to localhost:3000/api/orders/webhooks/stripe

# Test webhook
stripe trigger payment_intent.succeeded
```

## Database Schema

### Orders Table
- `id` - Primary key
- `public_id` - UUID for client display
- `order_number` - Human-readable (ORD-202512-0001)
- `type` - SUBSCRIPTION | EVENT | PRODUCT
- `status` - PENDING | PAID | FAILED | REFUNDED | CANCELLED
- `gross_amount` - Total amount
- `currency` - ISO 4217 (USD, IDR, etc.)
- `breakdown` - JSON (base, admin_fee, tax, discount)
- `reference_id/type` - Link to membership/event/product
- `expires_at` - Auto-cancel pending orders
- `paid_at` - Payment timestamp

### Payments Table
- `id` - Primary key
- `public_id` - UUID for client display
- `order_id` - Foreign key
- `provider` - STRIPE | MIDTRANS | XENDIT
- `status` - PENDING | PROCESSING | SUCCEEDED | FAILED | CANCELLED
- `amount` - Payment amount
- `fee_amount` - Processing fee
- `net_amount` - Net received
- `provider_ref` - payment_intent_id / transaction_id
- `provider_payload` - Raw webhook data
- `payment_method` - credit_card, bank_transfer, etc.

## Features

✅ Multi-provider support with easy switching
✅ Automatic order number generation
✅ Order expiration handling
✅ Payment confirmation & verification
✅ Refund support
✅ Webhook processing
✅ Fee and net amount tracking
✅ Comprehensive audit trail

## Security Notes

1. **Never expose secret keys** - Only `NEXT_PUBLIC_*` keys go to client
2. **Verify webhook signatures** - All providers implement signature verification
3. **Validate amounts** - Always verify amounts match before processing
4. **Use HTTPS** - Required for webhooks in production
5. **Implement rate limiting** - Protect webhook endpoints

## Next Steps

1. Add cron job to auto-expire pending orders
2. Implement email notifications for order status
3. Add admin dashboard for order management
4. Implement invoice generation
5. Add support for multiple items per order
6. Implement discount/promo codes
