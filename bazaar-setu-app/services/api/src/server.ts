import { createApp } from "./app.js";
import { config, readinessBlockers } from "./config.js";
import { prisma } from "./db.js";
import { closeRateLimitStore } from "./rate-limit-store.js";

const app = createApp();

const blockers = readinessBlockers();
if (config.isProduction && blockers.length) {
  console.error("Bazaar Setu API cannot start because production readiness checks failed:");
  for (const blocker of blockers) console.error(`- ${blocker}`);
  process.exit(1);
}

const server = app.listen(config.port, () => {
  console.log(`Bazaar Setu API running on ${config.apiBaseUrl}`);
});

async function closeDependencies() {
  closeRateLimitStore();
  await prisma.$disconnect();
}

let shutdownStarted = false;

function shutdown(signal: string) {
  if (shutdownStarted) return;
  shutdownStarted = true;
  console.log(`${signal} received. Closing Bazaar Setu API server...`);

  const forceExit = setTimeout(() => {
    console.error(`Forced shutdown after ${config.shutdownGraceMs}ms.`);
    process.exit(1);
  }, config.shutdownGraceMs);

  server.close(async (error) => {
    try {
      if (error) console.error(error);
      await closeDependencies();
      clearTimeout(forceExit);
      process.exit(error ? 1 : 0);
    } catch (closeError) {
      console.error(closeError);
      clearTimeout(forceExit);
      process.exit(1);
    }
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection", error);
  shutdown("unhandledRejection");
});
process.on("uncaughtException", (error) => {
  console.error("Uncaught exception", error);
  shutdown("uncaughtException");
});
