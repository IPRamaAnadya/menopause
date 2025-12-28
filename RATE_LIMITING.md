# Rate Limiting

This project implements server-side rate limiting to prevent abuse and ensure fair usage of the review system.

## Overview

Rate limiting is applied to protect the review endpoints from:
- Spam submissions
- Brute force attacks
- Resource exhaustion
- Abuse of the system

## Implementation

The rate limiting system is implemented using an in-memory store with the following components:

### Core Module
- **Location**: `/src/lib/rate-limit.ts`
- **Type**: In-memory rate limiter (suitable for single-instance deployments)
- **Features**:
  - Sliding window rate limiting
  - User-based and IP-based identification
  - Automatic cleanup of expired entries
  - Configurable limits per action

### Protected Endpoints

| Endpoint | Method | Limit | Window | Description |
|----------|--------|-------|--------|-------------|
| `/api/articles/[id]/reviews` | POST | 3 requests | 5 minutes | Creating reviews |
| `/api/articles/[id]/reviews` | POST | 5 requests | 5 minutes | Creating replies (with parent_id) |
| `/api/reviews/[id]` | PUT | 5 requests | 1 hour | Updating reviews |
| `/api/reviews/[id]` | DELETE | 5 requests | 1 hour | Deleting reviews |

## Configuration

Rate limits are defined in `/src/lib/rate-limit.ts`:

```typescript
export const RATE_LIMITS = {
  CREATE_REVIEW: {
    maxRequests: 3,
    windowMs: 5 * 60 * 1000, // 5 minutes
  },
  CREATE_REPLY: {
    maxRequests: 5,
    windowMs: 5 * 60 * 1000, // 5 minutes
  },
  UPDATE_REVIEW: {
    maxRequests: 5,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  DELETE_REVIEW: {
    maxRequests: 5,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
};
```

### Customizing Limits

To change rate limits, modify the values in `RATE_LIMITS`:

```typescript
// Example: Allow 10 reviews per 10 minutes
CREATE_REVIEW: {
  maxRequests: 10,
  windowMs: 10 * 60 * 1000,
}
```

## Client Identification

The system identifies clients using:

1. **Authenticated users**: User ID from session
   - Format: `user:{userId}`
   - More accurate and persistent

2. **Anonymous users**: IP address from request headers
   - Format: `ip:{ipAddress}`
   - Checks `X-Forwarded-For` and `X-Real-IP` headers
   - Works with reverse proxies

## Error Response

When rate limit is exceeded, the API returns:

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many reviews. Please try again in 3 minutes."
  },
  "meta": {
    "timestamp": "2025-12-28T..."
  }
}
```

Response headers include:
- `Status: 429 Too Many Requests`
- `Retry-After: {seconds}` - Time to wait before retrying

## Client-Side Handling

The client-side hooks (`useReviewActions`) automatically:
1. Display error toast with the rate limit message
2. Show time remaining before retry
3. Prevent further submissions during cooldown

## Production Considerations

### Current Implementation (In-Memory)

**Pros:**
- Simple and fast
- No external dependencies
- Good for single-instance deployments

**Cons:**
- Not shared across multiple server instances
- Lost on server restart
- Not suitable for horizontal scaling

### Recommended for Production

For production environments with multiple instances, consider:

1. **Redis-based rate limiting**
   ```bash
   npm install ioredis
   ```
   - Shared across all instances
   - Persistent across restarts
   - Better performance at scale

2. **Third-party services**
   - Upstash Rate Limiting
   - Cloudflare Rate Limiting
   - AWS API Gateway throttling

### Example Redis Implementation

```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export async function checkRateLimitRedis(config: RateLimitConfig) {
  const key = `ratelimit:${config.identifier}:${config.action}`;
  const now = Date.now();
  
  // Use Redis sorted set for sliding window
  await redis
    .multi()
    .zremrangebyscore(key, 0, now - config.windowMs)
    .zadd(key, now, now)
    .zcount(key, now - config.windowMs, now)
    .expire(key, Math.ceil(config.windowMs / 1000))
    .exec();
    
  // Check count and return result
  // ...
}
```

## Monitoring

To monitor rate limiting:

1. **Add logging** in rate-limit.ts:
   ```typescript
   if (!rateLimitResult.allowed) {
     console.warn('[Rate Limit]', {
       identifier: config.identifier,
       action: config.action,
       limit: config.maxRequests,
     });
   }
   ```

2. **Track metrics**:
   - Number of rate limit hits
   - Most limited users/IPs
   - Peak usage times

3. **Alerting**:
   - Set up alerts for unusual patterns
   - Monitor for potential attacks

## Testing

### Testing Rate Limits

```typescript
// Test rate limit enforcement
describe('Review Rate Limiting', () => {
  it('should allow 3 reviews in 5 minutes', async () => {
    // Create 3 reviews - should succeed
    // Create 4th review - should fail with 429
  });
  
  it('should reset after time window', async () => {
    // Create 3 reviews
    // Wait 5 minutes
    // Create another review - should succeed
  });
});
```

### Manual Testing

Use the same authenticated user to:
1. POST 3 reviews within 5 minutes
2. Try 4th review - should receive 429 error
3. Wait 5 minutes
4. Try again - should succeed

## Security Notes

1. **Do not disable rate limiting** in production
2. **Monitor for bypass attempts** (changing IPs, multiple accounts)
3. **Adjust limits** based on legitimate usage patterns
4. **Log rate limit violations** for security analysis
5. **Consider CAPTCHA** for additional protection if needed

## Future Enhancements

- [ ] Add configurable rate limits per user role
- [ ] Implement exponential backoff for repeated violations
- [ ] Add dashboard for viewing rate limit metrics
- [ ] Support for temporary limit adjustments
- [ ] Whitelist/blacklist functionality
- [ ] Integration with WAF (Web Application Firewall)
