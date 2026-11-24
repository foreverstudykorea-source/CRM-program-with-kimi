"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, CheckCheck, CircleMinus, Clock3, LoaderCircle, MessageSquareText, Save, X } from "lucide-react";
import { toast } from "sonner";
import type { AttendanceStatus } from "@/generated/prisma/enums";
import { saveAttendance } from "@/features/attendance/actions";
import { attendanceStatusLabels, type AttendanceStudent } from "@/features/attendance/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getInitials } from "@/lib/format";
import { cn } from "@/lib/utils";

const statusOptions: { value: AttendanceStatus; icon: typeof Check; selectedClass: string }[] = [
  { value: "PRESENT", icon: Check, selectedClass: "border-success/30 bg-success/10 text-success" },
  { value: "ABSENT", icon: X, selectedClass: "border-destructive/30 bg-destructive/10 text-destructive" },
  { value: "LATE", icon: Clock3, selectedClass: "border-warning/30 bg-warning/10 text-warning" },
  { value: "EXCUSED", icon: CircleMinus, selectedClass: "border-border bg-muted text-muted-foreground" },
];

export function AttendanceForm({ lessonId, students: initialStudents, canEdit }: { lessonId: string; students: AttendanceStudent[]; canEdit: boolean }) {
  const router = useRouter();
  const [students, setStudents] = useState(initialStudents);
  const [notesOpen, setNotesOpen] = useState<Set<string>>(new Set(initialStudents.filter((student) => student.note).map((student) => student.studentId)));
  const [pending, setPending] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const markedCount = students.filter((student) => student.status !== null).length;
  const isComplete = markedCount === students.length;

  function updateStudent(studentId: string, update: Partial<AttendanceStudent>) {
    setStudents((current) => current.map((student) => student.studentId === studentId ? { ...student, ...update } : student));
    setDirty(true);
    setError(null);
  }

  function markAllPresent() {
    setStudents((current) => current.map((student) => ({ ...student, status: "PRESENT" })));
    setDirty(true);
    setError(null);
  }

  async function onSave() {
    if (!isComplete) {
      setError("Har bir o‘quvchiga holat belgilang.");
      return;
    }
    setPending(true);
    setError(null);
    const result = await saveAttendance(lessonId, students.map((student) => ({ studentId: student.studentId, status: student.status!, note: student.note })));
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setDirty(false);
    toast.success("Davomat saqlandi");
    router.refresh();
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="text-sm font-semibold">{markedCount} / {students.length} belgilandi</p><p className="mt-1 text-xs text-muted-foreground">{canEdit ? dirty ? "Saqlanmagan o‘zgarishlar bor" : "Har bir o‘quvchiga holat belgilang" : "Bu davomat faqat o‘qish uchun"}</p></div>
        {canEdit && <Button type="button" variant="outline" onClick={markAllPresent} disabled={pending}><CheckCheck />Hammasi keldi</Button>}
      </div>

      {!canEdit && <div className="mb-4 rounded-lg border border-warning/20 bg-warning/10 p-3 text-sm text-warning">Ustoz faqat bugungi davomatni tahrirlashi mumkin. Eski davomatni administrator o‘zgartiradi.</div>}
      {error && <div role="alert" className="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      <div className="space-y-3">
        {students.map((student) => (
          <section key={student.studentId} className="rounded-xl border border-border bg-card p-3.5" aria-label={student.fullName}>
            <div className="mb-3 flex items-center gap-3">
              <Avatar className="size-9"><AvatarFallback>{getInitials(student.fullName)}</AvatarFallback></Avatar>
              <div className="min-w-0 flex-1"><h3 className="truncate text-sm font-semibold">{student.fullName}</h3></div>
              {canEdit && <button type="button" onClick={() => setNotesOpen((current) => { const next = new Set(current); if (next.has(student.studentId)) next.delete(student.studentId); else next.add(student.studentId); return next; })} className={cn("inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground", (notesOpen.has(student.studentId) || student.note) && "text-primary")} aria-expanded={notesOpen.has(student.studentId)}><MessageSquareText className="size-4" />Izoh</button>}
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label={`${student.fullName} davomat holati`}>
              {statusOptions.map(({ value, icon: Icon, selectedClass }) => <button key={value} type="button" disabled={!canEdit || pending} aria-pressed={student.status === value} onClick={() => updateStudent(student.studentId, { status: value })} className={cn("inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-70 sm:text-sm", student.status === value && selectedClass)}><Icon className="size-4" />{attendanceStatusLabels[value]}</button>)}
            </div>
            {(notesOpen.has(student.studentId) || (!canEdit && student.note)) && <div className="mt-3"><label htmlFor={`note-${student.studentId}`} className="sr-only">{student.fullName} uchun izoh</label><Input id={`note-${student.studentId}`} value={student.note ?? ""} onChange={(event) => updateStudent(student.studentId, { note: event.target.value })} placeholder="Izoh (ixtiyoriy)" maxLength={500} disabled={!canEdit || pending} /></div>}
          </section>
        ))}
      </div>

      {canEdit && <div className="sticky bottom-0 z-20 -mx-4 mt-5 flex items-center justify-between gap-3 border-t border-border bg-background/95 p-4 backdrop-blur md:-mx-6 md:px-6 lg:-mx-8 lg:px-8"><p className="hidden text-xs text-muted-foreground sm:block">{isComplete ? "Hammasi belgilandi. Saqlashni unutmang." : "Saqlashdan oldin barcha o‘quvchilarni belgilang."}</p><Button size="lg" className="w-full sm:ml-auto sm:w-auto" onClick={onSave} disabled={pending || !dirty}>{pending ? <LoaderCircle className="animate-spin" /> : <Save />}{pending ? "Saqlanmoqda..." : "Saqlash"}</Button></div>}
    </div>
  );
}
