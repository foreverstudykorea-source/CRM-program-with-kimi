import "server-only";

import { cookies } from "next/headers";
import type { AuthUser } from "@/features/auth/types";
import type { TeacherLocale } from "@/features/i18n/teacher-dictionary";

export async function getTeacherLocale(user: AuthUser): Promise<TeacherLocale> {
  if (user.role !== "TEACHER") return "uz";
  const locale = (await cookies()).get("forever_teacher_locale")?.value;
  return locale === "ko" ? "ko" : "uz";
}
