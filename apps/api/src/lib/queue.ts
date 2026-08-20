import { Queue } from "bullmq";
import { QUEUE_NAMES } from "@acl/shared";
import { createRedisConnection } from "./redis.js";

let connection: ReturnType<typeof createRedisConnection> | null = null;

export function getRedis() {
  if (!connection) {
    connection = createRedisConnection();
  }
  return connection;
}

export function getTestRunQueue() {
  return new Queue(QUEUE_NAMES.testRuns, { connection: getRedis() });
}
