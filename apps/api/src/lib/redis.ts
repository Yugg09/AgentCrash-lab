import { Redis, type RedisOptions } from "ioredis";

/** BullMQ + Upstash/Render: TLS for rediss:// and dual-stack DNS. */
export function createRedisConnection() {
  const url = process.env.REDIS_URL ?? "redis://localhost:6379";
  const options: RedisOptions = {
    maxRetriesPerRequest: null,
    family: 0,
    ...(url.startsWith("rediss://") ? { tls: {} } : {}),
  };
  const client = new Redis(url, options);
  client.on("error", (err) => {
    console.error("[redis] connection error:", err.message);
  });
  return client;
}
