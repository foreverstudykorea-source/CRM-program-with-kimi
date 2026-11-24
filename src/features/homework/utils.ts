import type { HomeworkStatus } from "@/features/homework/types";
import { getTashkentDateValue } from "@/lib/date-time";

export function getHomeworkStatus(dueDate: Date | string, now = new Date()): HomeworkStatus {
  const dateOnly = new Date(dueDate).toISOString().slice(0, 10);
  const dueDayEnd = new Date(`${dateOnly}T19:00:00.000Z`);
  if (now > dueDayEnd) return "OVERDUE";
  if (dueDayEnd.getTime() - now.getTime() <= 48 * 60 * 60 * 1000) return "DUE_SOON";
  return "NEW";
}

export const getTashkentDateInputValue = getTashkentDateValue;

export const homeworkStatusLabels: Record<HomeworkStatus, string> = {
  NEW: "Yangi",
  DUE_SOON: "Muddati yaqin",
  OVERDUE: "Muddati o‘tgan",
};
