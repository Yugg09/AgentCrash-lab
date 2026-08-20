import { Redis, type RedisOptions } from "ioredis";

function redisNeedsTls(host: string, url: string) {
  if (url.startsWith("rediss://")) return true;
  return host.endsWith(".upstash.io");
}

function redisOptionsFromUrl(url: string): RedisOptions {
  const parsed = new URL(url);
  const host = parsed.hostname;
  const port = parsed.port ? Number(parsed.port) : 6379;
  const username = parsed.username ? decodeURIComponent(parsed.username) : undefined;
  const password = parsed.password ? decodeURIComponent(parsed.password) : undefined;

  return {
    host,
    port,
    username,
    password,
    maxRetriesPerRequest: null,
    family: 0,
    ...(redisNeedsTls(host, url) ? { tls: {} } : {}),
  };
}

export function createRedisConnection() {
  const url = process.env.REDIS_URL ?? "redis://localhost:6379";
  const options = redisOptionsFromUrl(url);
  const client = new Redis(options);
  client.on("error", (err) => {
    console.error("[redis] connection error:", err.message);
  });
  return client;
}

export function redisConnection() {
  return createRedisConnection();
}
