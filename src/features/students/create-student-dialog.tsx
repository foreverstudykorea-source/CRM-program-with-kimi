"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Plus } from "lucide-react";
import { toast } from "sonner";
import { createStudent } from "@/features/students/actions";
import { createStudentSchema, type CreateStudentValues } from "@/features/students/schemas";
import { formatMoney, formatPhoneInput } from "@/lib/format";
import { getTashkentDateValue } from "@/lib/date-time";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type StudentGroupOption = { id: string; name: string; monthlyPrice: number };

export function CreateStudentDialog({ groups }: { groups: StudentGroupOption[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const form = useForm<CreateStudentValues>({ resolver: zodResolver(createStudentSchema), defaultValues: { fullName: "", phone: "", password: "", groupId: "", joinedAt: getTashkentDateValue() } });

  async function onSubmit(values: CreateStudentValues) {
    const result = await createStudent(values);
    if (result.error) {
      form.setError("root", { message: result.error });
      return;
    }
    setOpen(false);
    form.reset();
    toast.success("O‘quvchi qo‘shildi");
    router.refresh();
  }

  return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button><Plus />O‘quvchi qo‘shish</Button></DialogTrigger><DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-lg"><DialogHeader><DialogTitle>Yangi o‘quvchi</DialogTitle><DialogDescription>Hisob yaratiladi va guruh tanlansa, joriy oy uchun 690 000 so‘mlik hisob ochiladi.</DialogDescription></DialogHeader><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>{form.formState.errors.root && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{form.formState.errors.root.message}</p>}<div className="space-y-2"><Label htmlFor="new-fullName">To‘liq ism</Label><Input id="new-fullName" placeholder="Ism va familiya" disabled={form.formState.isSubmitting} {...form.register("fullName")} />{form.formState.errors.fullName && <p className="text-xs text-destructive">{form.formState.errors.fullName.message}</p>}</div><div className="space-y-2"><Label htmlFor="new-phone">Telefon raqam</Label><Input id="new-phone" type="tel" inputMode="numeric" placeholder="+998 90 123 45 67" disabled={form.formState.isSubmitting} {...form.register("phone", { onChange: (event) => form.setValue("phone", formatPhoneInput(event.target.value)) })} />{form.formState.errors.phone && <p className="text-xs text-destructive">{form.formState.errors.phone.message}</p>}</div><div className="space-y-2"><Label htmlFor="new-password">Vaqtinchalik parol</Label><Input id="new-password" type="password" autoComplete="new-password" placeholder="Kamida 8 ta belgi" disabled={form.formState.isSubmitting} {...form.register("password")} />{form.formState.errors.password && <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>}</div><div className="space-y-2"><Label htmlFor="new-group">Guruh</Label><select id="new-group" className="h-11 w-full rounded-lg border border-input bg-card px-3 text-sm" disabled={form.formState.isSubmitting} {...form.register("groupId")}><option value="">Guruh tanlanmagan</option>{groups.map((group) => <option key={group.id} value={group.id}>{group.name} · {formatMoney(group.monthlyPrice)}</option>)}</select></div><div className="space-y-2"><Label htmlFor="new-joinedAt">Dars boshlagan sana</Label><Input id="new-joinedAt" type="date" disabled={form.formState.isSubmitting} {...form.register("joinedAt")} /></div><DialogFooter><Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={form.formState.isSubmitting}>Bekor qilish</Button><Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting && <LoaderCircle className="animate-spin" />}{form.formState.isSubmitting ? "Saqlanmoqda..." : "O‘quvchi qo‘shish"}</Button></DialogFooter></form></DialogContent></Dialog>;
}
