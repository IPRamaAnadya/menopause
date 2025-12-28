/**
 * Simple in-memory rate limiter
 * For production, consider using Redis or a dedicated rate limiting service
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// Store rate limit data in memory
// Key format: "identifier:action"
const rateLimitMap = new Map<string, RateLimitEntry>();

// Cleanup old entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 10 * 60 * 1000);

export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed in the time window
   */
  maxRequests: number;
  
  /**
   * Time window in milliseconds
   */
  windowMs: number;
  
  /**
   * Unique identifier for this rate limit (e.g., user ID, IP address)
   */
  identifier: string;
  
  /**
   * Action being rate limited (e.g., 'create-review', 'login')
   */
  action: string;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
}

/**
 * Check if a request should be rate limited
 * @param config Rate limit configuration
 * @returns Rate limit result with allowed status and metadata
 */
export function checkRateLimit(config: RateLimitConfig): RateLimitResult {
  const { maxRequests, windowMs, identifier, action } = config;
  const key = `${identifier}:${action}`;
  const now = Date.now();
  
  const entry = rateLimitMap.get(key);
  
  // No existing entry or entry has expired
  if (!entry || now > entry.resetTime) {
    const resetTime = now + windowMs;
    rateLimitMap.set(key, {
      count: 1,
      resetTime,
    });
    
    return {
      allowed: true,
      limit: maxRequests,
      remaining: maxRequests - 1,
      resetTime,
    };
  }
  
  // Entry exists and is still valid
  if (entry.count < maxRequests) {
    entry.count++;
    
    return {
      allowed: true,
      limit: maxRequests,
      remaining: maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  }
  
  // Rate limit exceeded
  return {
    allowed: false,
    limit: maxRequests,
    remaining: 0,
    resetTime: entry.resetTime,
  };
}

/**
 * Helper function to get client identifier from request
 * Uses session user ID if available, falls back to IP address
 */
export function getClientIdentifier(request: Request, userId?: string): string {
  if (userId) {
    return `user:${userId}`;
  }
  
  // Get IP from headers (works with most reverse proxies)
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwardedFor?.split(',')[0] || realIp || 'unknown';
  
  return `ip:${ip}`;
}

/**
 * Common rate limit configurations
 */
export const RATE_LIMITS = {
  // Reviews: 3 reviews per 5 minutes per user
  CREATE_REVIEW: {
    maxRequests: 3,
    windowMs: 5 * 60 * 1000, // 5 minutes
  },
  
  // Reply: 5 replies per 5 minutes per user
  CREATE_REPLY: {
    maxRequests: 5,
    windowMs: 5 * 60 * 1000, // 5 minutes
  },
  
  // Update review: 5 updates per hour per user
  UPDATE_REVIEW: {
    maxRequests: 5,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  
  // Delete review: 5 deletes per hour per user
  DELETE_REVIEW: {
    maxRequests: 5,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
} as const;
