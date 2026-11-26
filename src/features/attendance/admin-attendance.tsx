import Link from "next/link";
import type { AttendanceStatus } from "@/generated/prisma/enums";
import { AlertTriangle, ArrowRight, CalendarCheck2, CalendarX2, CheckCircle2, ClipboardX, UsersRound } from "lucide-react";
import { ensureLessonsForGroups } from "@/features/attendance/lessons";
import { AttendanceStatusBadge } from "@/features/attendance/attendance-status-badge";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { getTashkentDateValue } from "@/lib/date-time";
import { getServerTime } from "@/lib/server-time";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";

export type AttendanceFilters = { groupId?: string; teacherId?: string; from: string; to: string };

function KpiCard({ title, value, detail, icon: Icon, tone = "default" }: { title: string; value: string | number; detail: string; icon: typeof UsersRound; tone?: "default" | "success" | "danger" | "warning" }) {
  const colors = { default: "bg-primary/10 text-primary", success: "bg-success/10 text-success", danger: "bg-destructive/10 text-destructive", warning: "bg-warning/10 text-warning" };
  return <Card className="p-4"><div className="flex items-start justify-between"><div><p className="text-xs font-medium text-muted-foreground">{title}</p><p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p></div><span className={`flex size-9 items-center justify-center rounded-lg ${colors[tone]}`}><Icon className="size-4" /></span></div></Card>;
}

export async function AdminAttendance({ filters }: { filters: AttendanceFilters }) {
  const today = getTashkentDateValue(await getServerTime());
  const [groups, teachers, activeStudents] = await Promise.all([
    db.group.findMany({ where: { status: "ACTIVE" }, select: { id: true, name: true, teacherId: true, weekDays: true, startDate: true }, orderBy: { name: "asc" } }),
    db.user.findMany({ where: { role: "TEACHER", jobTitle: "Ustoz", isActive: true }, select: { id: true, fullName: true }, orderBy: { fullName: "asc" } }),
    db.user.count({ where: { role: "STUDENT", studentProfile: { status: "ACTIVE" } } }),
  ]);
  const scheduledGroups = groups.filter((group) => (!filters.groupId || group.id === filters.groupId) && (!filters.teacherId || group.teacherId === filters.teacherId));
  await ensureLessonsForGroups(scheduledGroups, filters.from, filters.to);

  const lessons = await db.lesson.findMany({
    where: {
      groupId: { in: scheduledGroups.map((group) => group.id) },
      date: { gte: new Date(`${filters.from}T00:00:00.000Z`), lte: new Date(`${filters.to}T00:00:00.000Z`) },
    },
    select: {
      id: true,
      date: true,
      group: {
        select: {
          name: true,
          startTime: true,
          course: { select: { name: true } },
          teacher: { select: { fullName: true } },
          students: { where: { leftAt: null }, select: { studentId: true } },
        },
      },
      attendance: { select: { studentId: true, status: true, note: true, student: { select: { fullName: true } } } },
    },
    orderBy: [{ date: "desc" }, { group: { startTime: "asc" } }],
  });

  const records = lessons.flatMap((lesson) => lesson.attendance.map((record) => ({ ...record, lesson })));
  const expected = lessons.reduce((total, lesson) => total + lesson.group.students.length, 0);
  const presentLate = records.filter((record) => record.status === "PRESENT" || record.status === "LATE").length;
  const absentRecords = records.filter((record) => record.status === "ABSENT");
  const incompleteLessons = lessons.filter((lesson) => lesson.attendance.length < lesson.group.students.length).length;
  const attendanceRate = records.length ? Math.round((presentLate / records.length) * 100) : 0;

  const streakRecords = await db.attendance.findMany({
    where: { student: { studentProfile: { status: "ACTIVE" } }, lesson: { date: { lte: new Date(`${today}T00:00:00.000Z`) } } },
    select: { studentId: true, status: true, lesson: { select: { date: true } } },
    orderBy: [{ studentId: "asc" }, { lesson: { date: "desc" } }],
  });
  const history = new Map<string, AttendanceStatus[]>();
  for (const record of streakRecords) {
    const items = history.get(record.studentId) ?? [];
    if (items.length < 3) items.push(record.status);
    history.set(record.studentId, items);
  }
  const flaggedIds = new Set([...history.entries()].filter(([, statuses]) => statuses.length === 3 && statuses.every((status) => status === "ABSENT")).map(([id]) => id));

  const studentStats = new Map<string, { name: string; groups: Set<string>; teacher: string; total: number; presentLate: number; absent: number }>();
  for (const record of records) {
    const stat = studentStats.get(record.studentId) ?? { name: record.student.fullName, groups: new Set<string>(), teacher: record.lesson.group.teacher.fullName, total: 0, presentLate: 0, absent: 0 };
    stat.groups.add(record.lesson.group.name);
    stat.total += 1;
    if (record.status === "PRESENT" || record.status === "LATE") stat.presentLate += 1;
    if (record.status === "ABSENT") stat.absent += 1;
    studentStats.set(record.studentId, stat);
  }
  const stats = [...studentStats.entries()].sort(([, a], [, b]) => a.presentLate / a.total - b.presentLate / b.total || b.absent - a.absent);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold tracking-[-0.025em]">Davomat nazorati</h1><p className="mt-1.5 text-sm text-muted-foreground">Darslar, kelmagan o‘quvchilar va guruhlar bo‘yicha umumiy holat.</p></div>

      <form action="/attendance" className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2 xl:grid-cols-[1.4fr_1.2fr_1fr_1fr_auto]">
        <select name="groupId" defaultValue={filters.groupId ?? ""} className="h-11 rounded-lg border border-input bg-card px-3 text-sm" aria-label="Guruh"><option value="">Barcha guruhlar</option>{groups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}</select>
        <select name="teacherId" defaultValue={filters.teacherId ?? ""} className="h-11 rounded-lg border border-input bg-card px-3 text-sm" aria-label="Ustoz"><option value="">Barcha ustozlar</option>{teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.fullName}</option>)}</select>
        <label className="sr-only" htmlFor="attendance-from">Boshlanish sanasi</label><input id="attendance-from" type="date" name="from" defaultValue={filters.from} className="h-11 rounded-lg border border-input bg-card px-3 text-sm" />
        <label className="sr-only" htmlFor="attendance-to">Tugash sanasi</label><input id="attendance-to" type="date" name="to" defaultValue={filters.to} className="h-11 rounded-lg border border-input bg-card px-3 text-sm" />
        <Button type="submit">Ko‘rsatish</Button>
      </form>

      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border p-4"><h2 className="text-base font-semibold">Kelmagan o‘quvchilar</h2><p className="mt-1 text-xs text-muted-foreground">“Kelmadi” deb belgilangan o‘quvchilar.</p></div>
        {absentRecords.length ? <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-border bg-muted/70 text-xs text-muted-foreground"><tr><th className="h-10 px-4 font-medium">O‘quvchi</th><th className="h-10 px-4 font-medium">Guruh</th><th className="h-10 px-4 font-medium">Ustoz</th><th className="h-10 px-4 font-medium">Sana</th><th className="h-10 px-4 font-medium">Holat</th><th className="h-10 px-4 font-medium">Izoh</th></tr></thead><tbody className="divide-y divide-border">{absentRecords.map((record) => <tr key={`${record.lesson.id}-${record.studentId}`}><td className="px-4 py-3 font-medium">{record.student.fullName}</td><td className="px-4 py-3 text-muted-foreground">{record.lesson.group.name}</td><td className="px-4 py-3 text-muted-foreground">{record.lesson.group.teacher.fullName}</td><td className="px-4 py-3 whitespace-nowrap tabular-nums text-muted-foreground">{formatDate(record.lesson.date)}</td><td className="px-4 py-3"><AttendanceStatusBadge status="ABSENT" /></td><td className="px-4 py-3 text-xs text-muted-foreground">{record.note || "—"}</td></tr>)}</tbody></table></div> : <div className="p-8 text-center text-sm text-muted-foreground">Tanlangan davrda “Kelmadi” holati qayd etilmagan.</div>}
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Faol o‘quvchilar" value={activeStudents} detail="Joriy faol o‘quvchilar" icon={UsersRound} />
        <KpiCard title="Bugungi davomat" value={`${attendanceRate}%`} detail={`${presentLate} / ${records.length} keldi yoki kechikdi`} icon={CheckCircle2} tone="success" />
        <KpiCard title="Kelmaganlar" value={absentRecords.length} detail="Tanlangan davrda" icon={CalendarX2} tone="danger" />
        <KpiCard title="Davomat qilinmagan" value={incompleteLessons} detail={`${expected} kutilayotgan yozuv`} icon={ClipboardX} tone="warning" />
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between"><h2 className="text-base font-semibold">Darslar holati</h2><span className="text-xs text-muted-foreground">{formatDate(`${filters.from}T00:00:00.000Z`)}{filters.from !== filters.to ? ` — ${formatDate(`${filters.to}T00:00:00.000Z`)}` : ""}</span></div>
        {lessons.length ? <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">{lessons.map((lesson) => {
          const expectedCount = lesson.group.students.length;
          const complete = expectedCount > 0 && lesson.attendance.length === expectedCount;
          return <Card key={lesson.id} className="p-4"><div className="flex items-start justify-between gap-2"><Badge variant="secondary">{lesson.group.course.name}</Badge><Badge variant={complete ? "success" : "warning"}>{complete ? "Olingan" : "Kutilmoqda"}</Badge></div><h3 className="mt-3 text-sm font-semibold leading-6">{lesson.group.name}</h3><p className="mt-2 text-xs text-muted-foreground">{formatDate(lesson.date)} · {lesson.group.startTime} · {lesson.group.teacher.fullName}</p><div className="mt-4 flex items-center justify-between"><span className="text-xs tabular-nums text-muted-foreground">{lesson.attendance.length} / {expectedCount} belgilandi</span><Button asChild size="sm" variant="outline"><Link href={`/attendance/${lesson.id}`}>Ko‘rish<ArrowRight /></Link></Button></div></Card>;
        })}</div> : <EmptyState icon={CalendarCheck2} title="Dars topilmadi" description="Tanlangan guruh, ustoz yoki sana oralig‘ida darslar mavjud emas." action={<Button asChild variant="outline"><Link href="/attendance">Bugungi davomat</Link></Button>} />}
      </section>

      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border p-4"><div className="flex items-center gap-2"><h2 className="text-base font-semibold">O‘quvchilar davomat foizi</h2>{flaggedIds.size > 0 && <Badge variant="destructive"><AlertTriangle />{flaggedIds.size} ogohlantirish</Badge>}</div><p className="mt-1 text-xs text-muted-foreground">Foiz va ketma-ket 3+ dars kelmaganlar bayrog‘i.</p></div>
        {stats.length ? <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-border bg-muted/70 text-xs text-muted-foreground"><tr><th className="h-10 px-4 font-medium">O‘quvchi</th><th className="h-10 px-4 font-medium">Guruh</th><th className="h-10 px-4 font-medium">Davomat</th><th className="h-10 px-4 font-medium">Kelmadi</th><th className="h-10 px-4 font-medium">Bayroq</th></tr></thead><tbody className="divide-y divide-border">{stats.map(([studentId, stat]) => {
          const percentage = Math.round((stat.presentLate / stat.total) * 100);
          return <tr key={studentId}><td className="px-4 py-3 font-medium">{stat.name}</td><td className="px-4 py-3 text-xs text-muted-foreground">{[...stat.groups].join(", ")}</td><td className="px-4 py-3"><div className="flex items-center gap-3"><div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-success" style={{ width: `${percentage}%` }} /></div><span className="text-xs font-medium tabular-nums">{percentage}%</span></div></td><td className="px-4 py-3 tabular-nums">{stat.absent} dars</td><td className="px-4 py-3">{flaggedIds.has(studentId) ? <Badge variant="destructive"><AlertTriangle />3+ ketma-ket</Badge> : <span className="text-muted-foreground">—</span>}</td></tr>;
        })}</tbody></table></div> : <div className="p-8 text-center text-sm text-muted-foreground">Foiz hisoblash uchun davomat yozuvlari kerak.</div>}
      </section>
    </div>
  );
}
