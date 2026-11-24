import { z } from "zod";

const homeworkFields = {
  groupId: z.string().min(1, "Guruhni tanlang."),
  title: z.string().trim().min(3, "Sarlavha kamida 3 ta belgidan iborat bo‘lsin.").max(120, "Sarlavha 120 ta belgidan oshmasligi kerak."),
  description: z.string().trim().min(10, "Vazifa tavsifi kamida 10 ta belgidan iborat bo‘lsin.").max(3000, "Tavsif 3000 ta belgidan oshmasligi kerak."),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Muddatni to‘g‘ri sanada kiriting.").refine((value) => !Number.isNaN(Date.parse(`${value}T00:00:00.000Z`)), "Muddat sanasi noto‘g‘ri."),
  attachmentUrl: z.string().trim().max(500, "Havola 500 ta belgidan oshmasligi kerak.").refine((value) => {
    if (!value) return true;
    try {
      const url = new URL(value);
      return url.protocol === "https:" || url.protocol === "http:";
    } catch {
      return false;
    }
  }, "Havola http:// yoki https:// bilan boshlanishi kerak."),
};

export const homeworkSchema = z.object(homeworkFields);
export const homeworkFormSchema = z.object({ ...homeworkFields, attachment: z.any().optional() });
export type HomeworkFormValues = z.input<typeof homeworkFormSchema>;
