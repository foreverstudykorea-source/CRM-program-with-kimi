import "server-only";

import { addDays, dateFromValue, getWeekDay, isDateValue } from "@/lib/date-time";
import { db } from "@/lib/db";
import type { WeekDay } from "@/generated/prisma/enums";

type ScheduledGroup = {
  id: string;
  weekDays: WeekDay[];
  startDate: Date;
};

export async function ensureLessonsForGroups(groups: ScheduledGroup[], from: string, to: string) {
  if (!groups.length || !isDateValue(from) || !isDateValue(to) || from > to) return;

  const lessons: { groupId: string; date: Date }[] = [];
  for (const group of groups) {
    const groupStart = group.startDate.toISOString().slice(0, 10);
    let current = from < groupStart ? groupStart : from;
    let generated = 0;
    while (current <= to && generated < 120) {
      if (group.weekDays.includes(getWeekDay(current))) {
        lessons.push({ groupId: group.id, date: dateFromValue(current) });
      }
      current = addDays(current, 1);
      generated += 1;
    }
  }

  if (lessons.length) {
    await db.lesson.createMany({ data: lessons, skipDuplicates: true });
  }
}
