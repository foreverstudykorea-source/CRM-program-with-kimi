"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/features/auth/session";
import { chargeSchema, monthSchema, paymentSchema } from "@/features/finance/schemas";
import { getChargeOutstanding, monthDate } from "@/features/finance/queries";
import { formatMoney } from "@/lib/format";
import { db } from "@/lib/db";

export type FinanceActionResult = { error?: string; success?: boolean; paymentId?: string };

export async function generateMonthlyCharges(monthValue: string): Promise<FinanceActionResult> {
  const user = await requireRole("FINANCE");
  const month = monthSchema.safeParse(monthValue);
  if (!month.success) return { error: "Oyni to‘g‘ri tanlang." };

  try {
    const month = monthDate(monthValue);
    const members = await db.groupStudent.findMany({
      where: { leftAt: null, group: { status: "ACTIVE", course: { monthlyPrice: { gt: 0 } } }, student: { studentProfile: { status: "ACTIVE" } } },
      select: { studentId: true, groupId: true, group: { select: { course: { select: { monthlyPrice: true } } } } },
    });
    await db.$transaction(async (transaction) => {
      for (const member of members) {
        await transaction.charge.upsert({
          where: { studentId_groupId_month: { studentId: member.studentId, groupId: member.groupId, month } },
          update: {},
          create: { studentId: member.studentId, groupId: member.groupId, month, amount: member.group.course.monthlyPrice, status: "UNPAID" },
        });
      }
      await transaction.auditLog.create({ data: { userId: user.id, action: "CHARGES_GENERATE", entity: "Charge", meta: { month: monthValue, memberships: members.length } } });
    });
    revalidatePath("/finance");
    revalidatePath("/payments");
    revalidatePath("/debtors");
    return { success: true };
  } catch (error) {
    console.error("Could not generate charges", error);
    return { error: "Oylik hisoblarni yaratishda xatolik yuz berdi." };
  }
}

export async function updateCharge(chargeId: string, amount: number, discount: number): Promise<FinanceActionResult> {
  const user = await requireRole("FINANCE");
  const parsed = chargeSchema.safeParse({ chargeId, amount, discount });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Summani tekshiring." };

  try {
    const charge = await db.charge.findUnique({ where: { id: chargeId }, include: { payments: true } });
    if (!charge) return { error: "Oylik hisob topilmadi." };
    const paid = charge.payments.reduce((total, payment) => total + payment.amount, 0);
    const status = paid >= parsed.data.amount - parsed.data.discount ? "PAID" : paid > 0 ? "PARTIAL" : "UNPAID";
    await db.$transaction([
      db.charge.update({ where: { id: chargeId }, data: { amount: parsed.data.amount, discount: parsed.data.discount, status } }),
      db.auditLog.create({ data: { userId: user.id, action: "CHARGE_UPDATE", entity: "Charge", entityId: chargeId, meta: { amount: parsed.data.amount, discount: parsed.data.discount } } }),
    ]);
    revalidatePath("/payments");
    revalidatePath("/finance");
    revalidatePath("/debtors");
    return { success: true };
  } catch (error) {
    console.error("Could not update charge", error);
    return { error: "Oylik hisobni saqlashda xatolik yuz berdi." };
  }
}

export async function recordPayment(input: unknown): Promise<FinanceActionResult> {
  const user = await requireRole("FINANCE");
  const parsed = paymentSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "To‘lov ma’lumotlarini tekshiring." };

  try {
    const data = parsed.data;
    const charge = await db.charge.findUnique({ where: { id: data.chargeId }, include: { payments: true } });
    if (!charge || charge.studentId !== data.studentId) return { error: "Oylik hisob va o‘quvchi mos kelmadi." };
    const outstanding = getChargeOutstanding(charge);
    if (outstanding <= 0) return { error: "Bu hisob allaqachon to‘langan." };
    if (data.amount > outstanding) return { error: `To‘lov qoldiq summadan katta. Qoldiq: ${formatMoney(outstanding)}.` };

    const payment = await db.$transaction(async (transaction) => {
      const created = await transaction.payment.create({
        data: { studentId: data.studentId, chargeId: data.chargeId, amount: data.amount, method: data.method, paidAt: new Date(`${data.paidAt}T12:00:00.000Z`), receivedById: user.id, note: data.note || null },
      });
      const status = data.amount === outstanding ? "PAID" : "PARTIAL";
      await transaction.charge.update({ where: { id: data.chargeId }, data: { status } });
      await transaction.auditLog.create({ data: { userId: user.id, action: "PAYMENT_CREATE", entity: "Payment", entityId: created.id, meta: { chargeId: data.chargeId, amount: data.amount, method: data.method } } });
      return created;
    });

    revalidatePath("/payments");
    revalidatePath("/finance");
    revalidatePath("/debtors");
    revalidatePath("/reports");
    return { success: true, paymentId: payment.id };
  } catch (error) {
    console.error("Could not record payment", error);
    return { error: "To‘lovni saqlashda xatolik yuz berdi. Qayta urinib ko‘ring." };
  }
}

export async function sendPaymentReminders(studentIds: string[]): Promise<FinanceActionResult> {
  const user = await requireRole("FINANCE");
  if (!studentIds.length || studentIds.length > 100) return { error: "Kamida bitta o‘quvchi tanlang." };

  try {
    const debtors = await db.charge.findMany({ where: { studentId: { in: studentIds } }, include: { student: true, payments: true } });
    const byStudent = new Map<string, { fullName: string; debt: number }>();
    for (const charge of debtors) {
      const debt = getChargeOutstanding(charge);
      const student = byStudent.get(charge.studentId) ?? { fullName: charge.student.fullName, debt: 0 };
      student.debt += debt;
      byStudent.set(charge.studentId, student);
    }
    const month = new Intl.DateTimeFormat("uz-UZ", { month: "long", year: "numeric", timeZone: "Asia/Tashkent" }).format(new Date());
    await db.$transaction(async (transaction) => {
      for (const [studentId, student] of byStudent) {
        if (student.debt <= 0) continue;
        await transaction.message.create({
          data: {
            senderId: user.id,
            recipientId: studentId,
            type: "PAYMENT",
            body: `Hurmatli ${student.fullName}, sizda ${formatMoney(student.debt)} qarzdorlik bor. Iltimos, ${month} oyi to‘lovini amalga oshiring. To‘lov qilgach, Moliya bo‘limiga xabar bering.`,
          },
        });
      }
      await transaction.auditLog.create({ data: { userId: user.id, action: "PAYMENT_REMINDER", entity: "Message", meta: { students: studentIds } } });
    });
    revalidatePath("/messages");
    return { success: true };
  } catch (error) {
    console.error("Could not send reminders", error);
    return { error: "Eslatmalarni yuborishda xatolik yuz berdi." };
  }
}
