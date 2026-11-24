"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/features/auth/session";
import { homeworkSchema } from "@/features/homework/schemas";
import { removeHomeworkFile, saveHomeworkFile } from "@/features/homework/storage";
import { validateHomeworkFile } from "@/features/homework/file-config";
import type { HomeworkActionResult } from "@/features/homework/types";
import { db } from "@/lib/db";

export async function saveHomework(homeworkId: string | null, formData: FormData): Promise<HomeworkActionResult> {
  const user = await requireRole("TEACHER");
  const parsed = homeworkSchema.safeParse({
    groupId: formData.get("groupId"),
    title: formData.get("title"),
    description: formData.get("description"),
    dueDate: formData.get("dueDate"),
    attachmentUrl: formData.get("attachmentUrl") || "",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Ma’lumotlarni tekshiring." };

  const uploadedFile = formData.get("attachment");
  const file = uploadedFile instanceof File && uploadedFile.size > 0 ? uploadedFile : null;
  if (file) {
    const fileError = validateHomeworkFile(file);
    if (fileError) return { error: fileError };
  }

  try {
    const [group, existing] = await Promise.all([
      db.group.findFirst({ where: { id: parsed.data.groupId, teacherId: user.id, status: "ACTIVE" }, select: { id: true } }),
      homeworkId ? db.homework.findFirst({ where: { id: homeworkId, group: { teacherId: user.id } }, select: { id: true, attachmentUrl: true } }) : Promise.resolve(null),
    ]);

    if (!group) return { error: "Tanlangan guruh topilmadi yoki sizga biriktirilmagan." };
    if (homeworkId && !existing) return { error: "Vazifa topilmadi yoki uni tahrirlashga ruxsatingiz yo‘q." };

    let attachmentUrl = parsed.data.attachmentUrl || existing?.attachmentUrl || null;
    const previousFile = existing?.attachmentUrl ?? null;
    let newFileUrl: string | null = null;

    if (file) {
      newFileUrl = await saveHomeworkFile(file);
      attachmentUrl = newFileUrl;
    }
    if (!attachmentUrl) return { error: "Vazifa uchun havola qo‘shing yoki fayl yuklang." };

    try {
      if (existing) {
        await db.$transaction([
          db.homework.update({
            where: { id: existing.id },
            data: { groupId: group.id, title: parsed.data.title, description: parsed.data.description, dueDate: new Date(`${parsed.data.dueDate}T00:00:00.000Z`), attachmentUrl },
          }),
          db.auditLog.create({ data: { userId: user.id, action: "HOMEWORK_UPDATE", entity: "Homework", entityId: existing.id, meta: { groupId: group.id, title: parsed.data.title } } }),
        ]);
      } else {
        await db.$transaction(async (transaction) => {
          const homework = await transaction.homework.create({
            data: { groupId: group.id, title: parsed.data.title, description: parsed.data.description, dueDate: new Date(`${parsed.data.dueDate}T00:00:00.000Z`), attachmentUrl, createdById: user.id },
            select: { id: true },
          });
          await transaction.auditLog.create({ data: { userId: user.id, action: "HOMEWORK_CREATE", entity: "Homework", entityId: homework.id, meta: { groupId: group.id, title: parsed.data.title } } });
        });
      }
    } catch (error) {
      if (newFileUrl) await removeHomeworkFile(newFileUrl);
      throw error;
    }

    if (previousFile && previousFile !== attachmentUrl) await removeHomeworkFile(previousFile);
    revalidatePath("/homework");
    return { success: true };
  } catch (error) {
    console.error("Could not save homework", error);
    return { error: "Vazifani saqlashda xatolik yuz berdi. Qayta urinib ko‘ring." };
  }
}

export async function deleteHomework(homeworkId: string): Promise<HomeworkActionResult> {
  const user = await requireRole("TEACHER");

  try {
    const homework = await db.homework.findFirst({
      where: { id: homeworkId, group: { teacherId: user.id } },
      select: { id: true, title: true, groupId: true, attachmentUrl: true },
    });
    if (!homework) return { error: "Vazifa topilmadi yoki uni o‘chirishga ruxsatingiz yo‘q." };

    await db.$transaction([
      db.homework.delete({ where: { id: homework.id } }),
      db.auditLog.create({ data: { userId: user.id, action: "HOMEWORK_DELETE", entity: "Homework", entityId: homework.id, meta: { groupId: homework.groupId, title: homework.title } } }),
    ]);
    await removeHomeworkFile(homework.attachmentUrl);
    revalidatePath("/homework");
    return { success: true };
  } catch (error) {
    console.error("Could not delete homework", error);
    return { error: "Vazifani o‘chirishda xatolik yuz berdi. Qayta urinib ko‘ring." };
  }
}
