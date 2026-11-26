"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { generateMonthlyCharges } from "@/features/finance/actions";
import { getMonthValue } from "@/features/finance/utils";
import { Button } from "@/components/ui/button";

export function GenerateChargesForm() {
  const router = useRouter();
  const [month, setMonth] = useState(getMonthValue());
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onGenerate() {
    setPending(true);
    setError(null);
    const result = await generateMonthlyCharges(month);
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    toast.success("Oylik hisoblar yaratildi");
    router.refresh();
  }

  return <div className="flex flex-col gap-2 sm:flex-row sm:items-end"><div><label htmlFor="charge-month" className="mb-2 block text-sm font-medium">Hisob oyi</label><input id="charge-month" type="month" value={month} onChange={(event) => setMonth(event.target.value)} className="h-11 rounded-lg border border-input bg-card px-3 text-sm" /></div><Button onClick={onGenerate} disabled={pending}>{pending ? <LoaderCircle className="animate-spin" /> : <CalendarPlus />}{pending ? "Yaratilmoqda..." : "Oylik hisob yaratish"}</Button>{error && <p role="alert" className="text-sm text-destructive">{error}</p>}</div>;
}
