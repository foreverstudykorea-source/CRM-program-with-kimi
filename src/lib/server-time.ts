import "server-only";

import { db } from "@/lib/db";

export async function getServerTime() {
  const [row] = await db.$queryRaw<{ now: Date }[]>`SELECT CURRENT_TIMESTAMP AS now`;
  return row.now;
}
