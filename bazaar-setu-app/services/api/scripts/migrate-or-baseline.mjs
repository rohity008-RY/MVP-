import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const repoRoot = process.cwd();
const schemaPath = process.env.PRISMA_SCHEMA_PATH ?? "services/api/prisma/schema.prisma";
const scriptDir = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(scriptDir, "../prisma/migrations");
const prismaBin = join(repoRoot, "node_modules/.bin/prisma");

function runPrisma(args, options = {}) {
  const result = spawnSync(prismaBin, [...args, "--schema", schemaPath], {
    cwd: repoRoot,
    env: process.env,
    encoding: "utf8"
  });

  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);

  if (!options.allowFailure && result.status !== 0) {
    process.exit(result.status ?? 1);
  }

  return {
    ok: result.status === 0,
    status: result.status ?? 1,
    output: `${result.stdout ?? ""}\n${result.stderr ?? ""}`
  };
}

const deploy = runPrisma(["migrate", "deploy"], { allowFailure: true });

if (deploy.ok) {
  process.exit(0);
}

if (!deploy.output.includes("P3005")) {
  process.exit(deploy.status);
}

if (process.env.DEPLOYMENT_ENV !== "staging") {
  console.error("Refusing to baseline a non-staging database after Prisma P3005.");
  process.exit(deploy.status);
}

console.warn("Staging database has schema objects but no Prisma migration history. Aligning schema and baselining migrations.");
runPrisma(["db", "push", "--skip-generate"]);

const migrations = readdirSync(migrationsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

for (const migration of migrations) {
  runPrisma(["migrate", "resolve", "--applied", migration]);
}

runPrisma(["migrate", "deploy"]);
