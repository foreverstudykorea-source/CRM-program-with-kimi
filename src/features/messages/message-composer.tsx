"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Send } from "lucide-react";
import { toast } from "sonner";
import { sendMessage } from "@/features/messages/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type MessageStudent = { id: string; fullName: string };
export type MessageGroup = { id: string; name: string };

export function MessageComposer({ students, groups, canPayment }: { students: MessageStudent[]; groups: MessageGroup[]; canPayment: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<"students" | "group">("students");
  const [recipientIds, setRecipientIds] = useState<string[]>([]);
  const [groupId, setGroupId] = useState(groups[0]?.id ?? "");
  const [type, setType] = useState<"GENERAL" | "ATTENDANCE" | "PAYMENT">("GENERAL");
  const [body, setBody] = useState("Hurmatli {ism}, sizga muhim xabar bor.");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSend() {
    setPending(true);
    setError(null);
    const result = await sendMessage({ recipientIds: mode === "students" ? recipientIds : [], groupId: mode === "group" ? groupId : null, type, body });
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setRecipientIds([]);
    toast.success("Xabar yuborildi");
    router.refresh();
  }

  return <div className="space-y-4"><div className="flex gap-2"><Button type="button" variant={mode === "students" ? "default" : "outline"} onClick={() => setMode("students")}>O‘quvchilar</Button><Button type="button" variant={mode === "group" ? "default" : "outline"} onClick={() => setMode("group")}>Guruh</Button></div>{mode === "students" ? <div><Label>O‘quvchilarni tanlang</Label><div className="mt-2 max-h-56 space-y-2 overflow-y-auto rounded-lg border border-border p-3">{students.map((student) => <label key={student.id} className="flex min-h-9 items-center gap-2 text-sm"><input type="checkbox" className="size-4 accent-[var(--primary)]" checked={recipientIds.includes(student.id)} onChange={(event) => setRecipientIds((current) => event.target.checked ? [...current, student.id] : current.filter((id) => id !== student.id))} />{student.fullName}</label>)}</div></div> : <div><Label htmlFor="message-group">Guruh</Label><select id="message-group" value={groupId} onChange={(event) => setGroupId(event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-input bg-card px-3 text-sm">{groups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}</select></div>}<div><Label htmlFor="message-type">Xabar turi</Label><select id="message-type" value={type} onChange={(event) => setType(event.target.value as typeof type)} className="mt-2 h-11 w-full rounded-lg border border-input bg-card px-3 text-sm"><option value="GENERAL">Umumiy</option><option value="ATTENDANCE">Davomat</option>{canPayment && <option value="PAYMENT">To‘lov</option>}</select></div><div><Label htmlFor="message-body">Xabar matni</Label><Textarea id="message-body" rows={5} value={body} onChange={(event) => setBody(event.target.value)} /><p className="mt-1 text-xs text-muted-foreground">O‘zgaruvchilar: {"{ism}"}, {"{guruh}"}</p></div>{error && <p role="alert" className="text-sm text-destructive">{error}</p>}<Button onClick={onSend} disabled={pending || (mode === "students" && !recipientIds.length)}>{pending ? <LoaderCircle className="animate-spin" /> : <Send />}{pending ? "Yuborilmoqda..." : "Xabar yuborish"}</Button></div>;
}
