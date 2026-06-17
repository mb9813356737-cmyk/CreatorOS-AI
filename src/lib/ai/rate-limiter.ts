// ─── Token Bucket Rate Limiter ──────────────────────────────
// In-memory rate limiter for API routes
// For production at scale, replace with Redis (Upstash) implementation

interface RateLimitEntry {
  tokens: number;
  lastRefill: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup stale entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;

  const staleThreshold = now - 10 * 60 * 1000; // 10 min
  for (const [key, entry] of store.entries()) {
    if (entry.lastRefill < staleThreshold) {
      store.delete(key);
    }
  }
  lastCleanup = now;
}

export interface RateLimitConfig {
  maxRequests: number; // Max tokens in bucket
  windowMs: number;    // Refill window in ms
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number; // Unix timestamp ms
}

export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const now = Date.now();
  const key = `rl:${identifier}`;

  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (upstashUrl && upstashToken) {
    try {
      const windowSeconds = Math.max(1, Math.floor(config.windowMs / 1000));
      const currentMinute = Math.floor(now / config.windowMs);
      const redisKey = `${key}:${currentMinute}`;

      // Query Upstash REST pipeline (INCR + EXPIRE)
      const res = await fetch(`${upstashUrl}/pipeline`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${upstashToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          ["INCR", redisKey],
          ["EXPIRE", redisKey, windowSeconds],
        ]),
      });

      if (res.ok) {
        const data = await res.json();
        const count = data[0]?.result ?? 0;
        const allowed = count <= config.maxRequests;
        const remaining = Math.max(0, config.maxRequests - count);
        const resetAt = (currentMinute + 1) * config.windowMs;

        return {
          allowed,
          remaining,
          resetAt,
        };
      }
    } catch (err) {
      console.warn("Upstash Redis connection issue. Falling back to in-memory rate limiter:", err);
    }
  }

  // Fallback to in-memory Token Bucket
  cleanup();

  let entry = store.get(key);

  if (!entry) {
    entry = { tokens: config.maxRequests, lastRefill: now };
    store.set(key, entry);
  }

  // Refill tokens based on elapsed time
  const elapsed = now - entry.lastRefill;
  const refillRate = config.maxRequests / config.windowMs;
  const newTokens = Math.min(
    config.maxRequests,
    entry.tokens + elapsed * refillRate
  );
  entry.tokens = newTokens;
  entry.lastRefill = now;

  if (entry.tokens < 1) {
    const resetAt = now + (1 - entry.tokens) / refillRate;
    return {
      allowed: false,
      remaining: 0,
      resetAt,
    };
  }

  entry.tokens -= 1;
  store.set(key, entry);

  return {
    allowed: true,
    remaining: Math.floor(entry.tokens),
    resetAt: now + config.windowMs,
  };
}
