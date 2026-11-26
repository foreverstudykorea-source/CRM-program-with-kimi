import type { ChargeModel, PaymentModel } from "@/generated/prisma/models";

export function getChargeOutstanding(charge: ChargeModel & { payments: PaymentModel[] }) {
  return Math.max(0, charge.amount - charge.discount - charge.payments.reduce((total, payment) => total + payment.amount, 0));
}

export function getMonthValue(date = new Date()) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function monthDate(value: string) {
  return new Date(`${value}-01T00:00:00.000Z`);
}

export function nextMonth(value: string) {
  const date = monthDate(value);
  date.setUTCMonth(date.getUTCMonth() + 1);
  return date;
}
