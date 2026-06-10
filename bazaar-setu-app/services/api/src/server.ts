import { createApp } from "./app.js";
import { config, readinessBlockers } from "./config.js";

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

function shutdown(signal: string) {
  console.log(`${signal} received. Closing Bazaar Setu API server...`);
  server.close(() => {
    process.exit(0);
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
