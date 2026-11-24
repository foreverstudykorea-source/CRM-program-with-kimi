"use client";

import { useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import type { AttendanceStatus } from "@/generated/prisma/enums";
import { AttendanceStatusBadge } from "@/features/attendance/attendance-status-badge";
import { attendanceStatusLabels } from "@/features/attendance/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export type StudentAttendanceRecord = {
  id: string;
  date: string;
  status: AttendanceStatus;
  note: string | null;
  groupName: string;
  teacherName: string;
  startTime: string;
};

const months = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];
const weekDays = ["Du", "Se", "Cho", "Pa", "Ju", "Sha", "Ya"];
const dotColors: Record<AttendanceStatus, string> = { PRESENT: "bg-success", ABSENT: "bg-destructive", LATE: "bg-warning", EXCUSED: "bg-muted-foreground" };

export function StudentAttendanceView({ records, initialMonth }: { records: StudentAttendanceRecord[]; initialMonth: string }) {
  const [month, setMonth] = useState(initialMonth);
  const [year, monthNumber] = month.split("-").map(Number);
  const daysInMonth = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  const firstDayOffset = (new Date(Date.UTC(year, monthNumber - 1, 1)).getUTCDay() + 6) % 7;
  const recordsByDate = new Map(records.map((record) => [record.date.slice(0, 10), record]));
  const presentLate = records.filter((record) => record.status === "PRESENT" || record.status === "LATE").length;
  const absent = records.filter((record) => record.status === "ABSENT").length;
  const percentage = records.length ? Math.round((presentLate / records.length) * 100) : 0;

  function moveMonth(amount: number) {
    const next = new Date(Date.UTC(year, monthNumber - 1 + amount, 1));
    setMonth(next.toISOString().slice(0, 7));
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <Card className="p-3 sm:p-4"><p className="text-xl font-semibold tabular-nums sm:text-2xl">{percentage}%</p><p className="mt-1 text-[11px] text-muted-foreground sm:text-xs">Davomat foizi</p></Card>
        <Card className="p-3 sm:p-4"><p className="text-xl font-semibold tabular-nums text-success sm:text-2xl">{presentLate}</p><p className="mt-1 text-[11px] text-muted-foreground sm:text-xs">Keldi / kechikdi</p></Card>
        <Card className="p-3 sm:p-4"><p className="text-xl font-semibold tabular-nums text-destructive sm:text-2xl">{absent}</p><p className="mt-1 text-[11px] text-muted-foreground sm:text-xs">Kelmadi</p></Card>
      </div>

      <Card className="p-4 sm:p-5">
        <div className="mb-5 flex items-center justify-between"><Button variant="ghost" size="icon" onClick={() => moveMonth(-1)} aria-label="Oldingi oy"><ChevronLeft /></Button><h2 className="text-sm font-semibold">{months[monthNumber - 1]} {year}</h2><Button variant="ghost" size="icon" onClick={() => moveMonth(1)} aria-label="Keyingi oy"><ChevronRight /></Button></div>
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-muted-foreground">{weekDays.map((day) => <span key={day} className="py-2">{day}</span>)}</div>
        <div className="grid grid-cols-7 gap-1" role="grid" aria-label={`${months[monthNumber - 1]} ${year} davomat kalendari`}>
          {Array.from({ length: firstDayOffset }).map((_, index) => <span key={`empty-${index}`} />)}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const date = `${year}-${String(monthNumber).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const record = recordsByDate.get(date);
            return <div key={date} role="gridcell" aria-label={record ? `${day}, ${attendanceStatusLabels[record.status]}` : String(day)} title={record ? attendanceStatusLabels[record.status] : undefined} className={cn("flex min-h-12 flex-col items-center justify-center rounded-lg border border-transparent text-xs tabular-nums", record && "border-border bg-muted/60 font-semibold")}><span>{day}</span>{record && <span className={cn("mt-1.5 size-1.5 rounded-full", dotColors[record.status])} />}</div>;
          })}
        </div>
        <div className="mt-4 flex flex-wrap gap-3 text-[11px] text-muted-foreground"><span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-success" />Keldi</span><span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-destructive" />Kelmadi</span><span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-warning" />Kechikdi</span><span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-muted-foreground" />Sababli</span></div>
      </Card>

      <section>
        <h2 className="mb-3 text-base font-semibold">Darslar tarixi</h2>
        {records.length ? <div className="space-y-2">{records.slice(0, 30).map((record) => <Card key={record.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="text-sm font-medium">{record.groupName}</h3><p className="mt-1 text-xs text-muted-foreground">{formatDate(record.date)} · {record.startTime} · {record.teacherName}</p>{record.note && <p className="mt-2 text-xs text-muted-foreground">Izoh: {record.note}</p>}</div><AttendanceStatusBadge status={record.status} /></Card>)}</div> : <EmptyState icon={CalendarDays} title="Davomat tarixi yo‘q" description="Ustoz davomat belgilagach, darslar va holatlaringiz shu yerda ko‘rinadi." />}
      </section>
    </div>
  );
}
