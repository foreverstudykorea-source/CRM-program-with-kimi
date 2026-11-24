"use client";

import { useState } from "react";
import { BookOpenCheck, CalendarClock, CheckCircle2, Clock3 } from "lucide-react";
import type { HomeworkItem } from "@/features/homework/types";
import { HomeworkCard } from "@/features/homework/homework-card";
import { EmptyState } from "@/components/empty-state";
import { cn } from "@/lib/utils";

export function StudentHomework({ items }: { items: HomeworkItem[] }) {
  const [tab, setTab] = useState<"active" | "past">("active");
  const activeItems = items.filter((item) => item.status !== "OVERDUE");
  const pastItems = items.filter((item) => item.status === "OVERDUE").reverse();
  const visibleItems = tab === "active" ? activeItems : pastItems;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="rounded-xl border border-border bg-card p-3 sm:p-4"><BookOpenCheck className="mb-3 size-4 text-primary" /><p className="text-xl font-semibold tabular-nums sm:text-2xl">{activeItems.length}</p><p className="mt-1 text-[11px] text-muted-foreground sm:text-xs">Faol vazifa</p></div>
        <div className="rounded-xl border border-border bg-card p-3 sm:p-4"><Clock3 className="mb-3 size-4 text-warning" /><p className="text-xl font-semibold tabular-nums sm:text-2xl">{items.filter((item) => item.status === "DUE_SOON").length}</p><p className="mt-1 text-[11px] text-muted-foreground sm:text-xs">Muddati yaqin</p></div>
        <div className="rounded-xl border border-border bg-card p-3 sm:p-4"><CheckCircle2 className="mb-3 size-4 text-muted-foreground" /><p className="text-xl font-semibold tabular-nums sm:text-2xl">{pastItems.length}</p><p className="mt-1 text-[11px] text-muted-foreground sm:text-xs">O‘tgan vazifa</p></div>
      </div>

      <div role="tablist" aria-label="Vazifalar davri" className="inline-flex rounded-lg border border-border bg-muted p-1">
        <button role="tab" aria-selected={tab === "active"} onClick={() => setTab("active")} className={cn("min-h-11 rounded-md px-4 text-sm font-medium text-muted-foreground transition-colors", tab === "active" && "bg-card text-foreground shadow-sm")}>Joriy vazifalar <span className="ml-1 text-xs tabular-nums">{activeItems.length}</span></button>
        <button role="tab" aria-selected={tab === "past"} onClick={() => setTab("past")} className={cn("min-h-11 rounded-md px-4 text-sm font-medium text-muted-foreground transition-colors", tab === "past" && "bg-card text-foreground shadow-sm")}>O‘tgan vazifalar <span className="ml-1 text-xs tabular-nums">{pastItems.length}</span></button>
      </div>

      <div role="tabpanel" aria-label={tab === "active" ? "Joriy vazifalar" : "O‘tgan vazifalar"}>
        {visibleItems.length ? <div className="grid gap-4 xl:grid-cols-2">{visibleItems.map((item) => <HomeworkCard key={item.id} item={item} />)}</div> : <EmptyState icon={tab === "active" ? CalendarClock : CheckCircle2} title={tab === "active" ? "Joriy vazifa yo‘q" : "O‘tgan vazifalar yo‘q"} description={tab === "active" ? "Ustoz yangi vazifa qo‘shganda, u shu yerda ko‘rinadi." : "Muddati o‘tgan vazifalar shu bo‘limda saqlanadi."} />}
      </div>
    </div>
  );
}
