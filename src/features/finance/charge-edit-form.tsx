"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Pencil } from "lucide-react";
import { toast } from "sonner";
import { updateCharge } from "@/features/finance/actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ChargeEditForm({ chargeId, initialAmount, initialDiscount }: { chargeId: string; initialAmount: number; initialDiscount: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(String(initialAmount));
  const [discount, setDiscount] = useState(String(initialDiscount));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const result = await updateCharge(chargeId, Number(amount), Number(discount));
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setOpen(false);
    toast.success("Oylik hisob yangilandi");
    router.refresh();
  }

  return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button size="sm" variant="ghost" aria-label="Oylik hisobni tahrirlash"><Pencil /></Button></DialogTrigger><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Oylik hisobni tahrirlash</DialogTitle><DialogDescription>Summa va chegirmani o‘zgartiring. Qoldiq avtomatik qayta hisoblanadi.</DialogDescription></DialogHeader><form onSubmit={onSubmit} className="space-y-4"><div className="space-y-2"><Label htmlFor="charge-amount">Summa</Label><Input id="charge-amount" type="number" min={1} value={amount} onChange={(event) => setAmount(event.target.value)} /></div><div className="space-y-2"><Label htmlFor="charge-discount">Chegirma</Label><Input id="charge-discount" type="number" min={0} value={discount} onChange={(event) => setDiscount(event.target.value)} /></div>{error && <p role="alert" className="text-sm text-destructive">{error}</p>}<DialogFooter><Button type="button" variant="outline" onClick={() => setOpen(false)}>Bekor qilish</Button><Button type="submit" disabled={pending}>{pending && <LoaderCircle className="animate-spin" />}Saqlash</Button></DialogFooter></form></DialogContent></Dialog>;
}
