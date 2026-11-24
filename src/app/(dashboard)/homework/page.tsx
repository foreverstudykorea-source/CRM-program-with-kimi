import type { Metadata } from "next";
import { requireRole } from "@/features/auth/session";
import { db } from "@/lib/db";
import { getServerTime } from "@/lib/server-time";
import { getHomeworkStatus } from "@/features/homework/utils";
import { TeacherHomework } from "@/features/homework/teacher-homework";
import { StudentHomework } from "@/features/homework/student-homework";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Uy vazifalari" };

export default async function HomeworkPage() {
  const user = await requireRole("TEACHER", "STUDENT");
  const isTeacher = user.role === "TEACHER";

  const [groups, homework, now] = await Promise.all([
    isTeacher
      ? db.group.findMany({ where: { teacherId: user.id, status: "ACTIVE" }, select: { id: true, name: true }, orderBy: { name: "asc" } })
      : Promise.resolve([]),
    db.homework.findMany({
      where: isTeacher
        ? { group: { teacherId: user.id } }
        : { group: { students: { some: { studentId: user.id, leftAt: null } } } },
      select: {
        id: true,
        groupId: true,
        title: true,
        description: true,
        attachmentUrl: true,
        dueDate: true,
        createdAt: true,
        group: { select: { name: true, course: { select: { name: true } } } },
      },
      orderBy: { dueDate: "asc" },
    }),
    getServerTime(),
  ]);

  const items = homework.map((item) => ({
    id: item.id,
    groupId: item.groupId,
    groupName: item.group.name,
    courseName: item.group.course.name,
    title: item.title,
    description: item.description,
    attachmentUrl: item.attachmentUrl,
    dueDate: item.dueDate.toISOString(),
    createdAt: item.createdAt.toISOString(),
    status: getHomeworkStatus(item.dueDate, now),
  }));

  return (
    <div>
      <PageHeader
        title="Uy vazifalari"
        description={isTeacher ? "O‘z guruhlaringiz uchun vazifalar yarating va ularning muddatlarini boshqaring." : "Guruhlaringizdagi joriy va o‘tgan uy vazifalari, materiallar va topshirish muddatlari."}
        action={<Badge variant="secondary" className="px-3 py-1.5">{items.length} ta vazifa</Badge>}
      />
      {isTeacher ? <TeacherHomework items={items} groups={groups} /> : <StudentHomework items={items} />}
    </div>
  );
}
