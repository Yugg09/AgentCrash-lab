import "./env.js";
import { Worker } from "bullmq";
import { QUEUE_NAMES } from "@acl/shared";
import { redisConnection } from "./redis.js";
import { processTestRun, type TestRunJob } from "./jobs/run-test-run.js";
import { prisma } from "./prisma.js";

const connection = redisConnection();

const worker = new Worker<TestRunJob>(
  QUEUE_NAMES.testRuns,
  async (job) => {
    await processTestRun(job.data);
  },
  { connection, concurrency: 2 },
);

worker.on("ready", () => {
  console.log("AgentCrashLab worker ready");
});

worker.on("error", (err) => {
  console.error("Worker error:", err.message);
});

connection.on("connect", () => {
  console.log("Worker connected to Redis");
});

worker.on("failed", (job, err) => {
  console.error("Job failed", job?.id, err.message);
});

async function shutdown() {
  await worker.close();
  await connection.quit();
  await prisma.$disconnect();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
