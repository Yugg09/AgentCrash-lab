import { execSync } from "node:child_process";
import { isRedisEnabled } from "@acl/shared";

execSync("tsx scripts/bootstrap-prod.ts", { stdio: "inherit" });

if (isRedisEnabled()) {
  console.log("REDIS_URL set — starting API + BullMQ worker");
  execSync('concurrently -n api,worker "npm run start -w @acl/api" "npm run start -w @acl/worker"', {
    stdio: "inherit",
  });
} else {
  console.log("REDIS_URL not set — starting API only (in-process test runs)");
  execSync("npm run start -w @acl/api", { stdio: "inherit" });
}
