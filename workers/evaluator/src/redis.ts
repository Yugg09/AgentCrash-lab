import { Redis } from "ioredis";
import { parseRedisUrl } from "@acl/shared";

export function createRedisConnection() {
  const raw = process.env.REDIS_URL ?? "redis://localhost:6379";
  const { host, port, username, password, tls } = parseRedisUrl(raw);
  const client = new Redis({
    host,
    port,
    username,
    password,
    maxRetriesPerRequest: null,
    family: 0,
    ...(tls ? { tls: {} } : {}),
  });
  client.on("error", (err) => {
    console.error("[redis] connection error:", err.message);
  });
  return client;
}

export function redisConnection() {
  return createRedisConnection();
}
