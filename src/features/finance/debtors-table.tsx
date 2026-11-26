"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ReminderButton } from "@/features/finance/reminder-button";
import { formatMoney, formatPhone } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type DebtorRow = { id: string; fullName: string; phone: string; groups: string[]; months: string[]; debt: number };

export function DebtorsTable({ debtors }: { debtors: DebtorRow[] }) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("debt-desc");
  const [selected, setSelected] = useState<string[]>([]);
  const filtered = useMemo(() => {
    const query = search.toLocaleLowerCase("uz");
    const rows = debtors.filter((debtor) => `${debtor.fullName} ${debtor.phone} ${debtor.groups.join(" ")}`.toLocaleLowerCase("uz").includes(query));
    return rows.sort((a, b) => sort === "debt-asc" ? a.debt - b.debt : sort === "name" ? a.fullName.localeCompare(b.fullName) : sort === "months" ? b.months.length - a.months.length : b.debt - a.debt);
  }, [debtors, search, sort]);

  return <div className="space-y-4"><div className="flex flex-col gap-3 md:flex-row md:items-center"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="O‘quvchi, telefon yoki guruh" className="pl-9" aria-label="Qarzdorlarni qidirish" /></div><select value={sort} onChange={(event) => setSort(event.target.value)} className="h-11 rounded-lg border border-input bg-card px-3 text-sm" aria-label="Saralash"><option value="debt-desc">Qarz ko‘payishi</option><option value="debt-asc">Qarz kamayishi</option><option value="months">Oylar soni</option><option value="name">Ism bo‘yicha</option></select>{selected.length > 0 && <ReminderButton studentIds={selected} label={`${selected.length} o‘quvchiga eslatma`} />}</div><div className="overflow-x-auto rounded-xl border border-border bg-card"><table className="w-full min-w-[900px] text-left text-sm"><thead className="border-b border-border bg-muted/70 text-xs text-muted-foreground"><tr><th className="h-11 w-12 px-4"><input type="checkbox" className="size-4 accent-[var(--primary)]" checked={filtered.length > 0 && selected.length === filtered.length} onChange={(event) => setSelected(event.target.checked ? filtered.map((debtor) => debtor.id) : [])} aria-label="Barchasini tanlash" /></th><th className="h-11 px-4 font-medium">O‘quvchi</th><th className="h-11 px-4 font-medium">Guruhlar</th><th className="h-11 px-4 font-medium">Oylar</th><th className="h-11 px-4 text-right font-medium">Qarz</th><th className="h-11 px-4 font-medium">Amal</th></tr></thead><tbody className="divide-y divide-border">{filtered.map((debtor) => <tr key={debtor.id}><td className="px-4 py-3"><input type="checkbox" className="size-4 accent-[var(--primary)]" checked={selected.includes(debtor.id)} onChange={(event) => setSelected((current) => event.target.checked ? [...current, debtor.id] : current.filter((id) => id !== debtor.id))} aria-label={`${debtor.fullName} tanlash`} /></td><td className="px-4 py-3"><p className="font-medium">{debtor.fullName}</p><p className="mt-0.5 text-xs tabular-nums text-muted-foreground">{formatPhone(debtor.phone)}</p></td><td className="px-4 py-3 text-xs text-muted-foreground">{debtor.groups.join(", ")}</td><td className="px-4 py-3"><span className="font-medium">{debtor.months.length} oy</span><p className="mt-0.5 text-xs text-muted-foreground">{debtor.months.join(", ")}</p></td><td className="px-4 py-3 text-right font-semibold tabular-nums text-destructive">{formatMoney(debtor.debt)}</td><td className="px-4 py-3"><ReminderButton studentIds={[debtor.id]} /></td></tr>)}</tbody></table>{!filtered.length && <div className="p-8 text-center text-sm text-muted-foreground">Qidiruv bo‘yicha qarzdor topilmadi.</div>}</div>{selected.length > 0 && <Button variant="ghost" size="sm" onClick={() => setSelected([])}>Tanlovni tozalash</Button>}</div>;
}
