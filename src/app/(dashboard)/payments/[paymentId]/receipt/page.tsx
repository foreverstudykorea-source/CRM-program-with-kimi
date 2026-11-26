import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/features/auth/session";
import { paymentMethodLabels, formatMonth } from "@/features/finance/labels";
import { PrintButton } from "@/features/finance/print-button";
import { db } from "@/lib/db";
import { formatDate, formatMoney } from "@/lib/format";
import { Logo } from "@/components/layout/logo";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = { title: "To‘lov kvitansiyasi" };

export default async function ReceiptPage({ params }: { params: Promise<{ paymentId: string }> }) {
  const { paymentId } = await params;
  const user = await requireUser();
  if (user.role === "TEACHER") redirect("/");
  const payment = await db.payment.findUnique({
    where: { id: paymentId },
    include: { student: true, receivedBy: true, charge: { include: { group: { include: { course: true } } } } },
  });
  if (!payment) notFound();
  if (user.role === "STUDENT" && payment.studentId !== user.id) redirect("/payments");

  return (
    <div className="mx-auto max-w-2xl space-y-5 print:max-w-full">
      <div className="flex justify-end print:hidden"><PrintButton /></div>
      <Card className="p-6 sm:p-8 print:border-0 print:p-0">
        <div className="flex items-start justify-between border-b border-border pb-6"><Logo /><div className="text-right"><h1 className="text-xl font-semibold">To‘lov kvitansiyasi</h1><p className="mt-1 text-xs tabular-nums text-muted-foreground">№ {payment.id.slice(-10).toUpperCase()}</p></div></div>
        <div className="grid gap-5 py-6 text-sm sm:grid-cols-2"><div><p className="text-xs text-muted-foreground">O‘quvchi</p><p className="mt-1 font-medium">{payment.student.fullName}</p><p className="mt-1 text-xs text-muted-foreground">{payment.student.phone}</p></div><div><p className="text-xs text-muted-foreground">To‘lov sanasi</p><p className="mt-1 font-medium">{formatDate(payment.paidAt)}</p></div><div><p className="text-xs text-muted-foreground">Guruh / oy</p><p className="mt-1 font-medium">{payment.charge?.group.name ?? "—"}</p><p className="mt-1 text-xs text-muted-foreground">{payment.charge ? formatMonth(payment.charge.month) : ""}</p></div><div><p className="text-xs text-muted-foreground">To‘lov usuli</p><p className="mt-1 font-medium">{paymentMethodLabels[payment.method]}</p></div></div>
        <div className="rounded-xl bg-muted p-5 text-center"><p className="text-xs text-muted-foreground">To‘lov summasi</p><p className="mt-2 text-3xl font-semibold tabular-nums">{formatMoney(payment.amount)}</p></div>
        <div className="mt-6 space-y-2 text-sm"><p><span className="text-muted-foreground">Qabul qilgan:</span> {payment.receivedBy.fullName}</p>{payment.note && <p><span className="text-muted-foreground">Izoh:</span> {payment.note}</p>}</div>
        <p className="mt-8 border-t border-border pt-5 text-center text-xs leading-5 text-muted-foreground">Ushbu elektron kvitansiya Forever Study to‘lov qaydi asosida yaratildi.</p>
      </Card>
    </div>
  );
}
