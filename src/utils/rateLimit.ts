// Rate limiting utility for API routes
// Using Cloudflare Workers KV for persistence in production, in-memory for local dev

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  skipSuccessfulRequests?: boolean; // Don't count successful requests
}

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// In-memory store for development
const memoryStore = new Map<string, RateLimitRecord>();

export class RateLimiter {
  private config: RateLimitConfig;
  private kvNamespace?: any; // Cloudflare KV namespace

  constructor(config: RateLimitConfig, kvNamespace?: any) {
    this.config = config;
    this.kvNamespace = kvNamespace;
  }

  async checkRateLimit(identifier: string): Promise<{
    allowed: boolean;
    limit: number;
    remaining: number;
    resetTime: number;
  }> {
    const now = Date.now();
    const key = `rate_limit:${identifier}`;

    let record: RateLimitRecord;

    try {
      // Try to use KV store if available (production)
      if (this.kvNamespace) {
        const stored = await this.kvNamespace.get(key);
        record = stored ? JSON.parse(stored) : { count: 0, resetTime: now + this.config.windowMs };
      } else {
        // Fallback to memory store (development)
        record = memoryStore.get(key) || { count: 0, resetTime: now + this.config.windowMs };
      }

      // Reset counter if window has expired
      if (now > record.resetTime) {
        record = { count: 0, resetTime: now + this.config.windowMs };
      }

      // Check if request should be allowed
      const allowed = record.count < this.config.maxRequests;
      
      if (allowed) {
        record.count++;
        
        // Store updated record
        if (this.kvNamespace) {
          await this.kvNamespace.put(key, JSON.stringify(record), {
            expirationTtl: Math.ceil(this.config.windowMs / 1000) + 60 // Add 1 minute buffer
          });
        } else {
          memoryStore.set(key, record);
        }
      }

      return {
        allowed,
        limit: this.config.maxRequests,
        remaining: Math.max(0, this.config.maxRequests - record.count),
        resetTime: record.resetTime
      };

    } catch (error) {
      console.error('Rate limiting error:', error);
      // If there's an error with rate limiting, allow the request
      return {
        allowed: true,
        limit: this.config.maxRequests,
        remaining: this.config.maxRequests - 1,
        resetTime: now + this.config.windowMs
      };
    }
  }
}

// Helper to get client IP address
export function getClientIP(request: Request): string {
  // Check Cloudflare headers first
  const cfConnectingIP = request.headers.get('CF-Connecting-IP');
  if (cfConnectingIP) return cfConnectingIP;

  // Check other common headers
  const xForwardedFor = request.headers.get('X-Forwarded-For');
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }

  const xRealIP = request.headers.get('X-Real-IP');
  if (xRealIP) return xRealIP;

  // Fallback - this might not work in all environments
  return 'unknown';
}

// Pre-configured rate limiters for different use cases
export const createSearchRateLimiter = (kvNamespace?: any) => 
  new RateLimiter({ windowMs: 60 * 1000, maxRequests: 30 }, kvNamespace); // 30 requests per minute

export const createTurnstileRateLimiter = (kvNamespace?: any) => 
  new RateLimiter({ windowMs: 60 * 1000, maxRequests: 10 }, kvNamespace); // 10 requests per minute

export const createGeneralRateLimiter = (kvNamespace?: any) => 
  new RateLimiter({ windowMs: 60 * 1000, maxRequests: 100 }, kvNamespace); // 100 requests per minute

// Rate limit response helper
export function createRateLimitResponse(result: Awaited<ReturnType<RateLimiter['checkRateLimit']>>) {
  return new Response(JSON.stringify({
    error: 'Rate limit exceeded',
    message: `Too many requests. Try again in ${Math.ceil((result.resetTime - Date.now()) / 1000)} seconds.`
  }), {
    status: 429,
    headers: {
      'Content-Type': 'application/json',
      'X-RateLimit-Limit': result.limit.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': result.resetTime.toString(),
      'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString()
    }
  });
}
