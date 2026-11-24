import Link from "next/link";
import { ArrowRight, CalendarCheck2, CalendarDays, Clock3, MapPin, UsersRound } from "lucide-react";
import type { AuthUser } from "@/features/auth/types";
import { ensureLessonsForGroups } from "@/features/attendance/lessons";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { getTashkentDateValue } from "@/lib/date-time";
import { getServerTime } from "@/lib/server-time";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";

export async function TeacherAttendance({ user }: { user: AuthUser }) {
  const today = getTashkentDateValue(await getServerTime());
  const groups = await db.group.findMany({
    where: { teacherId: user.id, status: "ACTIVE" },
    select: { id: true, name: true, weekDays: true, startDate: true },
    orderBy: { name: "asc" },
  });
  await ensureLessonsForGroups(groups, today, today);

  const lessons = await db.lesson.findMany({
    where: { groupId: { in: groups.map((group) => group.id) }, date: new Date(`${today}T00:00:00.000Z`) },
    select: {
      id: true,
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

  return (
    <div>
      <div className="mb-6"><h1 className="text-2xl font-semibold tracking-[-0.025em]">Davomat</h1><p className="mt-1.5 text-sm text-muted-foreground">Bugungi darslaringiz va davomat holati · {formatDate(`${today}T00:00:00.000Z`)}</p></div>
      {lessons.length ? <div className="grid gap-4 xl:grid-cols-2">{lessons.map((lesson) => {
        const studentCount = lesson.group.students.length;
        const isComplete = studentCount > 0 && lesson.attendance.length === studentCount;
        return <Card key={lesson.id} className="p-5"><div className="flex items-start justify-between gap-3"><Badge variant="secondary">{lesson.group.course.name}</Badge><Badge variant={isComplete ? "success" : "warning"}>{isComplete ? "Davomat olingan" : "Davomat qilinmagan"}</Badge></div><h2 className="mt-4 text-lg font-semibold leading-7">{lesson.group.name}</h2><div className="mt-4 space-y-2.5 text-sm text-muted-foreground"><p className="flex items-center gap-2"><Clock3 className="size-4" />{lesson.group.startTime}{lesson.group.endTime ? `–${lesson.group.endTime}` : ""}</p><p className="flex items-center gap-2"><MapPin className="size-4" />{lesson.group.room ?? "Xona ko‘rsatilmagan"}</p><p className="flex items-center gap-2"><UsersRound className="size-4" />{studentCount} o‘quvchi · {lesson.attendance.length} belgilandi</p></div><Button asChild size="lg" className="mt-5 w-full"><Link href={`/attendance/${lesson.id}`}>{isComplete ? "Davomatni ko‘rish" : "Davomat qilish"}<ArrowRight /></Link></Button></Card>;
      })}</div> : <EmptyState icon={CalendarCheck2} title="Bugun dars yo‘q" description="Dars jadvalingizga ko‘ra bugun guruhlaringizda dars rejalashtirilmagan. Keyingi darslarni “Guruhlarim” sahifasidan ko‘rishingiz mumkin." action={<Button asChild variant="outline"><Link href="/groups"><CalendarDays />Guruhlarim</Link></Button>} />}
    </div>
  );
}
