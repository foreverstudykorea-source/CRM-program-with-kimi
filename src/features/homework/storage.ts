import "server-only";

import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { allowedHomeworkFiles } from "@/features/homework/file-config";

const uploadDirectory = path.join(process.cwd(), ".data", "uploads");
const allowedFiles = allowedHomeworkFiles;

export async function saveHomeworkFile(file: File) {
  const config = allowedFiles[file.type];
  if (!config) throw new Error("Unsupported file type");
  await mkdir(uploadDirectory, { recursive: true });
  const filename = `${randomUUID()}${config.extension}`;
  await writeFile(path.join(uploadDirectory, filename), Buffer.from(await file.arrayBuffer()), { flag: "wx" });
  return `/api/files/${filename}`;
}

export async function removeHomeworkFile(attachmentUrl: string | null) {
  if (!attachmentUrl?.startsWith("/api/files/")) return;
  const filename = path.basename(attachmentUrl);
  if (!/^[a-f0-9-]+\.[a-z0-9]+$/i.test(filename)) return;
  await unlink(path.join(uploadDirectory, filename)).catch(() => undefined);
}

export async function readHomeworkFile(filename: string) {
  if (path.basename(filename) !== filename || !/^[a-f0-9-]+\.[a-z0-9]+$/i.test(filename)) return null;
  const config = Object.values(allowedFiles).find((item) => filename.endsWith(item.extension));
  if (!config) return null;
  try {
    const data = await readFile(path.join(uploadDirectory, filename));
    return { data, contentType: config.contentType };
  } catch {
    return null;
  }
}
