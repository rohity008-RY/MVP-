import { readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const repoRoot = process.cwd();
const schemaPath = process.env.PRISMA_SCHEMA_PATH ?? "services/api/prisma/schema.prisma";
const runtimeEnvPath = process.env.API_RUNTIME_ENV_PATH ?? "/tmp/bazaar-setu-api.env";
const scriptDir = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(scriptDir, "../prisma/migrations");
const prismaBin = join(repoRoot, "node_modules/.bin/prisma");

function shellQuote(value) {
  return `'${String(value).replaceAll("'", "'\\''")}'`;
}

function quoteIdent(value) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

function runPrisma(args, options = {}) {
  const result = spawnSync(prismaBin, [...args, "--schema", schemaPath], {
    cwd: repoRoot,
    env: process.env,
    input: options.input,
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

function runPrismaUrl(args, databaseUrl, options = {}) {
  const result = spawnSync(prismaBin, [...args, "--url", databaseUrl], {
    cwd: repoRoot,
    env: process.env,
    input: options.input,
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

function prepareStagingDatabase() {
  if (process.env.DEPLOYMENT_ENV !== "staging" || !process.env.DATABASE_URL) return;

  const targetDatabase = process.env.STAGING_DATABASE_NAME ?? "bazaar_setu_staging";
  const currentUrl = new URL(process.env.DATABASE_URL);
  const currentDatabase = currentUrl.pathname.replace(/^\//, "");

  if (currentDatabase === targetDatabase) return;

  const targetUrl = new URL(process.env.DATABASE_URL);
  targetUrl.pathname = `/${targetDatabase}`;

  const createResult = runPrismaUrl(["db", "execute", "--stdin"], process.env.DATABASE_URL, {
    allowFailure: true,
    input: `CREATE DATABASE ${quoteIdent(targetDatabase)};`
  });

  if (!createResult.ok && !createResult.output.includes("already exists")) {
    console.error(`Could not create isolated staging database ${targetDatabase}. Refusing to use the existing ${currentDatabase} database.`);
    process.exit(createResult.status);
  }

  process.env.DATABASE_URL = targetUrl.toString();
  console.warn(`Using isolated staging database ${targetDatabase} on the configured Neon host.`);
}

prepareStagingDatabase();
writeFileSync(runtimeEnvPath, `export DATABASE_URL=${shellQuote(process.env.DATABASE_URL ?? "")}\n`, { mode: 0o600 });

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
