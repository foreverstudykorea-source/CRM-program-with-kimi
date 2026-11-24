import { z } from "zod";

export const attendanceEntrySchema = z.object({
  studentId: z.string().min(1),
  status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"]),
  note: z.string().trim().max(500, "Izoh 500 ta belgidan oshmasligi kerak.").nullable(),
});

export const saveAttendanceSchema = z.object({
  lessonId: z.string().min(1),
  entries: z.array(attendanceEntrySchema).min(1, "O‘quvchilar ro‘yxati bo‘sh.").max(100),
});
