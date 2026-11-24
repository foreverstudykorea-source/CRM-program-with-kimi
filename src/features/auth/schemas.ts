import { z } from "zod";

export const phoneSchema = z
  .string({ error: "Telefon raqamni kiriting." })
  .transform((value) => value.replace(/\D/g, ""))
  .refine((value) => /^998\d{9}$/.test(value), {
    message: "Telefon raqamni +998 XX XXX XX XX formatida kiriting.",
  })
  .transform((value) => `+${value}`);

export const loginSchema = z.object({
  phone: phoneSchema,
  password: z
    .string({ error: "Parolni kiriting." })
    .min(1, "Parolni kiriting.")
    .min(8, "Parol kamida 8 ta belgidan iborat bo‘lishi kerak.")
    .max(72, "Parol 72 ta belgidan oshmasligi kerak."),
});

export type LoginFormValues = z.input<typeof loginSchema>;
export type LoginActionResult = { error: string } | undefined;
