import type { Metadata } from "next";
import { UsersRound } from "lucide-react";
import { requireRole } from "@/features/auth/session";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { StudentsDirectory } from "@/features/students/students-directory";
import type { StudentListItem } from "@/features/students/types";

export const metadata: Metadata = { title: "O‘quvchilar" };
const sourceTeacherNames: Record<string, string> = { "Iymona": "Imona", "Ulug'bek": "Ulugbek" };

export default async function StudentsPage() {
  await requireRole("ADMIN");
  const students = await db.user.findMany({
    where: { role: "STUDENT" },
    orderBy: { fullName: "asc" },
    select: {
      id: true,
      fullName: true,
      phone: true,
      isActive: true,
      createdAt: true,
      studentProfile: true,
      groupMemberships: {
        where: { leftAt: null },
        select: { joinedAt: true, group: { select: { name: true } } },
        orderBy: { joinedAt: "asc" },
      },
    },
  });

  const data: StudentListItem[] = students.map((student) => {
    const profile = student.studentProfile;
    const groups = student.groupMemberships.map((membership) => membership.group.name);
    const date = profile?.startDate ?? student.groupMemberships[0]?.joinedAt ?? profile?.trialDate;
    return {
      id: student.id,
      fullName: student.fullName,
      phone: student.phone,
      groups,
      plannedGroup: !groups.length && profile?.status === "PROSPECT" && profile.teacherName ? [sourceTeacherNames[profile.teacherName] ?? profile.teacherName, profile.scheduleText, profile.timeText].filter(Boolean).join(" · ") : null,
      status: profile?.status ?? (student.isActive ? "ACTIVE" : "PROSPECT"),
      paymentStatus: profile?.paymentStatus ?? "UNKNOWN",
      debtAmount: profile?.debtAmount ?? null,
      salesManager: profile?.salesManager ?? null,
      notes: profile?.notes ?? null,
      joinedAt: date ? formatDate(date) : "—",
    };
  });
  const activeCount = data.filter((student) => student.status === "ACTIVE").length;

  return (
    <div>
      <PageHeader title="O‘quvchilar" description="Jadvaldagi barcha o‘quvchilar, guruhlar, to‘lov holati va sotuv menejerlari." action={<Badge variant="secondary" className="px-3 py-1.5"><UsersRound />{activeCount} faol · {data.length} jami</Badge>} />
      <StudentsDirectory students={data} groups={Array.from(new Set(data.flatMap((student) => student.groups))).sort()} />
    </div>
  );
}
