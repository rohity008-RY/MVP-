import { Redis } from "ioredis";
import { config } from "./config.js";
import { ApiError } from "./http.js";

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

interface RateLimitResult {
  allowed: boolean;
  count: number;
  remaining: number;
  retryAfterMs: number;
  store: "redis" | "memory";
}

interface RateLimitStoreHealth {
  ok: boolean;
  store: "redis" | "memory";
  mode: "redis-tcp" | "upstash-rest" | "memory";
  latencyMs?: number;
  error?: string;
}

const memoryBuckets = new Map<string, RateLimitBucket>();
let redis: Redis | undefined;

type UpstashResponse<T> = {
  result?: T;
  error?: string;
};

function getRedis() {
  if (!config.redisUrl) return undefined;
  if (!redis) {
    redis = new Redis(config.redisUrl, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false
    });
    redis.on("error", (error: Error) => {
      if (!config.isProduction) console.error("Redis rate-limit error", error);
    });
  }
  return redis;
}

function memoryIncrement(key: string, max: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const bucket = memoryBuckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    memoryBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, count: 1, remaining: max - 1, retryAfterMs: windowMs, store: "memory" };
  }

  bucket.count += 1;
  return {
    allowed: bucket.count <= max,
    count: bucket.count,
    remaining: Math.max(max - bucket.count, 0),
    retryAfterMs: Math.max(bucket.resetAt - now, 0),
    store: "memory"
  };
}

async function upstashRestCommand<T>(command: Array<string | number>): Promise<T> {
  const response = await fetch(config.upstashRedisRestUrl, {
    method: "POST",
    headers: {
      authorization: `Bearer ${config.upstashRedisRestToken}`,
      "content-type": "application/json"
    },
    body: JSON.stringify(command)
  });

  const payload = (await response.json().catch(() => ({}))) as UpstashResponse<T>;
  if (!response.ok || payload.error) {
    throw new Error(payload.error || `Upstash Redis REST command failed with ${response.status}`);
  }
  return payload.result as T;
}

async function upstashRestIncrement(key: string, max: number, windowMs: number): Promise<RateLimitResult> {
  const count = Number(await upstashRestCommand<number>(["INCR", key]));
  if (count === 1) await upstashRestCommand<number>(["PEXPIRE", key, windowMs]);
  const ttl = Number(await upstashRestCommand<number>(["PTTL", key]));
  return {
    allowed: count <= max,
    count,
    remaining: Math.max(max - count, 0),
    retryAfterMs: ttl > 0 ? ttl : windowMs,
    store: "redis"
  };
}

export async function incrementRateLimit(key: string, max: number, windowMs: number): Promise<RateLimitResult> {
  const redisClient = getRedis();
  if (!redisClient && !(config.upstashRedisRestUrl && config.upstashRedisRestToken)) return memoryIncrement(key, max, windowMs);

  try {
    if (!redisClient) return await upstashRestIncrement(key, max, windowMs);
    if (redisClient.status === "wait") await redisClient.connect();
    const count = await redisClient.incr(key);
    if (count === 1) await redisClient.pexpire(key, windowMs);
    const ttl = await redisClient.pttl(key);
    return {
      allowed: count <= max,
      count,
      remaining: Math.max(max - count, 0),
      retryAfterMs: ttl > 0 ? ttl : windowMs,
      store: "redis"
    };
  } catch (error) {
    if (config.isProduction) {
      throw new ApiError(503, "Rate limit store is unavailable.", "RATE_LIMIT_STORE_UNAVAILABLE");
    }
    return memoryIncrement(key, max, windowMs);
  }
}

function sanitizeHealthError(error: unknown) {
  return error instanceof Error ? error.message : "Rate limit store check failed.";
}

export async function pingRateLimitStore(): Promise<RateLimitStoreHealth> {
  const startedAt = Date.now();
  const redisClient = getRedis();

  if (!redisClient && !(config.upstashRedisRestUrl && config.upstashRedisRestToken)) {
    return {
      ok: !config.isProduction,
      store: "memory",
      mode: "memory",
      latencyMs: Date.now() - startedAt,
      error: config.isProduction ? "Redis is not configured." : undefined
    };
  }

  try {
    if (!redisClient) {
      await upstashRestCommand<string>(["PING"]);
      return {
        ok: true,
        store: "redis",
        mode: "upstash-rest",
        latencyMs: Date.now() - startedAt
      };
    }

    if (redisClient.status === "wait") await redisClient.connect();
    await redisClient.ping();
    return {
      ok: true,
      store: "redis",
      mode: "redis-tcp",
      latencyMs: Date.now() - startedAt
    };
  } catch (error) {
    return {
      ok: false,
      store: redisClient || config.upstashRedisRestUrl ? "redis" : "memory",
      mode: redisClient ? "redis-tcp" : config.upstashRedisRestUrl ? "upstash-rest" : "memory",
      latencyMs: Date.now() - startedAt,
      error: sanitizeHealthError(error)
    };
  }
}

export function closeRateLimitStore() {
  if (!redis) return;
  redis.disconnect();
  redis = undefined;
}
