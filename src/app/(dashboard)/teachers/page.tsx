import type { Metadata } from "next";
import { BriefcaseBusiness, UsersRound } from "lucide-react";
import { requireRole } from "@/features/auth/session";
import { db } from "@/lib/db";
import { formatPhone, getInitials } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Xodimlar" };

const titleOrder = ["Administrator", "Menejer", "Operator", "Ustoz", "Support teacher", "Support teacher 2"];

export default async function StaffPage() {
  await requireRole("ADMIN");
  const staff = await db.user.findMany({
    where: { role: { not: "STUDENT" } },
    select: {
      id: true,
      fullName: true,
      phone: true,
      jobTitle: true,
      isActive: true,
      teachingGroups: {
        where: { status: "ACTIVE" },
        select: { id: true, students: { where: { leftAt: null }, select: { studentId: true } } },
      },
    },
  });
  staff.sort((a, b) => titleOrder.indexOf(a.jobTitle ?? "") - titleOrder.indexOf(b.jobTitle ?? "") || a.fullName.localeCompare(b.fullName));
  const teacherCount = staff.filter((user) => user.jobTitle === "Ustoz").length;

  return (
    <div>
      <PageHeader title="Xodimlar" description="Administrator, menejer, operator, asosiy ustozlar va support teacher’lar." action={<Badge variant="secondary" className="px-3 py-1.5"><BriefcaseBusiness />{staff.length} xodim</Badge>} />
      <div className="mb-5 flex flex-wrap gap-2 text-sm text-muted-foreground"><Badge variant="outline">{teacherCount} asosiy ustoz</Badge><Badge variant="outline">2 support teacher</Badge><Badge variant="outline">1 administrator</Badge><Badge variant="outline">1 menejer</Badge><Badge variant="outline">1 operator</Badge></div>
      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="border-b border-border bg-muted/70 text-xs text-muted-foreground"><tr><th className="h-11 px-5 font-medium">Xodim</th><th className="h-11 px-5 font-medium">Lavozim</th><th className="h-11 px-5 font-medium">Telefon</th><th className="h-11 px-5 font-medium">Faol guruhlar</th><th className="h-11 px-5 font-medium">O‘quvchilar</th><th className="h-11 px-5 font-medium">Holat</th></tr></thead>
            <tbody className="divide-y divide-border">
              {staff.map((user) => {
                const studentCount = user.teachingGroups.reduce((total, group) => total + group.students.length, 0);
                return <tr key={user.id} className="transition-colors hover:bg-muted/40"><td className="px-5 py-4"><div className="flex items-center gap-3"><Avatar className="size-9"><AvatarFallback>{getInitials(user.fullName)}</AvatarFallback></Avatar><span className="font-medium">{user.fullName}</span></div></td><td className="px-5 py-4"><Badge variant="outline">{user.jobTitle}</Badge></td><td className="px-5 py-4 whitespace-nowrap tabular-nums text-muted-foreground">{formatPhone(user.phone)}</td><td className="px-5 py-4">{user.teachingGroups.length ? <span className="inline-flex items-center gap-2"><UsersRound className="size-4 text-muted-foreground" />{user.teachingGroups.length} ta</span> : <span className="text-muted-foreground">—</span>}</td><td className="px-5 py-4 tabular-nums">{user.teachingGroups.length ? `${studentCount} ta` : "—"}</td><td className="px-5 py-4"><Badge variant={user.isActive ? "success" : "secondary"}>{user.isActive ? "Faol" : "Nofaol"}</Badge></td></tr>;
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
