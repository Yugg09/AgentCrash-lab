import { Redis } from "ioredis";
import { Queue } from "bullmq";
import { QUEUE_NAMES } from "@acl/shared";

let connection: Redis | null = null;

export function getRedis() {
  if (!connection) {
    connection = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
      maxRetriesPerRequest: null,
    });
  }
  return connection;
}

export function getTestRunQueue() {
  return new Queue(QUEUE_NAMES.testRuns, { connection: getRedis() });
}
