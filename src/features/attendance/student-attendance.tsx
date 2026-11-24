import type { AuthUser } from "@/features/auth/types";
import { StudentAttendanceView } from "@/features/attendance/student-attendance-view";
import { db } from "@/lib/db";
import { getTashkentDateValue } from "@/lib/date-time";
import { getServerTime } from "@/lib/server-time";

export async function StudentAttendance({ user }: { user: AuthUser }) {
  const [records, now] = await Promise.all([
    db.attendance.findMany({
      where: { studentId: user.id },
      select: {
        id: true,
        status: true,
        note: true,
        lesson: { select: { date: true, group: { select: { name: true, startTime: true, teacher: { select: { fullName: true } } } } } },
      },
      orderBy: { lesson: { date: "desc" } },
      take: 120,
    }),
    getServerTime(),
  ]);

  return (
    <div>
      <div className="mb-6"><h1 className="text-2xl font-semibold tracking-[-0.025em]">Mening davomatim</h1><p className="mt-1.5 text-sm text-muted-foreground">Darslarga qatnashish tarixi, foiz va oylik kalendar.</p></div>
      <StudentAttendanceView initialMonth={getTashkentDateValue(now).slice(0, 7)} records={records.map((record) => ({
        id: record.id,
        date: record.lesson.date.toISOString(),
        status: record.status,
        note: record.note,
        groupName: record.lesson.group.name,
        teacherName: record.lesson.group.teacher.fullName,
        startTime: record.lesson.group.startTime,
      }))} />
    </div>
  );
}
