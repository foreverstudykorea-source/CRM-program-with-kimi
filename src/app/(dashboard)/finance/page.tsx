import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Banknote, ChartNoAxesCombined, CircleAlert } from "lucide-react";
import { requireRole } from "@/features/auth/session";
import { getDebtors, getMonthlySummary, getMonthValue, getRevenueMonths } from "@/features/finance/queries";
import { RevenueChart } from "@/features/finance/revenue-chart";
import { ReminderButton } from "@/features/finance/reminder-button";
import { paymentMethodLabels } from "@/features/finance/labels";
import { db } from "@/lib/db";
import { formatDate, formatMoney } from "@/lib/format";
import { getServerTime } from "@/lib/server-time";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = { title: "Moliya" };

function Kpi({ label, value, detail, tone }: { label: string; value: string | number; detail?: string; tone?: "success" | "danger" }) {
  return <Card className="p-4"><p className="text-xs text-muted-foreground">{label}</p><p className={`mt-2 text-2xl font-semibold tabular-nums ${tone === "success" ? "text-success" : tone === "danger" ? "text-destructive" : ""}`}>{value}</p>{detail && <p className="mt-1 text-xs text-muted-foreground">{detail}</p>}</Card>;
}

export default async function FinancePage() {
  await requireRole("FINANCE");
  const month = getMonthValue(await getServerTime());
  const [summary, revenue, debtors, recentPayments] = await Promise.all([
    getMonthlySummary(month),
    getRevenueMonths(),
    getDebtors(),
    db.payment.findMany({ include: { student: { select: { fullName: true } }, receivedBy: { select: { fullName: true } } }, orderBy: { paidAt: "desc" }, take: 6 }),
  ]);

  return <div className="space-y-6"><PageHeader title="Moliya markazi" description="Oylik kutilayotgan tushum, yig‘ilgan mablag‘ va qarzdorlar tahlili." action={<Button asChild variant="outline"><Link href="/reports"><ChartNoAxesCombined />Hisobotlar</Link></Button>} /><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Kpi label="Kutilayotgan tushum" value={formatMoney(summary.expected)} detail="Joriy oy" /><Kpi label="Yig‘ilgan mablag‘" value={formatMoney(summary.collected)} detail="Joriy oy" tone="success" /><Kpi label="Umumiy qarz" value={formatMoney(summary.debt)} detail={`${debtors.length} o‘quvchi qarzdor`} tone="danger" /><Kpi label="Yig‘ish foizi" value={`${summary.collectionRate}%`} detail="Kutilgan va yig‘ilgan nisbat" /></div><div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]"><Card className="p-5"><div className="mb-4 flex items-center justify-between"><h2 className="text-base font-semibold">12 oylik tushum</h2><Badge variant="secondary"><Banknote />UZS</Badge></div><RevenueChart data={revenue} /></Card><Card className="p-5"><div className="mb-4 flex items-center justify-between"><h2 className="text-base font-semibold">Top qarzdorlar</h2><Button asChild size="sm" variant="ghost"><Link href="/debtors">Barchasi<ArrowRight /></Link></Button></div><div className="space-y-3">{debtors.slice(0, 5).map((debtor) => <div key={debtor.id} className="flex items-center justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0"><div><p className="text-sm font-medium">{debtor.fullName}</p><p className="mt-0.5 text-xs text-muted-foreground">{debtor.months.size} oy · {[...debtor.groups][0]}</p></div><div className="text-right"><p className="text-sm font-semibold tabular-nums text-destructive">{formatMoney(debtor.debt)}</p><ReminderButton studentIds={[debtor.id]} /></div></div>)}{!debtors.length && <p className="text-sm text-muted-foreground">Qarzdor o‘quvchilar yo‘q.</p>}</div></Card></div><Card className="overflow-hidden"><div className="flex items-center justify-between border-b border-border p-4"><h2 className="text-base font-semibold">So‘nggi to‘lovlar</h2><Button asChild size="sm" variant="ghost"><Link href="/payments">Barchasi<ArrowRight /></Link></Button></div><div className="divide-y divide-border">{recentPayments.map((payment) => <div key={payment.id} className="flex items-center justify-between gap-3 p-4"><div><p className="text-sm font-medium">{payment.student.fullName}</p><p className="mt-1 text-xs text-muted-foreground">{paymentMethodLabels[payment.method]} · {formatDate(payment.paidAt)} · {payment.receivedBy.fullName}</p></div><div className="flex items-center gap-3"><span className="font-semibold tabular-nums">{formatMoney(payment.amount)}</span><Button asChild size="sm" variant="outline"><Link href={`/payments/${payment.id}/receipt`}>Kvitansiya</Link></Button></div></div>)}{!recentPayments.length && <p className="p-6 text-sm text-muted-foreground">Hozircha to‘lovlar yo‘q.</p>}</div></Card><div className="flex items-center gap-3 text-sm text-muted-foreground"><CircleAlert className="size-4 text-warning" />Qarzdorlarga eslatma yuborish uchun “Qarzdorlar” sahifasini oching.</div></div>;
}
