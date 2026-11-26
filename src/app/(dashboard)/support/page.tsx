import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CalendarClock, Clock3, UserRound, UsersRound } from "lucide-react";
import { requireUser } from "@/features/auth/session";
import { ensureLessonsForGroups } from "@/features/attendance/lessons";
import { getSupportStartTime } from "@/features/support/utils";
import { SupportSignupButton } from "@/features/support/support-signup-button";
import { db } from "@/lib/db";
import { addDays, getTashkentDateValue } from "@/lib/date-time";
import { getServerTime } from "@/lib/server-time";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";

export const metadata: Metadata = { title: "Support darslari" };

export default async function SupportPage() {
  const user = await requireUser();
  const isStudent = user.role === "STUDENT";
  const isSupportTeacher = user.role === "TEACHER" && user.jobTitle !== "Ustoz";
  if (!isStudent && !isSupportTeacher) redirect("/");

  const today = getTashkentDateValue(await getServerTime());
  const endDate = addDays(today, 14);
  const groups = await db.group.findMany({
    where: { status: "ACTIVE", ...(isStudent ? { students: { some: { studentId: user.id, leftAt: null } } } : {}) },
    select: { id: true, weekDays: true, startDate: true },
  });
  await ensureLessonsForGroups(groups, today, endDate);

  const lessons = await db.lesson.findMany({
    where: {
      groupId: { in: groups.map((group) => group.id) },
      date: { gte: new Date(`${today}T00:00:00.000Z`), lte: new Date(`${endDate}T00:00:00.000Z`) },
    },
    select: {
      id: true,
      date: true,
      group: {
        select: {
          name: true,
          startTime: true,
          endTime: true,
          course: { select: { name: true } },
          teacher: { select: { fullName: true } },
        },
      },
      supportSignups: { select: { studentId: true, student: { select: { fullName: true } } } },
    },
    orderBy: [{ date: "asc" }, { group: { startTime: "asc" } }],
  });

  return (
    <div>
      <div className="mb-6"><h1 className="text-2xl font-semibold tracking-[-0.025em]">Support darslari</h1><p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted-foreground">{isSupportTeacher ? "Barcha ustozlarning guruhlari. Support darsda davomat olinmaydi." : "Darsdan 5 daqiqa keyin boshlanadigan ixtiyoriy support darslarga yoziling."}</p></div>
      {lessons.length ? <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">{lessons.map((lesson) => {
        const supportStart = getSupportStartTime(lesson.group.endTime);
        const signedUp = lesson.supportSignups.some((signup) => signup.studentId === user.id);
        return <Card key={lesson.id} className="flex h-full flex-col p-5"><div className="flex items-start justify-between gap-2"><Badge variant="secondary">{lesson.group.course.name}</Badge>{supportStart && <Badge variant="default"><Clock3 />Support {supportStart}</Badge>}</div><h2 className="mt-4 text-base font-semibold leading-6">{lesson.group.name}</h2><div className="mt-3 space-y-2 text-xs text-muted-foreground"><p className="flex items-center gap-2"><CalendarClock className="size-4" />{formatDate(lesson.date)} · {lesson.group.startTime}–{lesson.group.endTime}</p><p className="flex items-center gap-2"><UserRound className="size-4" />{lesson.group.teacher.fullName}</p></div>{isSupportTeacher ? <div className="mt-4 flex-1 border-t border-border pt-4"><div className="mb-2 flex items-center gap-2 text-xs font-medium"><UsersRound className="size-4 text-muted-foreground" />{lesson.supportSignups.length} o‘quvchi supportda</div>{lesson.supportSignups.length ? <ul className="space-y-1.5 text-xs text-muted-foreground">{lesson.supportSignups.slice(0, 6).map((signup) => <li key={signup.studentId}>· {signup.student.fullName}</li>)}{lesson.supportSignups.length > 6 && <li>+ yana {lesson.supportSignups.length - 6} o‘quvchi</li>}</ul> : <p className="text-xs text-muted-foreground">Hozircha o‘quvchi yozilmagan.</p>}</div> : <div className="mt-4 flex-1"><p className="text-xs text-muted-foreground">{signedUp ? "Siz support darsga yozilgansiz." : "Support ixtiyoriy, davomat olinmaydi."}</p></div>}<div className="mt-4">{isStudent && <SupportSignupButton lessonId={lesson.id} initialSignedUp={signedUp} />}</div></Card>;
      })}</div> : <EmptyState icon={CalendarClock} title="Support darslar yo‘q" description="Yaqin kunlarda sizning guruhingizga support darslar rejalashtirilmagan." />}
    </div>
  );
}
