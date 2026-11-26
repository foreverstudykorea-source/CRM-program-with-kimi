"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Send } from "lucide-react";
import { toast } from "sonner";
import { sendPaymentReminders } from "@/features/finance/actions";
import { Button } from "@/components/ui/button";

export function ReminderButton({ studentIds, label = "Eslatma yuborish" }: { studentIds: string[]; label?: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSend() {
    setPending(true);
    setError(null);
    const result = await sendPaymentReminders(studentIds);
    setPending(false);
    if (result.error) {
      setError(result.error);
      toast.error(result.error);
      return;
    }
    toast.success("To‘lov eslatmasi yuborildi");
    router.refresh();
  }

  return <div className="space-y-1"><Button size="sm" variant="outline" onClick={onSend} disabled={pending || !studentIds.length}>{pending ? <LoaderCircle className="animate-spin" /> : <Send />}{pending ? "Yuborilmoqda..." : label}</Button>{error && <p className="text-xs text-destructive">{error}</p>}</div>;
}
