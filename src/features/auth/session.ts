import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Role } from "@/generated/prisma/enums";
import { SESSION_COOKIE, SESSION_DURATION_SECONDS } from "@/lib/constants";
import { db } from "@/lib/db";
import type { AuthUser } from "@/features/auth/types";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function cookieOptions(expires: Date) {
  return {
    httpOnly: true,
    secure: process.env.ALLOW_INSECURE_LOCAL_COOKIES === "true" ? false : process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    expires,
  };
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_SECONDS * 1000);

  await db.$transaction([
    db.session.deleteMany({
      where: { OR: [{ expiresAt: { lte: new Date() } }, { userId, createdAt: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }] },
    }),
    db.session.create({
      data: { userId, tokenHash: hashToken(token), expiresAt },
    }),
  ]);

  (await cookies()).set(SESSION_COOKIE, token, cookieOptions(expiresAt));
}

export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const [session] = await db.$queryRaw<(AuthUser & { sessionId: string })[]>`
      SELECT
        u.id,
        u."fullName",
        u.phone,
        u.role,
        u."isActive",
        u."avatarUrl",
        u."jobTitle",
        s.id AS "sessionId"
      FROM "Session" s
      JOIN "User" u ON u.id = s."userId"
      WHERE s."tokenHash" = ${hashToken(token)}
        AND s."expiresAt" > CURRENT_TIMESTAMP
        AND u."isActive" = TRUE
      LIMIT 1
    `;

    if (!session) return null;

    await db.$executeRaw`
      UPDATE "Session"
      SET "lastUsedAt" = CURRENT_TIMESTAMP
      WHERE id = ${session.sessionId}
        AND "lastUsedAt" < CURRENT_TIMESTAMP - INTERVAL '15 minutes'
    `;

    return {
      id: session.id,
      fullName: session.fullName,
      phone: session.phone,
      role: session.role,
      isActive: session.isActive,
      avatarUrl: session.avatarUrl,
      jobTitle: session.jobTitle,
    };
  } catch (error) {
    if ((error as { code?: string }).code === "ECONNREFUSED") {
      console.error("Database is unavailable during session lookup.");
      return null;
    }
    throw error;
  }
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireRole(...roles: Role[]) {
  const user = await requireUser();
  if (!roles.includes(user.role)) redirect("/");
  return user;
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    await db.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  }

  cookieStore.set(SESSION_COOKIE, "", {
    ...cookieOptions(new Date(0)),
    maxAge: 0,
  });
}
