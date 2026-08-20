import { Redis, type RedisOptions } from "ioredis";

function redisNeedsTls(url: string) {
  if (url.startsWith("rediss://")) return true;
  try {
    return new URL(url).hostname.endsWith(".upstash.io");
  } catch {
    return false;
  }
}

/** BullMQ + Upstash/Render: TLS for Upstash hosts and dual-stack DNS. */
export function createRedisConnection() {
  const url = process.env.REDIS_URL ?? "redis://localhost:6379";
  const options: RedisOptions = {
    maxRetriesPerRequest: null,
    family: 0,
    ...(redisNeedsTls(url) ? { tls: {} } : {}),
  };
  const client = new Redis(url, options);
  client.on("error", (err) => {
    console.error("[redis] connection error:", err.message);
  });
  return client;
}
