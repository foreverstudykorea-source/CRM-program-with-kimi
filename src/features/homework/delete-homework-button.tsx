"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteHomework } from "@/features/homework/actions";
import type { HomeworkItem } from "@/features/homework/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

export function DeleteHomeworkButton({ item }: { item: HomeworkItem }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onDelete() {
    setPending(true);
    setError(null);
    const result = await deleteHomework(item.id);
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setOpen(false);
    toast.success("Vazifa o‘chirildi");
    router.refresh();
  }

  return (
    <>
      <DropdownMenuItem variant="destructive" onSelect={() => setOpen(true)}><Trash2 />O‘chirish</DropdownMenuItem>
      <Dialog open={open} onOpenChange={(next) => !pending && setOpen(next)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Vazifani o‘chirasizmi?</DialogTitle><DialogDescription>“{item.title}” vazifasi barcha o‘quvchilar uchun o‘chiriladi. Bu amalni qaytarib bo‘lmaydi.</DialogDescription></DialogHeader>
          {error && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>Bekor qilish</Button><Button variant="destructive" onClick={onDelete} disabled={pending}>{pending && <LoaderCircle className="animate-spin" />}{pending ? "O‘chirilmoqda..." : "Ha, o‘chirish"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
