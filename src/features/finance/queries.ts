import "server-only";

import { db } from "@/lib/db";
import { getChargeOutstanding, monthDate, nextMonth } from "@/features/finance/utils";

export { getChargeOutstanding, getMonthValue, monthDate, nextMonth } from "@/features/finance/utils";

export async function getMonthlySummary(month: string) {
  const [charges, payments] = await Promise.all([
    db.charge.findMany({ where: { month: monthDate(month) }, include: { payments: true } }),
    db.payment.findMany({ where: { paidAt: { gte: monthDate(month), lt: nextMonth(month) } } }),
  ]);
  const expected = charges.reduce((total, charge) => total + charge.amount - charge.discount, 0);
  const collected = payments.reduce((total, payment) => total + payment.amount, 0);
  const allCharges = await db.charge.findMany({ include: { payments: true } });
  const debt = allCharges.reduce((total, charge) => total + getChargeOutstanding(charge), 0);
  return { expected, collected, debt, collectionRate: expected ? Math.round((collected / expected) * 100) : 0 };
}

export async function getDebtors() {
  const charges = await db.charge.findMany({
    include: {
      student: { select: { id: true, fullName: true, phone: true } },
      group: { select: { name: true, course: { select: { name: true } } } },
      payments: true,
    },
  });
  const students = new Map<string, { id: string; fullName: string; phone: string; groups: Set<string>; debt: number; months: Set<string> }>();
  for (const charge of charges) {
    const outstanding = getChargeOutstanding(charge);
    if (!outstanding) continue;
    const student = students.get(charge.studentId) ?? { id: charge.student.id, fullName: charge.student.fullName, phone: charge.student.phone, groups: new Set<string>(), debt: 0, months: new Set<string>() };
    student.debt += outstanding;
    student.groups.add(charge.group.name);
    student.months.add(charge.month.toISOString().slice(0, 7));
    students.set(charge.studentId, student);
  }
  return [...students.values()].sort((a, b) => b.debt - a.debt || a.fullName.localeCompare(b.fullName));
}

export async function getRevenueMonths(count = 12) {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (count - 1), 1));
  const payments = await db.payment.findMany({ where: { paidAt: { gte: start } }, select: { amount: true, paidAt: true } });
  const labels = ["Yan", "Fev", "Mar", "Apr", "May", "Iyun", "Iyul", "Avg", "Sen", "Okt", "Noy", "Dek"];
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + index, 1));
    const next = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1));
    return {
      month: `${labels[date.getUTCMonth()]} ${String(date.getUTCFullYear()).slice(2)}`,
      value: payments.filter((payment) => payment.paidAt >= date && payment.paidAt < next).reduce((total, payment) => total + payment.amount, 0),
    };
  });
}
