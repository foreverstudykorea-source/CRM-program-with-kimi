import type { ChargeStatus, PaymentMethod } from "@/generated/prisma/enums";

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  CASH: "Naqd",
  CARD: "Karta",
  CLICK: "Click",
  PAYME: "Payme",
  BANK_TRANSFER: "Bank o‘tkazmasi",
};

export const chargeStatusLabels: Record<ChargeStatus, string> = {
  PAID: "To‘langan",
  PARTIAL: "Qisman",
  UNPAID: "Qarzdor",
};

const months = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];

export function formatMonth(date: Date | string) {
  const value = new Date(date);
  return `${months[value.getUTCMonth()]} ${value.getUTCFullYear()}`;
}
