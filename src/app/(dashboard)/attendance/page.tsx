import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireUser } from "@/features/auth/session";
import { TeacherAttendance } from "@/features/attendance/teacher-attendance";
import { AdminAttendance, type AttendanceFilters } from "@/features/attendance/admin-attendance";
import { StudentAttendance } from "@/features/attendance/student-attendance";
import { getTashkentDateValue, isDateValue } from "@/lib/date-time";
import { getServerTime } from "@/lib/server-time";

export const metadata: Metadata = { title: "Davomat" };

type AttendanceSearchParams = { groupId?: string; teacherId?: string; from?: string; to?: string; date?: string };

export default async function AttendancePage({ searchParams }: { searchParams: Promise<AttendanceSearchParams> }) {
  const user = await requireUser();
  const params = await searchParams;

  if (user.role === "ADMIN") {
    const today = getTashkentDateValue(await getServerTime());
    let from = params.from && isDateValue(params.from) ? params.from : params.to && isDateValue(params.to) ? params.to : today;
    let to = params.to && isDateValue(params.to) ? params.to : from;
    if (from > to) [from, to] = [to, from];
    const filters: AttendanceFilters = { groupId: params.groupId || undefined, teacherId: params.teacherId || undefined, from, to };
    return <AdminAttendance filters={filters} />;
  }

  if (user.role === "STUDENT") return <StudentAttendance user={user} />;
  if (user.role === "TEACHER" && user.jobTitle === "Ustoz") return <TeacherAttendance user={user} date={params.date && isDateValue(params.date) ? params.date : undefined} />;
  redirect("/");
}
