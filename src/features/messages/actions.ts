"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/features/auth/session";
import { db } from "@/lib/db";

const messageSchema = z.object({
  recipientIds: z.array(z.string()).max(100).default([]),
  groupId: z.string().nullable().default(null),
  type: z.enum(["GENERAL", "ATTENDANCE", "PAYMENT"]),
  body: z.string().trim().min(5, "Xabar kamida 5 ta belgidan iborat bo‘lsin.").max(2000, "Xabar 2000 ta belgidan oshmasligi kerak."),
});

export async function sendMessage(input: unknown): Promise<{ error?: string; success?: boolean }> {
  const user = await requireRole("ADMIN", "FINANCE");
  const parsed = messageSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Xabarni tekshiring." };

  try {
    const data = parsed.data;
    const recipients = data.groupId
      ? await db.groupStudent.findMany({ where: { groupId: data.groupId, leftAt: null, student: { isActive: true } }, select: { studentId: true, student: { select: { fullName: true } } } })
      : await db.user.findMany({ where: { id: { in: data.recipientIds }, role: "STUDENT", isActive: true }, select: { id: true, fullName: true } });
    if (!recipients.length) return { error: "Kamida bitta faol o‘quvchi tanlang." };

    const group = data.groupId ? await db.group.findUnique({ where: { id: data.groupId }, select: { name: true } }) : null;
    if (data.groupId && !group) return { error: "Guruh topilmadi." };

    await db.$transaction(async (transaction) => {
      for (const recipient of recipients) {
        const id = "studentId" in recipient ? recipient.studentId : recipient.id;
        const fullName = "student" in recipient ? recipient.student.fullName : recipient.fullName;
        const body = data.body.replaceAll("{ism}", fullName).replaceAll("{guruh}", group?.name ?? "");
        await transaction.message.create({ data: { senderId: user.id, recipientId: id, groupId: data.groupId, type: data.type, body } });
      }
      await transaction.auditLog.create({ data: { userId: user.id, action: "MESSAGE_SEND", entity: "Message", meta: { groupId: data.groupId, type: data.type, recipients: recipients.length } } });
    });
    revalidatePath("/messages");
    return { success: true };
  } catch (error) {
    console.error("Could not send message", error);
    return { error: "Xabarni yuborishda xatolik yuz berdi." };
  }
}

export async function markMessageRead(messageId: string) {
  const user = await requireRole("STUDENT");
  const message = await db.message.findFirst({ where: { id: messageId, recipientId: user.id }, select: { id: true } });
  if (!message) return { error: "Xabar topilmadi." };
  await db.message.update({ where: { id: messageId }, data: { readAt: new Date() } });
  revalidatePath("/messages");
  return { success: true };
}
