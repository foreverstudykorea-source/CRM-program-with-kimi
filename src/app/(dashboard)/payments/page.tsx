import type { Metadata } from "next";
import Link from "next/link";
import { ReceiptText } from "lucide-react";
import { requireRole } from "@/features/auth/session";
import { getChargeOutstanding, getMonthValue } from "@/features/finance/queries";
import { ChargeStatusBadge } from "@/features/finance/charge-status-badge";
import { ChargeEditForm } from "@/features/finance/charge-edit-form";
import { PaymentForm } from "@/features/finance/payment-form";
import { GenerateChargesForm } from "@/features/finance/generate-charges-form";
import { paymentMethodLabels, formatMonth } from "@/features/finance/labels";
import { db } from "@/lib/db";
import { formatDate, formatMoney } from "@/lib/format";
import { getServerTime } from "@/lib/server-time";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = { title: "To‘lovlar" };

export default async function PaymentsPage() {
  const user = await requireRole("STUDENT", "ADMIN", "FINANCE");
  const isStudent = user.role === "STUDENT";
  const isFinance = user.role === "FINANCE";
  const month = getMonthValue(await getServerTime());
  const [charges, students, recentPayments] = await Promise.all([
    db.charge.findMany({
      where: isStudent ? { studentId: user.id } : {},
      include: { student: { select: { id: true, fullName: true } }, group: { select: { name: true, course: { select: { name: true } } } }, payments: true },
      orderBy: [{ month: "desc" }, { student: { fullName: "asc" } }],
    }),
    isFinance ? db.user.findMany({ where: { role: "STUDENT", studentProfile: { status: "ACTIVE" } }, select: { id: true, fullName: true }, orderBy: { fullName: "asc" } }) : Promise.resolve([]),
    db.payment.findMany({
      where: isStudent ? { studentId: user.id } : {},
      include: { student: { select: { fullName: true } }, charge: { select: { month: true, group: { select: { name: true } } } }, receivedBy: { select: { fullName: true } } },
      orderBy: { paidAt: "desc" },
      take: 10,
    }),
  ]);
  const chargeOptions = charges.filter((charge) => getChargeOutstanding(charge) > 0).map((charge) => ({
    id: charge.id,
    studentId: charge.studentId,
    studentName: charge.student.fullName,
    groupName: charge.group.name,
    month: formatMonth(charge.month),
    outstanding: getChargeOutstanding(charge),
  }));
  const currentCharges = charges.filter((charge) => charge.month.toISOString().slice(0, 7) === month);
  const expected = currentCharges.reduce((total, charge) => total + charge.amount - charge.discount, 0);
  const paid = currentCharges.reduce((total, charge) => total + charge.payments.reduce((sum, payment) => sum + payment.amount, 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader title={isStudent ? "Mening to‘lovlarim" : "To‘lovlar"} description={isFinance ? "Oylik hisoblar, to‘lov qaydi va kvitansiyalar." : "Oylik hisoblar va to‘lov holati — faqat o‘qish rejimi."} action={<Badge variant="secondary"><ReceiptText />{isFinance ? "Moliya admini" : "Faqat o‘qish"}</Badge>} />

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="p-4"><p className="text-xs text-muted-foreground">Joriy oy hisobi</p><p className="mt-2 text-xl font-semibold tabular-nums">{formatMoney(expected)}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">To‘langan</p><p className="mt-2 text-xl font-semibold tabular-nums text-success">{formatMoney(paid)}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">Qoldiq</p><p className="mt-2 text-xl font-semibold tabular-nums text-destructive">{formatMoney(Math.max(0, expected - paid))}</p></Card>
      </div>

      {isFinance && <><Card className="p-5"><h2 className="mb-4 text-base font-semibold">To‘lov qayd etish</h2><PaymentForm students={students} charges={chargeOptions} /></Card><Card className="p-5"><GenerateChargesForm /></Card></>}

      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border p-4"><h2 className="text-base font-semibold">Oylik hisoblar</h2><p className="mt-1 text-xs text-muted-foreground">{charges.length} ta hisob</p></div>
        {charges.length ? <div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-left text-sm"><thead className="border-b border-border bg-muted/70 text-xs text-muted-foreground"><tr><th className="h-10 px-4 font-medium">O‘quvchi / guruh</th><th className="h-10 px-4 font-medium">Oy</th><th className="h-10 px-4 text-right font-medium">Hisob</th><th className="h-10 px-4 text-right font-medium">To‘langan</th><th className="h-10 px-4 text-right font-medium">Qoldiq</th><th className="h-10 px-4 font-medium">Holat</th>{isFinance && <th className="h-10 px-4 font-medium">Amal</th>}</tr></thead><tbody className="divide-y divide-border">{charges.map((charge) => {
          const paidAmount = charge.payments.reduce((total, payment) => total + payment.amount, 0);
          return <tr key={charge.id}><td className="px-4 py-3"><p className="font-medium">{charge.student.fullName}</p><p className="mt-0.5 text-xs text-muted-foreground">{charge.group.name}</p></td><td className="px-4 py-3 whitespace-nowrap">{formatMonth(charge.month)}</td><td className="px-4 py-3 text-right tabular-nums">{formatMoney(charge.amount - charge.discount)}</td><td className="px-4 py-3 text-right tabular-nums">{formatMoney(paidAmount)}</td><td className="px-4 py-3 text-right font-medium tabular-nums">{formatMoney(getChargeOutstanding(charge))}</td><td className="px-4 py-3"><ChargeStatusBadge status={charge.status} /></td>{isFinance && <td className="px-4 py-3"><ChargeEditForm chargeId={charge.id} initialAmount={charge.amount} initialDiscount={charge.discount} /></td>}</tr>;
        })}</tbody></table></div> : <EmptyState icon={ReceiptText} title="Oylik hisob yo‘q" description="Moliya admini oylik hisob yaratgach, u shu yerda ko‘rinadi." />}
      </section>

      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border p-4"><h2 className="text-base font-semibold">So‘nggi to‘lovlar</h2></div>
        {recentPayments.length ? <div className="divide-y divide-border">{recentPayments.map((payment) => <div key={payment.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-medium">{payment.student.fullName}</p><p className="mt-1 text-xs text-muted-foreground">{paymentMethodLabels[payment.method]} · {formatDate(payment.paidAt)} · {payment.receivedBy.fullName}</p><p className="mt-1 text-xs text-muted-foreground">{payment.charge?.group.name} {payment.note ? `· ${payment.note}` : ""}</p></div><div className="flex items-center gap-3"><span className="font-semibold tabular-nums">{formatMoney(payment.amount)}</span><Button asChild size="sm" variant="outline"><Link href={`/payments/${payment.id}/receipt`}>Kvitansiya</Link></Button></div></div>)}</div> : <div className="p-8 text-center text-sm text-muted-foreground">Hozircha to‘lovlar yo‘q.</div>}
      </section>
    </div>
  );
}
