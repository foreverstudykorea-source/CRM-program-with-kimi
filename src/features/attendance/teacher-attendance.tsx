import Link from "next/link";
import { ArrowRight, CalendarCheck2, CalendarDays, Clock3, MapPin, UsersRound } from "lucide-react";
import type { AuthUser } from "@/features/auth/types";
import type { WeekDay } from "@/generated/prisma/enums";
import { ensureLessonsForGroups } from "@/features/attendance/lessons";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { getTashkentDateValue } from "@/lib/date-time";
import { getServerTime } from "@/lib/server-time";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { getTeacherLocale } from "@/features/i18n/server-locale";
import { teacherText } from "@/features/i18n/teacher-dictionary";

const weekDayLabels: Record<WeekDay, string> = { MONDAY: "Dush", TUESDAY: "Sesh", WEDNESDAY: "Chor", THURSDAY: "Pay", FRIDAY: "Juma", SATURDAY: "Shan", SUNDAY: "Yak" };

export async function TeacherAttendance({ user, date }: { user: AuthUser; date?: string }) {
  const locale = await getTeacherLocale(user);
  const t = (text: string) => teacherText(locale, text);
  const today = getTashkentDateValue(await getServerTime());
  const selectedDate = date ?? today;
  const groups = await db.group.findMany({
    where: { teacherId: user.id, status: "ACTIVE" },
    select: {
      id: true,
      name: true,
      weekDays: true,
      startDate: true,
      startTime: true,
      endTime: true,
      room: true,
      course: { select: { name: true } },
      students: { where: { leftAt: null }, select: { studentId: true } },
    },
    orderBy: { name: "asc" },
  });
  await ensureLessonsForGroups(groups, selectedDate, selectedDate);

  const lessons = await db.lesson.findMany({
    where: { groupId: { in: groups.map((group) => group.id) }, date: new Date(`${selectedDate}T00:00:00.000Z`) },
    select: {
      id: true,
      groupId: true,
      group: {
        select: {
          name: true,
          startTime: true,
          endTime: true,
          room: true,
          course: { select: { name: true } },
          students: { where: { leftAt: null }, select: { studentId: true } },
        },
      },
      attendance: { select: { id: true } },
    },
    orderBy: { group: { startTime: "asc" } },
  });
  const lessonsByGroup = new Map(lessons.map((lesson) => [lesson.groupId, lesson]));

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div><h1 className="text-2xl font-semibold tracking-[-0.025em]">{t("Davomat")}</h1><p className="mt-1.5 text-sm text-muted-foreground">{t("Darslaringiz va barcha guruhlaringiz")} · {formatDate(`${selectedDate}T00:00:00.000Z`)}</p></div>
        <form action="/attendance" className="flex flex-col gap-2 sm:flex-row sm:items-center"><label htmlFor="teacher-attendance-date" className="text-xs font-medium text-muted-foreground sm:mr-2">{t("Sana tanlang")}</label><input id="teacher-attendance-date" type="date" name="date" defaultValue={selectedDate} className="h-11 rounded-lg border border-input bg-card px-3 text-sm" /><Button type="submit" variant="outline">{t("Ko‘rsatish")}</Button>{selectedDate !== today && <Button asChild variant="ghost"><Link href="/attendance">{t("Bugun")}</Link></Button>}</form>
      </div>

      <section>
        <h2 className="mb-3 text-base font-semibold">{t("Tanlangan kundagi darslar")}</h2>
        {lessons.length ? <div className="grid gap-4 xl:grid-cols-2">{lessons.map((lesson) => {
          const studentCount = lesson.group.students.length;
          const isComplete = studentCount > 0 && lesson.attendance.length === studentCount;
          return <Card key={lesson.id} className="p-5"><div className="flex items-start justify-between gap-3"><Badge variant="secondary">{lesson.group.course.name}</Badge><Badge variant={isComplete ? "success" : "warning"}>{isComplete ? t("Davomat olingan") : t("Davomat qilinmagan")}</Badge></div><h3 className="mt-4 text-lg font-semibold leading-7">{lesson.group.name}</h3><div className="mt-4 space-y-2.5 text-sm text-muted-foreground"><p className="flex items-center gap-2"><Clock3 className="size-4" />{lesson.group.startTime}{lesson.group.endTime ? `–${lesson.group.endTime}` : ""}</p><p className="flex items-center gap-2"><MapPin className="size-4" />{lesson.group.room ?? t("Xona ko‘rsatilmagan")}</p><p className="flex items-center gap-2"><UsersRound className="size-4" />{studentCount} {t("o‘quvchi")} · {lesson.attendance.length} {t("belgilandi")}</p></div><Button asChild size="lg" className="mt-5 w-full"><Link href={`/attendance/${lesson.id}`}>{isComplete ? t("Davomatni ko‘rish") : t("Davomat qilish")}<ArrowRight /></Link></Button></Card>;
        })}</div> : <EmptyState icon={CalendarCheck2} title={t("Bu sanada dars yo‘q")} description={t("Tanlangan kunda guruhlaringizda dars rejalashtirilmagan. Boshqa sanani tanlab ko‘ring yoki barcha guruhlaringiz jadvalini tekshiring.")} action={<Button asChild variant="outline"><Link href="/attendance">{t("Bugungi darslar")}</Link></Button>} />}
      </section>

      <section>
        <div className="mb-3 flex items-center gap-2"><h2 className="text-base font-semibold">{t("Barcha guruhlarim")}</h2><Badge variant="secondary">{groups.length} {t("guruh")}</Badge></div>
        {groups.length ? <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">{groups.map((group) => {
          const lesson = lessonsByGroup.get(group.id);
          return <Card key={group.id} className="p-4"><div className="flex items-start justify-between gap-2"><Badge variant="secondary">{group.course.name}</Badge><span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><UsersRound className="size-3.5" />{group.students.length}</span></div><h3 className="mt-3 text-sm font-semibold leading-6">{group.name}</h3><div className="mt-3 space-y-2 text-xs text-muted-foreground"><p className="flex items-center gap-2"><CalendarDays className="size-3.5" />{group.weekDays.map((day) => weekDayLabels[day]).join(" · ")}</p><p className="flex items-center gap-2"><Clock3 className="size-3.5" />{group.startTime}{group.endTime ? `–${group.endTime}` : ""} · {group.room ?? t("Xona yo‘q")}</p></div><div className="mt-4 border-t border-border pt-3">{lesson ? <Button asChild size="sm" variant="outline" className="w-full"><Link href={`/attendance/${lesson.id}`}>{t("Tanlangan kundagi dars")}<ArrowRight /></Link></Button> : <p className="text-xs text-muted-foreground">{t("Tanlangan kunda dars yo‘q.")}</p>}</div></Card>;
        })}</div> : <EmptyState icon={UsersRound} title={t("Guruh biriktirilmagan")} description={t("Administrator sizga guruh biriktirganda, u shu yerda ko‘rinadi.")} />}
      </section>
    </div>
  );
}
