import path from "node:path";
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const hasLocalPostgres = existsSync(path.join(root, ".postgres", "data"));
if (!process.env.DATABASE_URL && hasLocalPostgres) {
  process.env.DATABASE_URL = "postgresql://forever:forever@localhost:5432/forever_study?schema=public";
}
if (hasLocalPostgres) {
  await import("./ensure-postgres.mjs");
}

const migration = spawnSync(process.execPath, [path.join(root, "node_modules", "prisma", "build", "index.js"), "migrate", "deploy"], {
  cwd: root,
  env: process.env,
  stdio: "inherit",
  windowsHide: true,
});
if (migration.status !== 0) {
  process.exit(migration.status ?? 1);
}

const result = spawnSync(process.execPath, [path.join(root, "node_modules", "next", "dist", "bin", "next"), "build", "--webpack"], {
  cwd: root,
  env: process.env,
  stdio: "inherit",
  windowsHide: true,
});

process.exit(result.status ?? 1);
