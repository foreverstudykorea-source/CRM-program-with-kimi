import type { WeekDay } from "@/generated/prisma/enums";

export function getTashkentDateValue(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Tashkent",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function dateFromValue(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

export function addDays(value: string, amount: number) {
  const date = dateFromValue(value);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

export function isDateValue(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return !Number.isNaN(dateFromValue(value).getTime());
}

export function getWeekDay(value: string): WeekDay {
  const days: WeekDay[] = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
  return days[dateFromValue(value).getUTCDay()];
}
