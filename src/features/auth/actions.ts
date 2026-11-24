"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createSession, destroySession, getCurrentUser } from "@/features/auth/session";
import { loginSchema, type LoginActionResult, type LoginFormValues } from "@/features/auth/schemas";

const WINDOW_MS = 15 * 60 * 1000;
const dummyPasswordHash = bcrypt.hashSync("forever-study-dummy-password", 12);

function digest(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

async function recordAttempt(identifierHash: string, ipHash: string, wasSuccessful = false) {
  await db.loginAttempt.create({
    data: { identifierHash, ipHash, wasSuccessful },
  });
}

export async function loginAction(input: LoginFormValues, nextPath?: string): Promise<LoginActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Telefon raqam va parolni to‘g‘ri kiriting." };
  }

  const { phone, password } = parsed.data;
  const requestHeaders = await headers();
  const ipAddress = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || requestHeaders.get("x-real-ip") || "local";
  const identifierHash = digest(phone);
  const ipHash = digest(ipAddress);

  try {
    const windowStart = new Date(Date.now() - WINDOW_MS);
    const [phoneFailures, ipFailures] = await Promise.all([
      db.loginAttempt.count({
        where: { identifierHash, wasSuccessful: false, createdAt: { gte: windowStart } },
      }),
      db.loginAttempt.count({
        where: { ipHash, wasSuccessful: false, createdAt: { gte: windowStart } },
      }),
    ]);

    if (phoneFailures >= 5 || ipFailures >= 30) {
      return { error: "Kirish urinishlari juda ko‘p. 15 daqiqadan keyin qayta urinib ko‘ring." };
    }

    const user = await db.user.findUnique({
      where: { phone },
      select: { id: true, passwordHash: true, role: true, isActive: true },
    });
    const passwordMatches = await bcrypt.compare(password, user?.passwordHash ?? dummyPasswordHash);

    if (!user || !user.isActive || !passwordMatches) {
      await recordAttempt(identifierHash, ipHash);
      return { error: "Telefon raqam yoki parol noto‘g‘ri." };
    }

    await db.$transaction([
      db.loginAttempt.deleteMany({ where: { identifierHash, wasSuccessful: false } }),
      db.loginAttempt.create({ data: { identifierHash, ipHash, wasSuccessful: true } }),
      db.auditLog.create({
        data: {
          userId: user.id,
          action: "LOGIN",
          entity: "User",
          entityId: user.id,
          meta: { role: user.role },
        },
      }),
    ]);
    await createSession(user.id);
  } catch (error) {
    console.error("Login failed", error);
    if ((error as { code?: string }).code === "ECONNREFUSED") {
      return { error: "Ma’lumotlar bazasiga ulanib bo‘lmadi. Birozdan keyin qayta urinib ko‘ring." };
    }
    return { error: "Tizimga kirishda xatolik yuz berdi. Qayta urinib ko‘ring." };
  }

  const destination = nextPath?.startsWith("/") && !nextPath.startsWith("//") && !nextPath.includes("\\") ? nextPath : "/";
  redirect(destination);
}

export async function logoutAction() {
  const user = await getCurrentUser();

  try {
    if (user) {
      await db.auditLog.create({
        data: { userId: user.id, action: "LOGOUT", entity: "User", entityId: user.id },
      });
    }
  } catch (error) {
    console.error("Could not record logout", error);
  }

  await destroySession();
  redirect("/login");
}
