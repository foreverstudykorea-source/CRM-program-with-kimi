import { z } from "zod";

export const monthSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Oyni to‘g‘ri tanlang.");

export const chargeSchema = z.object({
  chargeId: z.string().min(1),
  amount: z.coerce.number().int().min(1, "Summa 0 dan katta bo‘lishi kerak.").max(1_000_000_000),
  discount: z.coerce.number().int().min(0, "Chegirma manfiy bo‘lmasligi kerak.").max(1_000_000_000),
}).refine((data) => data.discount < data.amount, { message: "Chegirma umumiy summadan kichik bo‘lishi kerak." });

export const paymentSchema = z.object({
  studentId: z.string().min(1, "O‘quvchini tanlang."),
  chargeId: z.string().min(1, "Oylik hisobni tanlang."),
  amount: z.coerce.number().int().min(1, "To‘lov summasi 0 dan katta bo‘lishi kerak.").max(1_000_000_000),
  method: z.enum(["CASH", "CARD", "CLICK", "PAYME", "BANK_TRANSFER"]),
  paidAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "To‘lov sanasini kiriting."),
  note: z.string().trim().max(500, "Izoh 500 ta belgidan oshmasligi kerak.").optional(),
});

export type PaymentFormValues = z.input<typeof paymentSchema>;
