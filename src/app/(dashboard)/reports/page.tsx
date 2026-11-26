import type { Metadata } from "next";
import { Download } from "lucide-react";
import { requireRole } from "@/features/auth/session";
import { getMonthlySummary, getMonthValue, getRevenueMonths } from "@/features/finance/queries";
import { RevenueChart } from "@/features/finance/revenue-chart";
import { paymentMethodLabels } from "@/features/finance/labels";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/format";
import { getServerTime } from "@/lib/server-time";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = { title: "Hisobotlar" };

export default async function ReportsPage() {
  await requireRole("FINANCE");
  const month = getMonthValue(await getServerTime());
  const [summary, revenue, payments] = await Promise.all([
    getMonthlySummary(month),
    getRevenueMonths(),
    db.payment.findMany({ include: { charge: { include: { group: { include: { course: true } } } } } }),
  ]);
  const byCourse = new Map<string, number>();
  const byGroup = new Map<string, number>();
  const byMethod = new Map<string, number>();
  for (const payment of payments) {
    byCourse.set(payment.charge?.group.course.name ?? "Boshqa", (byCourse.get(payment.charge?.group.course.name ?? "Boshqa") ?? 0) + payment.amount);
    byGroup.set(payment.charge?.group.name ?? "Boshqa", (byGroup.get(payment.charge?.group.name ?? "Boshqa") ?? 0) + payment.amount);
    byMethod.set(payment.method, (byMethod.get(payment.method) ?? 0) + payment.amount);
  }
  const sortedGroups = [...byGroup.entries()].sort((a, b) => b[1] - a[1]);

  return <div className="space-y-6"><PageHeader title="Moliyaviy hisobotlar" description="Kutilayotgan va yig‘ilgan mablag‘, qarz hamda tushum tarkibi." action={<Button asChild><a href="/api/reports/export"><Download />Excel (.xlsx)</a></Button>} /><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Card className="p-4"><p className="text-xs text-muted-foreground">Kutilayotgan</p><p className="mt-2 text-xl font-semibold tabular-nums">{formatMoney(summary.expected)}</p></Card><Card className="p-4"><p className="text-xs text-muted-foreground">Yig‘ilgan</p><p className="mt-2 text-xl font-semibold tabular-nums text-success">{formatMoney(summary.collected)}</p></Card><Card className="p-4"><p className="text-xs text-muted-foreground">Umumiy qarz</p><p className="mt-2 text-xl font-semibold tabular-nums text-destructive">{formatMoney(summary.debt)}</p></Card><Card className="p-4"><p className="text-xs text-muted-foreground">Yig‘ish foizi</p><p className="mt-2 text-xl font-semibold tabular-nums">{summary.collectionRate}%</p></Card></div><div className="grid gap-4 xl:grid-cols-2"><Card className="p-5"><h2 className="mb-4 text-base font-semibold">12 oylik tushum</h2><RevenueChart data={revenue} /></Card><Card className="p-5"><h2 className="mb-4 text-base font-semibold">To‘lov usullari</h2><div className="space-y-3">{[...byMethod.entries()].sort((a, b) => b[1] - a[1]).map(([method, amount]) => <div key={method} className="flex items-center justify-between border-b border-border pb-2 text-sm last:border-0"><span>{paymentMethodLabels[method as keyof typeof paymentMethodLabels]}</span><span className="font-medium tabular-nums">{formatMoney(amount)}</span></div>)}</div><h2 className="mb-4 mt-7 text-base font-semibold">Kurslar bo‘yicha</h2><div className="space-y-3">{[...byCourse.entries()].sort((a, b) => b[1] - a[1]).map(([course, amount]) => <div key={course} className="flex items-center justify-between border-b border-border pb-2 text-sm last:border-0"><span>{course}</span><span className="font-medium tabular-nums">{formatMoney(amount)}</span></div>)}</div></Card></div><Card className="overflow-hidden"><div className="border-b border-border p-4"><h2 className="text-base font-semibold">Guruhlar bo‘yicha tushum</h2></div><div className="overflow-x-auto"><table className="w-full min-w-[600px] text-left text-sm"><thead className="border-b border-border bg-muted/70 text-xs text-muted-foreground"><tr><th className="h-10 px-4 font-medium">Guruh</th><th className="h-10 px-4 text-right font-medium">Tushum</th></tr></thead><tbody className="divide-y divide-border">{sortedGroups.map(([group, amount]) => <tr key={group}><td className="px-4 py-3">{group}</td><td className="px-4 py-3 text-right font-medium tabular-nums">{formatMoney(amount)}</td></tr>)}</tbody></table></div></Card></div>;
}
