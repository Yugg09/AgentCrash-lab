import "./env.js";
import { createApp, prisma } from "./app.js";

const port = Number(process.env.PORT ?? 4000);
const host = process.env.HOST ?? "0.0.0.0";
const app = createApp();

const server = app.listen(port, host, () => {
  console.log(`AgentCrashLab API listening on ${host}:${port}`);
});

async function shutdown() {
  server.close();
  await prisma.$disconnect();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
