"use client";

import { useMemo, useState } from "react";
import { columnVisibilityFeature, createColumnHelper, createPaginatedRowModel, createSortedRowModel, rowPaginationFeature, rowSortingFeature, tableFeatures, useTable, type ColumnVisibilityState, type SortingState } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Columns3, Search, UsersRound } from "lucide-react";
import type { StudentListItem } from "@/features/students/types";
import type { StudentPaymentStatus, StudentStatus } from "@/generated/prisma/enums";
import { formatMoney, formatPhone, getInitials } from "@/lib/format";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/empty-state";
import { Input } from "@/components/ui/input";

const columnLabels: Record<string, string> = { fullName: "O‘quvchi", phone: "Telefon", groups: "Guruh / reja", status: "O‘quvchi holati", paymentStatus: "To‘lov holati", salesManager: "Sotuv menejeri", joinedAt: "Boshlash / probaga" };
const statusLabels: Record<StudentStatus, string> = { ACTIVE: "Faol", FROZEN: "Muzlatilgan", COMPLETED: "Kursni tugatdi", PROSPECT: "Nomalum" };
const statusVariants = { ACTIVE: "success", FROZEN: "warning", COMPLETED: "secondary", PROSPECT: "outline" } as const;
const paymentLabels: Record<StudentPaymentStatus, string> = { PAID: "To‘ladi", DEBT: "Qarzdor", UNPAID: "Umuman to‘lamadi", UNKNOWN: "Nomalum" };
const paymentVariants = { PAID: "success", DEBT: "destructive", UNPAID: "destructive", UNKNOWN: "secondary" } as const;
const features = tableFeatures({ columnVisibilityFeature, rowSortingFeature, rowPaginationFeature, sortedRowModel: createSortedRowModel(), paginatedRowModel: createPaginatedRowModel() });
const columnHelper = createColumnHelper<typeof features, StudentListItem>();

export function StudentsDirectory({ students, groups }: { students: StudentListItem[]; groups: string[] }) {
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState("all");
  const [studentStatus, setStudentStatus] = useState("all");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibilityState>({});

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("uz");
    return students.filter((student) => {
      const searchText = `${student.fullName} ${student.phone} ${student.groups.join(" ")} ${student.salesManager ?? ""} ${student.notes ?? ""}`.toLocaleLowerCase("uz");
      return (!query || searchText.includes(query)) && (group === "all" || student.groups.includes(group)) && (studentStatus === "all" || student.status === studentStatus);
    });
  }, [students, search, group, studentStatus]);

  const columns = useMemo(() => columnHelper.columns([
    columnHelper.accessor("fullName", {
      header: "O‘quvchi",
      enableHiding: false,
      cell: ({ row }) => <div className="flex items-center gap-3" title={row.original.notes ?? undefined}><Avatar className="size-9"><AvatarFallback>{getInitials(row.original.fullName)}</AvatarFallback></Avatar><span className="font-medium text-foreground">{row.original.fullName}</span></div>,
    }),
    columnHelper.accessor("phone", { header: "Telefon", cell: ({ getValue }) => <span className="whitespace-nowrap tabular-nums text-muted-foreground">{formatPhone(getValue())}</span> }),
    columnHelper.accessor("groups", {
      header: "Guruh / reja",
      enableSorting: false,
      cell: ({ getValue, row }) => {
        const items = getValue();
        if (items.length) return <div className="flex max-w-sm flex-wrap gap-1.5">{items.map((item) => <Badge key={item} variant="secondary" className="max-w-64 truncate">{item}</Badge>)}</div>;
        return row.original.plannedGroup ? <span className="text-xs text-muted-foreground">Reja: {row.original.plannedGroup}</span> : <span className="text-muted-foreground">Guruhsiz</span>;
      },
    }),
    columnHelper.accessor("status", { header: "O‘quvchi holati", cell: ({ getValue }) => <Badge variant={statusVariants[getValue()]}>{statusLabels[getValue()]}</Badge> }),
    columnHelper.accessor("paymentStatus", {
      header: "To‘lov holati",
      cell: ({ getValue, row }) => <div><Badge variant={paymentVariants[getValue()]}>{paymentLabels[getValue()]}</Badge>{row.original.debtAmount !== null && <p className="mt-1 whitespace-nowrap text-xs font-medium tabular-nums text-destructive">{formatMoney(row.original.debtAmount)}</p>}</div>,
    }),
    columnHelper.accessor("salesManager", { header: "Sotuv menejeri", cell: ({ getValue }) => <span className="text-muted-foreground">{getValue() || "—"}</span> }),
    columnHelper.accessor("joinedAt", { header: "Dars boshlagan", cell: ({ getValue }) => <span className="whitespace-nowrap tabular-nums text-muted-foreground">{getValue()}</span> }),
  ]), []);

  const table = useTable({
    features,
    data: filteredStudents,
    columns,
    state: { sorting, columnVisibility },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    initialState: { pagination: { pageIndex: 0, pageSize: 10 } },
    autoResetPageIndex: true,
  });

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex flex-col gap-3 border-b border-border p-4 xl:flex-row xl:items-center">
        <div className="relative flex-1 xl:max-w-md"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Ism, telefon, guruh yoki menejer bo‘yicha qidirish" className="pl-9" aria-label="O‘quvchilarni qidirish" /></div>
        <div className="flex flex-col gap-2 sm:flex-row xl:ml-auto">
          <select value={group} onChange={(event) => setGroup(event.target.value)} className="h-11 rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring xl:w-52" aria-label="Guruh bo‘yicha filtrlash"><option value="all">Barcha guruhlar</option>{groups.map((item) => <option key={item} value={item}>{item}</option>)}</select>
          <select value={studentStatus} onChange={(event) => setStudentStatus(event.target.value)} className="h-11 rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring xl:w-44" aria-label="O‘quvchi holati bo‘yicha filtrlash"><option value="all">Barcha holatlar</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="outline" size="icon" aria-label="Ustunlarni sozlash"><Columns3 /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52"><DropdownMenuLabel>Ko‘rinadigan ustunlar</DropdownMenuLabel><DropdownMenuSeparator />{table.getAllLeafColumns().filter((column) => column.getCanHide()).map((column) => <DropdownMenuCheckboxItem key={column.id} checked={column.getIsVisible()} onCheckedChange={(value) => column.toggleVisibility(Boolean(value))} onSelect={(event) => event.preventDefault()}>{columnLabels[column.id]}</DropdownMenuCheckboxItem>)}</DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {filteredStudents.length ? (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1240px] text-left text-sm">
              <thead className="sticky top-0 z-10 bg-muted/80 text-xs text-muted-foreground backdrop-blur">
                {table.getHeaderGroups().map((headerGroup) => <tr key={headerGroup.id} className="border-b border-border">{headerGroup.headers.map((header) => <th key={header.id} className="h-11 px-5 font-medium">{header.isPlaceholder ? null : header.column.getCanSort() ? <button type="button" onClick={header.column.getToggleSortingHandler()} className="flex items-center gap-1.5 rounded py-1 hover:text-foreground">{<table.FlexRender header={header} />}{header.column.getIsSorted() === "asc" ? <ArrowUp className="size-3.5" /> : header.column.getIsSorted() === "desc" ? <ArrowDown className="size-3.5" /> : <ArrowUpDown className="size-3.5 opacity-50" />}</button> : <table.FlexRender header={header} />}</th>)}</tr>)}
              </thead>
              <tbody className="divide-y divide-border">{table.getRowModel().rows.map((row) => <tr key={row.id} className="transition-colors hover:bg-muted/40">{row.getVisibleCells().map((cell) => <td key={cell.id} className="px-5 py-3.5">{<table.FlexRender cell={cell} />}</td>)}</tr>)}</tbody>
            </table>
          </div>
          <div className="flex flex-col gap-3 border-t border-border px-4 py-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>{filteredStudents.length} ta o‘quvchidan {table.getRowModel().rows.length} tasi ko‘rsatilmoqda</p>
            <div className="flex items-center gap-2"><Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}><ChevronLeft />Oldingi</Button><span className="min-w-20 text-center text-xs tabular-nums">{table.state.pagination.pageIndex + 1} / {table.getPageCount()}</span><Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Keyingi<ChevronRight /></Button></div>
          </div>
        </>
      ) : <EmptyState icon={UsersRound} title="O‘quvchi topilmadi" description="Qidiruv yoki filtrlarni o‘zgartirib ko‘ring." className="rounded-none border-0" action={<Button variant="outline" onClick={() => { setSearch(""); setGroup("all"); setStudentStatus("all"); }}>Filtrlarni tozalash</Button>} />}
    </section>
  );
}
