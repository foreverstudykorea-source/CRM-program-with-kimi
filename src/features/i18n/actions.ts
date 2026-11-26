"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { requireRole } from "@/features/auth/session";
import type { TeacherLocale } from "@/features/i18n/teacher-dictionary";

export async function setTeacherLocaleAction(locale: TeacherLocale) {
  await requireRole("TEACHER");
  const nextLocale = locale === "ko" ? "ko" : "uz";
  (await cookies()).set("forever_teacher_locale", nextLocale, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.ALLOW_INSECURE_LOCAL_COOKIES === "true" ? false : process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  revalidatePath("/", "layout");
}
