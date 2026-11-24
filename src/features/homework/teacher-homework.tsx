"use client";

import { useMemo, useState } from "react";
import { BookOpenCheck, MoreHorizontal, Pencil, Plus, Search } from "lucide-react";
import type { HomeworkGroup, HomeworkItem } from "@/features/homework/types";
import { HomeworkCard } from "@/features/homework/homework-card";
import { HomeworkFormDialog } from "@/features/homework/homework-form-dialog";
import { DeleteHomeworkButton } from "@/features/homework/delete-homework-button";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/empty-state";
import { Input } from "@/components/ui/input";

export function TeacherHomework({ items, groups }: { items: HomeworkItem[]; groups: HomeworkGroup[] }) {
  const [formState, setFormState] = useState<{ open: boolean; homework?: HomeworkItem }>({ open: false });
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState("all");
  const [status, setStatus] = useState("all");

  const filteredItems = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("uz");
    return items.filter((item) => (!query || `${item.title} ${item.description}`.toLocaleLowerCase("uz").includes(query)) && (group === "all" || item.groupId === group) && (status === "all" || item.status === status));
  }, [items, search, group, status]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 lg:flex-row lg:items-center">
        <div className="relative flex-1 lg:max-w-sm"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Vazifa qidirish..." className="pl-9" aria-label="Vazifalarni qidirish" /></div>
        <div className="grid grid-cols-2 gap-2 lg:flex">
          <select value={group} onChange={(event) => setGroup(event.target.value)} className="h-11 rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring lg:max-w-64" aria-label="Guruh bo‘yicha filtrlash"><option value="all">Barcha guruhlar</option>{groups.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-11 rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Holat bo‘yicha filtrlash"><option value="all">Barcha holatlar</option><option value="NEW">Yangi</option><option value="DUE_SOON">Muddati yaqin</option><option value="OVERDUE">Muddati o‘tgan</option></select>
        </div>
        <Button className="lg:ml-auto" onClick={() => setFormState({ open: true })} disabled={!groups.length}><Plus />Yangi vazifa</Button>
      </div>

      <div className="flex items-center justify-between text-sm"><p className="text-muted-foreground">{filteredItems.length} ta vazifa</p><p className="text-xs text-muted-foreground">{items.filter((item) => item.status === "DUE_SOON").length} tasi muddati yaqin</p></div>

      {filteredItems.length ? <div className="grid gap-4 xl:grid-cols-2">{filteredItems.map((item) => <HomeworkCard key={item.id} item={item} action={<DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" aria-label={`${item.title} uchun amallar`}><MoreHorizontal /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={() => setFormState({ open: true, homework: item })}><Pencil />Tahrirlash</DropdownMenuItem><DeleteHomeworkButton item={item} /></DropdownMenuContent></DropdownMenu>} />)}</div> : <EmptyState icon={BookOpenCheck} title={items.length ? "Vazifa topilmadi" : "Hozircha vazifa yo‘q"} description={items.length ? "Qidiruv yoki filtrlarni o‘zgartirib ko‘ring." : "Birinchi uy vazifasini yarating — u guruhdagi barcha o‘quvchilarga ko‘rinadi."} action={items.length ? <Button variant="outline" onClick={() => { setSearch(""); setGroup("all"); setStatus("all"); }}>Filtrlarni tozalash</Button> : <Button onClick={() => setFormState({ open: true })}><Plus />Vazifa yaratish</Button>} />}

      {formState.open && <HomeworkFormDialog key={formState.homework?.id ?? "new"} groups={groups} homework={formState.homework} onClose={() => setFormState({ open: false })} />}
    </div>
  );
}
