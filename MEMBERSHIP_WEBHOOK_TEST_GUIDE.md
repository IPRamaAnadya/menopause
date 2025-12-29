# Membership Webhook Testing Guide

## What Was Fixed

### 1. **EXTEND Operation**
- Now works with ACTIVE or EXPIRED memberships
- Automatically reactivates EXPIRED memberships
- Adds comprehensive logging

### 2. **UPGRADE/DOWNGRADE Operations**
- Looks for ACTIVE or EXPIRED memberships (not just ACTIVE)
- Creates NEW membership record
- Sets old membership status to STOPPED
- Uses database transaction for atomicity

### 3. **NEW Operation**
- Creates first membership for user
- Validates no active membership exists

### 4. **Comprehensive Logging**
All operations now log:
- Start of operation
- Input parameters
- Database queries
- Success/failure status
- Error details with stack traces

## Test Scenarios

### Test 1: New Membership (NEW)
**Steps:**
1. User with NO membership purchases a plan
2. Payment succeeds via Stripe
3. Webhook triggers

**Expected Logs:**
```
[processWebhook] Event type: checkout.session.completed
[handleCheckoutSessionCompleted] Order details: { orderId: X, userId: Y, metadata: {...} }
[processMembershipChange] Starting for user Y, level Z, operation: NEW
[createMembership] Starting for user Y
[createMembership] Creating membership with: {...}
[createMembership] Membership created successfully: ID
```

**Expected Result:**
- New membership created with status ACTIVE
- User can access member features

### Test 2: Extend Membership (EXTEND)
**Steps:**
1. User with ACTIVE membership extends same level
2. Payment succeeds
3. Webhook triggers

**Expected Logs:**
```
[processMembershipChange] Starting for user Y, level Z, operation: EXTEND
[extendMembership] Starting for user Y level Z
[extendMembership] Found membership: { id: X, status: ACTIVE, currentEndDate: ... }
[extendMembership] Extending membership: { oldEndDate: ..., newEndDate: ..., daysAdded: 30 }
[extendMembership] Membership extended successfully
```

**Expected Result:**
- Same membership record updated
- end_date increased by duration_days
- Status remains ACTIVE

### Test 3: Upgrade Membership (UPGRADE)
**Steps:**
1. User with lower-tier membership upgrades to higher tier
2. Payment succeeds
3. Webhook triggers

**Expected Logs:**
```
[processMembershipChange] Starting for user Y, level Z, operation: UPGRADE
[changeMembershipLevel] Starting transaction for user Y
[changeMembershipLevel] Old membership: { id: X, status: ACTIVE, level: Basic }
[changeMembershipLevel] Setting old membership to STOPPED
[changeMembershipLevel] Creating new membership: { userId: Y, levelId: Z, ... }
[changeMembershipLevel] New membership created: { id: NEW_ID, status: ACTIVE, level: Premium }
[changeMembershipLevel] Transaction completed successfully
```

**Expected Result:**
- Old membership status changed to STOPPED
- NEW membership created with status ACTIVE
- New membership has higher priority level

### Test 4: Downgrade Membership (DOWNGRADE)
**Steps:**
1. User with higher-tier membership downgrades to lower tier
2. Payment succeeds
3. Webhook triggers

**Expected Logs:**
```
[processMembershipChange] Starting for user Y, level Z, operation: DOWNGRADE
[changeMembershipLevel] Starting transaction for user Y
[changeMembershipLevel] Old membership: { id: X, status: ACTIVE, level: Premium }
[changeMembershipLevel] Setting old membership to STOPPED
[changeMembershipLevel] Creating new membership: { userId: Y, levelId: Z, ... }
[changeMembershipLevel] New membership created: { id: NEW_ID, status: ACTIVE, level: Basic }
[changeMembershipLevel] Transaction completed successfully
```

**Expected Result:**
- Old membership status changed to STOPPED
- NEW membership created with status ACTIVE
- New membership has lower priority level

## How to Monitor

### Terminal Output
Watch the terminal where `npm run dev` is running. Look for:
```
========================================
[processWebhook] Starting webhook processing
[processWebhook] Provider: STRIPE
========================================
[processWebhook] Event type: checkout.session.completed
```

### Database Check
After each test, verify in Prisma Studio:
```bash
npx prisma studio
```

Check:
1. `memberships` table - verify status and dates
2. `orders` table - verify order status is PAID
3. `payments` table - verify payment status is SUCCEEDED

## Common Issues & Solutions

### Issue: "No membership found to extend"
**Cause:** User has no ACTIVE or EXPIRED membership
**Solution:** Check membership status in database

### Issue: "User already has an active membership"
**Cause:** Trying to create NEW membership when one exists
**Solution:** Use EXTEND, UPGRADE, or DOWNGRADE instead

### Issue: "No active membership found to change"
**Cause:** Old code that only looked for ACTIVE status
**Solution:** Already fixed - now checks ACTIVE and EXPIRED

### Issue: Webhook not triggering
**Cause:** 
- Stripe webhook not configured
- ngrok tunnel expired
- Wrong webhook secret

**Solution:**
1. Check ngrok is running: `ngrok http localhost:3000`
2. Update Stripe webhook endpoint with ngrok URL
3. Verify STRIPE_WEBHOOK_SECRET in .env

## Testing Checklist

- [ ] NEW membership creation works
- [ ] EXTEND adds duration correctly
- [ ] UPGRADE creates new membership and stops old one
- [ ] DOWNGRADE creates new membership and stops old one
- [ ] All operations log comprehensively
- [ ] Errors are caught and logged with details
- [ ] Database transactions are atomic
- [ ] Payment status updates correctly
- [ ] Order status updates correctly
