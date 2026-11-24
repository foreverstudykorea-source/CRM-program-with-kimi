import "server-only";

import type { AuthUser } from "@/features/auth/types";
import { db } from "@/lib/db";
import { getTashkentDateValue } from "@/lib/date-time";

export async function getAuthorizedLesson(user: AuthUser, lessonId: string) {
  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    select: {
      id: true,
      date: true,
      topic: true,
      groupId: true,
      group: {
        select: {
          name: true,
          teacherId: true,
          startTime: true,
          endTime: true,
          room: true,
          course: { select: { name: true } },
          teacher: { select: { fullName: true } },
        },
      },
    },
  });
  if (!lesson) return null;
  if (user.role === "ADMIN") return lesson;
  if (user.role !== "TEACHER" || user.jobTitle !== "Ustoz" || lesson.group.teacherId !== user.id) return null;
  return lesson;
}

export function canEditLesson(user: AuthUser, lessonDate: Date) {
  if (user.role === "ADMIN") return true;
  return user.role === "TEACHER" && user.jobTitle === "Ustoz" && lessonDate.toISOString().slice(0, 10) === getTashkentDateValue();
}
