import { execSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  execSync("npx prisma migrate deploy", { stdio: "inherit" });

  const agents = await prisma.agent.count();
  if (agents === 0) {
    console.log("Empty database — seeding demo data…");
    execSync("tsx prisma/seed.ts", { stdio: "inherit" });
  } else {
    console.log(`Database ready (${agents} agent(s)), skipping seed.`);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
