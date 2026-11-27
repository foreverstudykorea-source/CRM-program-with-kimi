"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { requireRole } from "@/features/auth/session";
import { createStudentSchema, type CreateStudentValues } from "@/features/students/schemas";
import { db } from "@/lib/db";

export async function createStudent(input: CreateStudentValues): Promise<{ error?: string; success?: boolean; studentId?: string }> {
  const admin = await requireRole("ADMIN");
  const parsed = createStudentSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Ma’lumotlarni tekshiring." };

  try {
    const data = parsed.data;
    const existing = await db.user.findUnique({ where: { phone: data.phone }, select: { id: true } });
    if (existing) return { error: "Bu telefon raqam allaqachon ro‘yxatda." };

    const group = data.groupId ? await db.group.findFirst({ where: { id: data.groupId, status: "ACTIVE" }, include: { course: true, teacher: { select: { fullName: true } } } }) : null;
    if (data.groupId && !group) return { error: "Tanlangan guruh topilmadi." };

    const passwordHash = await bcrypt.hash(data.password, 12);
    const joinedAt = new Date(`${data.joinedAt}T12:00:00.000Z`);
    const now = new Date();
    const month = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

    const student = await db.$transaction(async (transaction) => {
      const created = await transaction.user.create({
        data: { fullName: data.fullName, phone: data.phone, passwordHash, role: "STUDENT", jobTitle: "O‘quvchi", isActive: true },
      });
      await transaction.studentProfile.create({
        data: {
          userId: created.id,
          status: "ACTIVE",
          courseType: group?.course.name,
          teacherName: group?.teacher.fullName,
          scheduleText: group?.weekDays.join(", "),
          timeText: group?.startTime,
          startDate: joinedAt,
          paymentStatus: "UNPAID",
          salesManager: admin.fullName,
        },
      });
      if (group) {
        await transaction.groupStudent.create({ data: { groupId: group.id, studentId: created.id, joinedAt } });
        await transaction.charge.create({ data: { studentId: created.id, groupId: group.id, month, amount: group.course.monthlyPrice, status: "UNPAID" } });
      }
      await transaction.auditLog.create({ data: { userId: admin.id, action: "STUDENT_CREATE", entity: "User", entityId: created.id, meta: { fullName: data.fullName, groupId: group?.id } } });
      return created;
    });

    revalidatePath("/students");
    revalidatePath("/payments");
    revalidatePath("/finance");
    revalidatePath("/debtors");
    return { success: true, studentId: student.id };
  } catch (error) {
    console.error("Could not create student", error);
    return { error: "O‘quvchini qo‘shishda xatolik yuz berdi. Qayta urinib ko‘ring." };
  }
}
