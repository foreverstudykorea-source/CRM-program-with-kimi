import { existsSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import pg from "pg";

const root = process.cwd();
const executable = path.join(root, ".tools", "postgres", "bin", "pg_ctl.exe");
const dataDirectory = path.join(root, ".postgres", "data");
const logFile = path.join(root, ".postgres", "postgres.log");
const connectionString = process.env.DATABASE_URL ?? "postgresql://forever:forever@localhost:5432/forever_study?schema=public";

async function canConnect() {
  const client = new pg.Client({ connectionString, connectionTimeoutMillis: 1500 });
  try {
    await client.connect();
    await client.query("SELECT 1");
    await client.end();
    return true;
  } catch {
    await client.end().catch(() => undefined);
    return false;
  }
}

if (await canConnect()) {
  console.log("PostgreSQL is ready.");
} else if (existsSync(executable) && existsSync(dataDirectory) && new URL(connectionString).hostname === "localhost") {
  console.log("Starting local PostgreSQL...");
  const result = spawnSync(executable, ["-D", dataDirectory, "-l", logFile, "-o", "-p 5432", "start"], {
    cwd: root,
    stdio: "ignore",
    windowsHide: true,
  });
  if (result.error || result.status !== 0) {
    throw result.error ?? new Error("Could not start local PostgreSQL.");
  }

  let ready = false;
  for (let attempt = 0; attempt < 20; attempt += 1) {
    if (await canConnect()) {
      ready = true;
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  if (!ready) throw new Error("Local PostgreSQL did not become ready.");
  console.log("Local PostgreSQL started successfully.");
} else {
  throw new Error(`PostgreSQL is unavailable. Check DATABASE_URL and start the database before running the app.`);
}
