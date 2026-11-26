"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/features/auth/session";
import { getTashkentDateValue } from "@/lib/date-time";
import { db } from "@/lib/db";

export async function toggleSupportSignup(lessonId: string): Promise<{ error?: string; success?: boolean; signedUp?: boolean }> {
  const user = await requireRole("STUDENT");

  try {
    const lesson = await db.lesson.findUnique({
      where: { id: lessonId },
      select: { id: true, date: true, groupId: true, group: { select: { name: true } } },
    });
    if (!lesson) return { error: "Support dars topilmadi." };
    if (lesson.date.toISOString().slice(0, 10) < getTashkentDateValue()) return { error: "O‘tgan support darsga yozilib bo‘lmaydi." };

    const dateValue = lesson.date.toISOString().slice(0, 10);
    const membership = await db.groupStudent.findFirst({
      where: {
        groupId: lesson.groupId,
        studentId: user.id,
        joinedAt: { lte: new Date(`${dateValue}T18:59:59.999Z`) },
        OR: [{ leftAt: null }, { leftAt: { gte: new Date(`${dateValue}T00:00:00.000Z`) } }],
      },
      select: { groupId: true },
    });
    if (!membership) return { error: "Siz bu guruhga biriktirilmagansiz." };

    const existing = await db.supportSignup.findUnique({ where: { lessonId_studentId: { lessonId, studentId: user.id } } });
    if (existing) {
      await db.supportSignup.delete({ where: { id: existing.id } });
      revalidatePath("/support");
      revalidatePath("/groups");
      return { success: true, signedUp: false };
    }

    await db.$transaction([
      db.supportSignup.create({ data: { lessonId, studentId: user.id } }),
      db.auditLog.create({ data: { userId: user.id, action: "SUPPORT_SIGNUP", entity: "Lesson", entityId: lessonId, meta: { groupId: lesson.groupId } } }),
    ]);
    revalidatePath("/support");
    revalidatePath("/groups");
    return { success: true, signedUp: true };
  } catch (error) {
    console.error("Could not update support signup", error);
    return { error: "Supportga yozilishda xatolik yuz berdi. Qayta urinib ko‘ring." };
  }
}
