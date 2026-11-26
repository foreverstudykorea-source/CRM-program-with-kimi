import "server-only";

import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

export async function logAuthError(error: unknown) {
  const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "UNKNOWN";
  const message = error instanceof Error ? error.message.slice(0, 500) : "Unknown authentication error";
  const line = `${new Date().toISOString()} [${code}] ${message}\n`;
  const directory = path.join(process.cwd(), ".data", "logs");
  await mkdir(directory, { recursive: true });
  await appendFile(path.join(directory, "auth-errors.log"), line, "utf8");
}
