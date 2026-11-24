import type { AttendanceStatus } from "@/generated/prisma/enums";

export type AttendanceEntry = {
  studentId: string;
  status: AttendanceStatus;
  note: string | null;
};

export type AttendanceStudent = {
  studentId: string;
  fullName: string;
  status: AttendanceStatus | null;
  note: string | null;
};

export type AttendanceActionResult = {
  error?: string;
  success?: boolean;
};

export const attendanceStatusLabels: Record<AttendanceStatus, string> = {
  PRESENT: "Keldi",
  ABSENT: "Kelmadi",
  LATE: "Kechikdi",
  EXCUSED: "Sababli",
};
