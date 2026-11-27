"use client";

import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, ReceiptText } from "lucide-react";
import { toast } from "sonner";
import { recordPayment } from "@/features/finance/actions";
import { paymentSchema, type PaymentFormValues } from "@/features/finance/schemas";
import { getTashkentDateValue } from "@/lib/date-time";
import { formatMoney } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type ChargeOption = { id: string; studentId: string; studentName: string; groupName: string; month: string; outstanding: number };
export type StudentOption = { id: string; fullName: string };

const methods = { CASH: "Naqd", CARD: "Karta", CLICK: "Click", PAYME: "Payme", BANK_TRANSFER: "Bank o‘tkazmasi" };

export function PaymentForm({ students, charges }: { students: StudentOption[]; charges: ChargeOption[] }) {
  const router = useRouter();
  const form = useForm<PaymentFormValues>({ resolver: zodResolver(paymentSchema), defaultValues: { studentId: students[0]?.id ?? "", chargeId: charges[0]?.id ?? "", amount: charges[0]?.outstanding ?? 0, method: "CASH", paidAt: getTashkentDateValue(), note: "" } });
  const [studentId, chargeId] = useWatch<PaymentFormValues>({ control: form.control, name: ["studentId", "chargeId"] as const });
  const availableCharges = charges.filter((charge) => charge.studentId === studentId);
  const selectedCharge = charges.find((charge) => charge.id === chargeId);

  function changeStudent(value: string) {
    form.setValue("studentId", value);
    const next = charges.find((charge) => charge.studentId === value);
    if (next) {
      form.setValue("chargeId", next.id);
      form.setValue("amount", next.outstanding);
    }
  }

  async function onSubmit(values: PaymentFormValues) {
    const result = await recordPayment(values);
    if (result.error) {
      form.setError("root", { message: result.error });
      return;
    }
    toast.success("To‘lov saqlandi");
    if (result.paymentId) router.push(`/payments/${result.paymentId}/receipt`);
    else router.refresh();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2" noValidate>
      {form.formState.errors.root && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive sm:col-span-2">{form.formState.errors.root.message}</p>}
      <div className="space-y-2"><Label htmlFor="studentId">O‘quvchi</Label><select id="studentId" className="h-11 w-full rounded-lg border border-input bg-card px-3 text-sm" value={String(studentId ?? "")} onChange={(event) => changeStudent(event.target.value)} disabled={form.formState.isSubmitting}>{students.map((student) => <option key={student.id} value={student.id}>{student.fullName}</option>)}</select></div>
      <div className="space-y-2"><Label htmlFor="chargeId">Oylik hisob</Label><select id="chargeId" className="h-11 w-full rounded-lg border border-input bg-card px-3 text-sm" value={String(chargeId ?? "")} onChange={(event) => { form.setValue("chargeId", event.target.value); const charge = charges.find((item) => item.id === event.target.value); if (charge) form.setValue("amount", charge.outstanding); }} disabled={form.formState.isSubmitting}>{availableCharges.map((charge) => <option key={charge.id} value={charge.id}>{charge.month} · {charge.groupName} · {formatMoney(charge.outstanding)}</option>)}</select></div>
      <div className="space-y-2"><Label htmlFor="amount">Summa (UZS)</Label><Input id="amount" type="number" min={1} step={1000} inputMode="numeric" disabled={form.formState.isSubmitting} {...form.register("amount")} />{selectedCharge && <p className="text-xs text-muted-foreground">Qoldiq: {formatMoney(selectedCharge.outstanding)}</p>}{form.formState.errors.amount && <p className="text-xs text-destructive">{form.formState.errors.amount.message}</p>}</div>
      <div className="space-y-2"><Label htmlFor="method">To‘lov usuli</Label><select id="method" className="h-11 w-full rounded-lg border border-input bg-card px-3 text-sm" disabled={form.formState.isSubmitting} {...form.register("method")}>{Object.entries(methods).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
      <div className="space-y-2"><Label htmlFor="paidAt">To‘lov sanasi</Label><Input id="paidAt" type="date" disabled={form.formState.isSubmitting} {...form.register("paidAt")} /></div>
      <div className="space-y-2"><Label htmlFor="note">Izoh (ixtiyoriy)</Label><Input id="note" placeholder="Qo‘shimcha izoh" disabled={form.formState.isSubmitting} {...form.register("note")} /></div>
      <div className="sm:col-span-2"><Button type="submit" disabled={form.formState.isSubmitting || !availableCharges.length}>{form.formState.isSubmitting ? <LoaderCircle className="animate-spin" /> : <ReceiptText />}{form.formState.isSubmitting ? "Saqlanmoqda..." : "To‘lovni saqlash va kvitansiya"}</Button></div>
    </form>
  );
}
