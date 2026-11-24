import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { BookOpen, CalendarDays, Clock3, MapPin, UsersRound } from "lucide-react";
import { requireUser } from "@/features/auth/session";
import { canEditLesson, getAuthorizedLesson } from "@/features/attendance/authorization";
import { AttendanceForm } from "@/features/attendance/attendance-form";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Davomat belgilash" };

export default async function LessonAttendancePage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const user = await requireUser();
  if (user.role !== "TEACHER" && user.role !== "ADMIN") redirect("/");
  if (user.role === "TEACHER" && user.jobTitle !== "Ustoz") redirect("/");

  const lesson = await getAuthorizedLesson(user, lessonId);
  if (!lesson) notFound();
  const dateValue = lesson.date.toISOString().slice(0, 10);
  const [members, records] = await Promise.all([
    db.groupStudent.findMany({
      where: {
        groupId: lesson.groupId,
        joinedAt: { lte: new Date(`${dateValue}T18:59:59.999Z`) },
        OR: [{ leftAt: null }, { leftAt: { gte: new Date(`${dateValue}T00:00:00.000Z`) } }],
      },
      select: { student: { select: { id: true, fullName: true } } },
      orderBy: { student: { fullName: "asc" } },
    }),
    db.attendance.findMany({ where: { lessonId: lesson.id }, select: { studentId: true, status: true, note: true } }),
  ]);
  const recordsByStudent = new Map(records.map((record) => [record.studentId, record]));
  const students = members.map((member) => ({
    studentId: member.student.id,
    fullName: member.student.fullName,
    status: recordsByStudent.get(member.student.id)?.status ?? null,
    note: recordsByStudent.get(member.student.id)?.note ?? null,
  }));
  const canEdit = canEditLesson(user, lesson.date);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <div className="mb-3 flex flex-wrap items-center gap-2"><Badge variant="secondary">{lesson.group.course.name}</Badge><Badge variant={canEdit ? "default" : "outline"}>{canEdit ? "Tahrirlash mumkin" : "Faqat o‘qish"}</Badge></div>
        <h1 className="text-xl font-semibold leading-7 tracking-[-0.02em] sm:text-2xl">{lesson.group.name}</h1>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground sm:text-sm">
          <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-4" />{formatDate(lesson.date)}</span>
          <span className="inline-flex items-center gap-1.5"><Clock3 className="size-4" />{lesson.group.startTime}{lesson.group.endTime ? `–${lesson.group.endTime}` : ""}</span>
          <span className="inline-flex items-center gap-1.5"><MapPin className="size-4" />{lesson.group.room ?? "Xona ko‘rsatilmagan"}</span>
          <span className="inline-flex items-center gap-1.5"><BookOpen className="size-4" />{lesson.group.teacher.fullName}</span>
        </div>
      </div>
      {students.length ? <AttendanceForm key={lesson.id} lessonId={lesson.id} students={students} canEdit={canEdit} /> : <EmptyState icon={UsersRound} title="Guruhda o‘quvchi yo‘q" description="Bu dars sanasida guruhga biriktirilgan faol o‘quvchilar mavjud emas." />}
    </div>
  );
}
