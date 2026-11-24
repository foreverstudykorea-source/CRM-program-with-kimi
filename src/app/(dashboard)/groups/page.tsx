import type { Metadata } from "next";
import { CalendarDays, Clock3, MapPin, UserRound, UsersRound } from "lucide-react";
import type { WeekDay } from "@/generated/prisma/enums";
import { requireRole } from "@/features/auth/session";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = { title: "Guruhlar" };

const weekDayLabels: Record<WeekDay, string> = { MONDAY: "Dush", TUESDAY: "Sesh", WEDNESDAY: "Chor", THURSDAY: "Pay", FRIDAY: "Juma", SATURDAY: "Shan", SUNDAY: "Yak" };

export default async function GroupsPage() {
  const user = await requireRole("ADMIN", "TEACHER");
  const isTeacher = user.role === "TEACHER";
  const groups = await db.group.findMany({
    where: { status: "ACTIVE", ...(isTeacher ? { teacherId: user.id } : {}) },
    select: {
      id: true,
      name: true,
      weekDays: true,
      startTime: true,
      endTime: true,
      room: true,
      startDate: true,
      course: { select: { name: true } },
      teacher: { select: { fullName: true } },
      students: { where: { leftAt: null }, select: { student: { select: { id: true, fullName: true } } }, orderBy: { joinedAt: "asc" } },
      lessons: { select: { attendance: { select: { studentId: true, status: true } } } },
    },
    orderBy: [{ teacher: { fullName: "asc" } }, { name: "asc" }],
  });
  const studentCount = groups.reduce((total, group) => total + group.students.length, 0);

  return (
    <div>
      <PageHeader title={isTeacher ? "Guruhlarim" : "Guruhlar"} description={isTeacher ? "Sizga biriktirilgan faol guruhlar va o‘quvchilar ro‘yxati." : "Ustoz, dars jadvali va o‘quvchilar bo‘yicha barcha faol guruhlar."} action={<Badge variant="secondary" className="px-3 py-1.5"><UsersRound />{groups.length} guruh · {studentCount} o‘quvchi</Badge>} />
      {groups.length ? <div className="grid gap-4 xl:grid-cols-2">{groups.map((group) => <Card key={group.id} className="p-5"><div className="flex items-start justify-between gap-3"><div><Badge variant="default">{group.course.name}</Badge><h2 className="mt-3 text-base font-semibold leading-6">{group.name}</h2></div><Badge variant="success">{group.students.length} o‘quvchi</Badge></div><div className="mt-4 grid gap-2.5 text-sm text-muted-foreground sm:grid-cols-2"><p className="flex items-center gap-2"><UserRound className="size-4" />{group.teacher.fullName}</p><p className="flex items-center gap-2"><CalendarDays className="size-4" />{group.weekDays.map((day) => weekDayLabels[day]).join(" · ")}</p><p className="flex items-center gap-2"><Clock3 className="size-4" />{group.startTime}{group.endTime ? `–${group.endTime}` : ""}</p><p className="flex items-center gap-2"><MapPin className="size-4" />{group.room ?? "Xona ko‘rsatilmagan"}</p></div><div className="mt-5 border-t border-border pt-4"><div className="mb-3 flex items-center justify-between text-xs text-muted-foreground"><span>O‘quvchilar</span><span>Boshlanish: {formatDate(group.startDate)}</span></div>{group.students.length ? <ul className="space-y-2">{group.students.slice(0, 5).map((membership) => {
  const records = group.lessons.flatMap((lesson) => lesson.attendance).filter((record) => record.studentId === membership.student.id);
  const attended = records.filter((record) => record.status === "PRESENT" || record.status === "LATE").length;
  return <li key={membership.student.id} className="flex items-center gap-2 text-sm"><span className="size-1.5 rounded-full bg-primary/60" /><span className="flex-1">{membership.student.fullName}</span><span className="text-xs tabular-nums text-muted-foreground">{records.length ? `${Math.round((attended / records.length) * 100)}%` : "—"}</span></li>;
})}{group.students.length > 5 && <li className="pl-3.5 text-xs font-medium text-muted-foreground">+ yana {group.students.length - 5} o‘quvchi</li>}</ul> : <p className="text-sm text-muted-foreground">Hozircha faol o‘quvchi yo‘q. “Nomalum” o‘quvchilar guruhga qo‘shilmagan.</p>}</div></Card>)}</div> : <EmptyState icon={UsersRound} title="Guruh biriktirilmagan" description="Sizga faol guruh biriktirilganda, u o‘quvchilar va dars jadvali bilan shu yerda ko‘rinadi." />}
    </div>
  );
}
