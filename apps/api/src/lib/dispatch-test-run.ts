import { isRedisEnabled } from "@acl/shared";
import { getTestRunQueue } from "./queue.js";

const queueOpts = { removeOnComplete: 50, removeOnFail: 50 } as const;

/**
 * Enqueue via BullMQ when REDIS_URL is set (local dev).
 * Otherwise run in-process in the API (production on Render without Redis).
 */
export async function dispatchTestRun(testRunId: string): Promise<void> {
  if (isRedisEnabled()) {
    await getTestRunQueue().add("run", { testRunId }, queueOpts);
    return;
  }

  const { processTestRun } = await import("@acl/worker/jobs/run-test-run");
  void processTestRun({ testRunId }).catch((err) => {
    console.error(`[dispatch] in-process test run ${testRunId} failed:`, err instanceof Error ? err.message : err);
  });
}
