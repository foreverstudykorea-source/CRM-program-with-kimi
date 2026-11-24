"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/features/auth/session";
import { canEditLesson, getAuthorizedLesson } from "@/features/attendance/authorization";
import { saveAttendanceSchema } from "@/features/attendance/schemas";
import type { AttendanceActionResult, AttendanceEntry } from "@/features/attendance/types";
import { db } from "@/lib/db";

export async function saveAttendance(lessonId: string, entries: AttendanceEntry[]): Promise<AttendanceActionResult> {
  const user = await requireRole("TEACHER", "ADMIN");
  if (user.role === "TEACHER" && user.jobTitle !== "Ustoz") {
    return { error: "Support teacher davomat belgilay olmaydi." };
  }

  const parsed = saveAttendanceSchema.safeParse({ lessonId, entries });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Davomat ma’lumotlarini tekshiring." };

  try {
    const lesson = await getAuthorizedLesson(user, lessonId);
    if (!lesson) return { error: "Dars topilmadi yoki sizga biriktirilmagan." };
    if (!canEditLesson(user, lesson.date)) {
      return { error: "Ustoz faqat bugungi davomatni tahrirlashi mumkin. Eski davomatni admin o‘zgartiradi." };
    }

    const dateValue = lesson.date.toISOString().slice(0, 10);
    const members = await db.groupStudent.findMany({
      where: {
        groupId: lesson.groupId,
        joinedAt: { lte: new Date(`${dateValue}T18:59:59.999Z`) },
        OR: [{ leftAt: null }, { leftAt: { gte: new Date(`${dateValue}T00:00:00.000Z`) } }],
      },
      select: { studentId: true },
    });
    const allowedIds = new Set(members.map((member) => member.studentId));
    const submittedIds = new Set(parsed.data.entries.map((entry) => entry.studentId));

    if (parsed.data.entries.length !== members.length || submittedIds.size !== allowedIds.size || [...submittedIds].some((id) => !allowedIds.has(id))) {
      return { error: "Har bir guruh o‘quvchisiga, faqat bir marta, holat belgilang." };
    }

    const markedAt = new Date();
    await db.$transaction(async (transaction) => {
      for (const entry of parsed.data.entries) {
        await transaction.attendance.upsert({
          where: { lessonId_studentId: { lessonId, studentId: entry.studentId } },
          update: { status: entry.status, note: entry.note || null, markedById: user.id, markedAt },
          create: { lessonId, studentId: entry.studentId, status: entry.status, note: entry.note || null, markedById: user.id, markedAt },
        });
      }
      await transaction.auditLog.create({
        data: {
          userId: user.id,
          action: "ATTENDANCE_SAVE",
          entity: "Lesson",
          entityId: lessonId,
          meta: { groupId: lesson.groupId, date: dateValue, students: parsed.data.entries.length },
        },
      });
    });

    revalidatePath("/attendance");
    revalidatePath(`/attendance/${lessonId}`);
    revalidatePath("/groups");
    return { success: true };
  } catch (error) {
    console.error("Could not save attendance", error);
    return { error: "Davomatni saqlashda xatolik yuz berdi. Qayta urinib ko‘ring." };
  }
}
