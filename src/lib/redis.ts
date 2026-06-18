import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL;

let redis: Redis | null = null;

export function getRedisClient(): Redis | null {
  if (process.env.NODE_ENV === "test") {
    return null;
  }

  if (!redis) {
    if (!redisUrl) {
      console.warn("[Redis] Warning: REDIS_URL is not set. Rate limiting will be bypassed.");
      return null;
    }

    try {
      redis = new Redis(redisUrl, {
        maxRetriesPerRequest: null,
        // Ensure connection failures don't block the app server from launching
        connectTimeout: 5000, 
      });
      
      redis.on("error", (err) => {
        console.error("[Redis] Unexpected client error:", err.message);
      });
    } catch (e) {
      console.error("[Redis] Initialization failed:", e);
      return null;
    }
  }
  return redis;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Sliding window rate limiter using Redis sorted sets (ZSET).
 * 
 * @param key Unique key for the client/action (e.g. rate_limit:signin:ip:127.0.0.1)
 * @param limit Maximum allowed requests within the time window
 * @param windowSeconds Window size in seconds
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const client = getRedisClient();
  
  if (!client) {
    // Fail-open strategy: if Redis is not configured or offline, allow requests
    // to prevent service outages.
    return { success: true, limit, remaining: 1, reset: 0 };
  }

  try {
    const now = Date.now();
    const clearBefore = now - windowSeconds * 1000;
    
    // Execute atomic operations in a multi transaction
    const transaction = client.multi();
    // 1. Remove old timestamps outside the sliding window
    transaction.zremrangebyscore(key, 0, clearBefore);
    // 2. Add the current timestamp with a unique identifier to prevent duplicates
    transaction.zadd(key, now, `${now}-${Math.random()}`);
    // 3. Count total active elements in the window
    transaction.zcard(key);
    // 4. Update the key's TTL to clean up idle data
    transaction.expire(key, windowSeconds);

    const results = await transaction.exec();
    
    if (!results) {
      throw new Error("Redis multi-transaction returned empty response");
    }

    // Results mapping: [error, result] for each operation in sequence
    // results[2] is the ZCARD result (total count of requests in current window)
    const cardResult = results[2];
    const count = Array.isArray(cardResult) ? (cardResult[1] as number) : Number(cardResult);
    
    const success = count <= limit;
    const remaining = Math.max(0, limit - count);
    const resetTime = Math.ceil((now + windowSeconds * 1000) / 1000);

    return {
      success,
      limit,
      remaining,
      reset: resetTime,
    };
  } catch (err: any) {
    console.error("[RateLimiter] Execution error:", err.message);
    // Fail-open: don't lock users out if Redis has a transient failure
    return { success: true, limit, remaining: 1, reset: 0 };
  }
}
