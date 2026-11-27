import { z } from "zod";
import { phoneSchema } from "@/features/auth/schemas";

export const createStudentSchema = z.object({
  fullName: z.string().trim().min(3, "To‘liq ismni kiriting.").max(100, "Ism 100 ta belgidan oshmasligi kerak."),
  phone: phoneSchema,
  password: z.string().min(8, "Parol kamida 8 ta belgidan iborat bo‘lsin.").max(72, "Parol 72 ta belgidan oshmasligi kerak."),
  groupId: z.string().optional(),
  joinedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Dars boshlagan sanani kiriting."),
});

export type CreateStudentValues = z.input<typeof createStudentSchema>;
