import type { Metadata } from "next";
import { requireRole } from "@/features/auth/session";
import { getDebtors } from "@/features/finance/queries";
import { DebtorsTable } from "@/features/finance/debtors-table";
import { formatMoney } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = { title: "Qarzdorlar" };

export default async function DebtorsPage() {
  await requireRole("FINANCE");
  const debtors = await getDebtors();
  const totalDebt = debtors.reduce((total, debtor) => total + debtor.debt, 0);
  const months = debtors.reduce((total, debtor) => total + debtor.months.size, 0);

  return <div className="space-y-6"><PageHeader title="Qarzdorlar" description="Qarz summasi, oylar soni va to‘lov eslatmalari." /><div className="grid gap-3 sm:grid-cols-3"><Card className="p-4"><p className="text-xs text-muted-foreground">Umumiy qarz</p><p className="mt-2 text-xl font-semibold tabular-nums text-destructive">{formatMoney(totalDebt)}</p></Card><Card className="p-4"><p className="text-xs text-muted-foreground">Qarzdor o‘quvchilar</p><p className="mt-2 text-xl font-semibold tabular-nums">{debtors.length} ta</p></Card><Card className="p-4"><p className="text-xs text-muted-foreground">Qarz oylari yig‘indisi</p><p className="mt-2 text-xl font-semibold tabular-nums">{months} oy</p></Card></div><DebtorsTable debtors={debtors.map((debtor) => ({ ...debtor, groups: [...debtor.groups], months: [...debtor.months] }))} /></div>;
}
