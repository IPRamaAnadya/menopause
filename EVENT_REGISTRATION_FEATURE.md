# Event Registration Feature - Payment Flow

This document describes the event registration feature with integrated payment processing.

## Overview

The event registration system allows users to register for events with automatic payment handling. It supports both free and paid events, with email notifications and Stripe payment integration.

## Flow Diagram

```
User Registration Request
        ↓
Validation (Event, Capacity, Quota, Duplicates)
        ↓
    Is Free Event? ───Yes──→ Create Registration (PAID)
        │                    Create Order (ADMIN, PAID)
        No                   Send Confirmation Email
        ↓                    Return Success
Create Registration (PENDING)
Create Order (STRIPE, PENDING)
Create Stripe Checkout Session
Return Session URL
        ↓
User Completes Payment
        ↓
Stripe Webhook → Server
        ↓
Update Payment → SUCCEEDED
Update Order → PAID
Update Registration → PAID
Send Confirmation Email
```

## Key Components

### 1. Database Schema

#### event_registrations Table
- `id`: Primary key
- `public_id`: UUID for public reference
- `event_id`: Reference to events table
- `user_id`: Reference to users (null for guests)
- `membership_level_id`: Membership level (null for public)
- `price`: Registration price (Decimal 10,2)
- `status`: PENDING | PAID | CANCELLED | ATTENDED
- `registered_at`: Registration timestamp
- `updated_at`: Last update timestamp

### 2. Repository Layer

**File**: `src/features/event/repositories/event-registration.repository.ts`

Methods:
- `create()`: Create new registration
- `findById()`: Get by ID
- `findByPublicId()`: Get by public UUID
- `updateStatus()`: Update registration status
- `findByEventId()`: Get all registrations for event
- `findByUserId()`: Get all registrations for user
- `existsByUserAndEvent()`: Check duplicate registration
- `countByEventId()`: Count total registrations
- `countByEventAndMembershipLevel()`: Count by pricing tier

### 3. Service Layer

**File**: `src/features/event/services/event-registration.service.ts`

Key Methods:

#### `validateRegistration(data)`
Validates event availability, capacity, quota, and prevents duplicates.
Returns event, price rule, and calculated price.

#### `createRegistration(data)`
Creates registration record with specified status (PENDING or PAID).

#### `registerEvent(data)`
Main registration method that validates and creates PENDING registration.

#### `processEventPayment(registrationId)`
Called by webhook after successful payment:
1. Updates registration status to PAID
2. Sends confirmation email

#### `sendRegistrationConfirmationEmail(registration)`
Sends confirmation email with event details and meeting link.

### 4. API Endpoint

**File**: `src/app/api/member/events/checkout/route.ts`

**Endpoint**: `POST /api/member/events/checkout`

**Request Body**:
```json
{
  "event_id": 123,
  "membership_level_id": 1, // Optional
  "guest": { // Optional for guest registration
    "full_name": "John Doe",
    "email": "john@example.com",
    "phone": "+852 1234 5678"
  }
}
```

**Response (Paid Event)**:
```json
{
  "success": true,
  "data": {
    "sessionId": "cs_xxx",
    "url": "https://checkout.stripe.com/xxx",
    "orderId": 123,
    "registrationId": 456,
    "registrationPublicId": "uuid"
  }
}
```

**Response (Free Event)**:
```json
{
  "success": true,
  "data": {
    "registrationId": 456,
    "registrationPublicId": "uuid",
    "orderId": 123,
    "free": true,
    "redirectUrl": "/member/events/registration/success?free=true"
  }
}
```

### 5. Webhook Integration

**File**: `src/features/orders/services/order.service.ts`

The webhook handler (`handleCheckoutSessionCompleted`) checks order metadata:

```typescript
{
  "event_id": "123",
  "registration_id": "456",
  "registration_public_id": "uuid"
}
```

When `registration_id` is present:
1. Calls `processEventRegistration()`
2. Updates registration to PAID
3. Sends confirmation email

### 6. Email Templates

**File**: `src/features/email/templates/event-email-templates.ts`

Templates available:
- `registrationConfirmation()`: Sent when registration is paid
- `eventReminder()`: Reminder before event starts
- `eventCancellation()`: When event is cancelled
- `eventUpdate()`: When event details change
- `paymentPendingReminder()`: Reminder to complete payment

## Payment Flow Details

### Free Event Flow

1. User submits registration
2. System validates registration
3. Detects price = 0
4. Creates registration with status PAID
5. Creates order with ADMIN provider, status PAID
6. Sends confirmation email immediately
7. Returns success (no Stripe session)

### Paid Event Flow

1. User submits registration
2. System validates registration
3. Creates registration with status PENDING
4. Creates order with STRIPE provider
5. Creates Stripe checkout session with metadata
6. Returns session URL to frontend
7. User completes payment
8. Stripe webhook received
9. System updates payment → SUCCEEDED
10. System updates order → PAID
11. System updates registration → PAID
12. System sends confirmation email

## Validation Rules

1. **Event Must Be Published**: `status === 'PUBLISHED'`
2. **Event Must Be Public**: `is_public === true`
3. **Capacity Check**: Total registrations < event.capacity (if set)
4. **Quota Check**: Registrations per pricing tier < priceRule.quota (if set)
5. **Duplicate Prevention**: User can only register once per event
6. **Price Rule Must Be Active**: `priceRule.is_active === true`

## Error Handling

Common errors:
- "Event not found" (404)
- "Event is not public" (400)
- "Event is not available" (400)
- "Event is full" (400)
- "Quota exceeded" (400)
- "User already registered" (400)
- "Invalid pricing" (400)

## Usage Examples

### Frontend Registration Call

```typescript
// Paid event registration
const response = await fetch('/api/member/events/checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    event_id: 123,
    membership_level_id: 1
  })
});

const result = await response.json();

if (result.data.free) {
  // Free event - redirect to success page
  window.location.href = result.data.redirectUrl;
} else {
  // Paid event - redirect to Stripe checkout
  window.location.href = result.data.url;
}
```

### Admin: Get Event Registrations

```typescript
const registrations = await EventRegistrationService.getRegistrationsByEvent(eventId);
```

### Admin: Update Registration Status

```typescript
await EventRegistrationService.updateRegistrationStatus(
  registrationId,
  EventRegistrationStatus.ATTENDED
);
```

## Environment Variables

Required:
- `STRIPE_SECRET_KEY`: Stripe secret key
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook signing secret
- `EMAIL_FROM`: Default email sender address
- `NEXT_PUBLIC_APP_URL`: Application base URL

## Testing

### Test Free Event
1. Create event with price = 0
2. Register for event
3. Verify registration status = PAID immediately
4. Check confirmation email sent

### Test Paid Event
1. Create event with price > 0
2. Register for event
3. Verify registration status = PENDING
4. Complete Stripe checkout
5. Verify webhook updates status to PAID
6. Check confirmation email sent

### Test Validations
- Try registering twice (should fail)
- Fill event to capacity (next registration should fail)
- Try registering for unpublished event (should fail)

## Future Enhancements

1. **Waitlist**: Allow users to join waitlist when event is full
2. **Refund Support**: Handle event cancellations with automatic refunds
3. **Group Registration**: Register multiple people in one transaction
4. **Event Check-in**: QR code for event attendance tracking
5. **Reminder Automation**: Scheduled reminders before events
6. **Calendar Integration**: Generate .ics files for calendar apps

## Related Files

- Schema: `prisma/schema.prisma`
- Repository: `src/features/event/repositories/event-registration.repository.ts`
- Service: `src/features/event/services/event-registration.service.ts`
- API: `src/app/api/member/events/checkout/route.ts`
- Webhook: `src/features/orders/services/order.service.ts`
- Email Templates: `src/features/email/templates/event-email-templates.ts`
