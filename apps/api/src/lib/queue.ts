import { Queue } from "bullmq";
import { isRedisEnabled, QUEUE_NAMES } from "@acl/shared";
import { createRedisConnection } from "./redis.js";

let connection: ReturnType<typeof createRedisConnection> | null = null;
let queue: Queue | null = null;

export function getRedis() {
  if (!isRedisEnabled()) {
    throw new Error("Redis is not configured (REDIS_URL unset)");
  }
  if (!connection) {
    connection = createRedisConnection();
  }
  return connection;
}

export function getTestRunQueue() {
  if (!queue) {
    queue = new Queue(QUEUE_NAMES.testRuns, { connection: getRedis() });
  }
  return queue;
}
