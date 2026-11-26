import type { Metadata } from "next";
import { Mail, MailOpen } from "lucide-react";
import { requireRole } from "@/features/auth/session";
import { MessageComposer } from "@/features/messages/message-composer";
import { MarkReadButton } from "@/features/messages/mark-read-button";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = { title: "Xabarlar" };

const typeLabels = { GENERAL: "Umumiy", ATTENDANCE: "Davomat", PAYMENT: "To‘lov" };

export default async function MessagesPage() {
  const user = await requireRole("STUDENT", "ADMIN", "FINANCE");
  const isStudent = user.role === "STUDENT";
  const [messages, students, groups] = await Promise.all([
    db.message.findMany({
      where: isStudent ? { recipientId: user.id } : { senderId: user.id },
      include: { sender: { select: { fullName: true } }, recipient: { select: { fullName: true } }, group: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 40,
    }),
    !isStudent ? db.user.findMany({ where: { role: "STUDENT", isActive: true }, select: { id: true, fullName: true }, orderBy: { fullName: "asc" } }) : Promise.resolve([]),
    !isStudent ? db.group.findMany({ where: { status: "ACTIVE" }, select: { id: true, name: true }, orderBy: { name: "asc" } }) : Promise.resolve([]),
  ]);
  const unread = isStudent ? messages.filter((message) => !message.readAt).length : 0;

  return (
    <div className="space-y-6">
      <PageHeader title="Xabarlar" description={isStudent ? "Administrator va moliya adminidan kelgan xabarlar." : "O‘quvchi yoki guruhga xabar yuborish va o‘qish holatini kuzatish."} action={isStudent && unread > 0 ? <Badge variant="default">{unread} ta o‘qilmagan</Badge> : undefined} />
      {!isStudent && <Card className="p-5"><h2 className="mb-4 text-base font-semibold">Yangi xabar</h2><MessageComposer students={students} groups={groups} canPayment={user.role === "FINANCE"} /></Card>}
      <section className="space-y-3">
        <h2 className="text-base font-semibold">{isStudent ? "Kiruvchi xabarlar" : "Yuborilgan xabarlar"}</h2>
        {messages.length ? messages.map((message) => <Card key={message.id} className="p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><Badge variant="secondary">{typeLabels[message.type]}</Badge><span className="text-xs text-muted-foreground">{isStudent ? message.sender.fullName : message.recipient.fullName}{message.group ? ` · ${message.group.name}` : ""}</span></div><p className="mt-3 whitespace-pre-wrap text-sm leading-6">{message.body}</p><p className="mt-3 text-xs text-muted-foreground">{formatDateTime(message.createdAt)}</p></div><div className="shrink-0">{isStudent ? !message.readAt && <MarkReadButton messageId={message.id} /> : message.readAt ? <Badge variant="success"><MailOpen />O‘qilgan</Badge> : <Badge variant="secondary"><Mail />Kutilmoqda</Badge>}</div></div></Card>) : <EmptyState icon={Mail} title="Xabarlar yo‘q" description={isStudent ? "Sizga xabar yuborilganda, u shu yerda ko‘rinadi." : "Birinchi xabaringizni yuboring."} />}
      </section>
    </div>
  );
}
