"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlert, LoaderCircle, Paperclip } from "lucide-react";
import { toast } from "sonner";
import { saveHomework } from "@/features/homework/actions";
import { homeworkFormSchema, type HomeworkFormValues } from "@/features/homework/schemas";
import { homeworkFileAccept, validateHomeworkFile } from "@/features/homework/file-config";
import type { HomeworkGroup, HomeworkItem } from "@/features/homework/types";
import { getTashkentDateInputValue } from "@/features/homework/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function HomeworkFormDialog({ groups, homework, onClose }: { groups: HomeworkGroup[]; homework?: HomeworkItem; onClose: () => void }) {
  const router = useRouter();
  const form = useForm<HomeworkFormValues>({
    resolver: zodResolver(homeworkFormSchema),
    defaultValues: {
      groupId: homework?.groupId ?? groups[0]?.id ?? "",
      title: homework?.title ?? "",
      description: homework?.description ?? "",
      dueDate: homework?.dueDate.slice(0, 10) ?? getTashkentDateInputValue(),
      attachmentUrl: homework?.attachmentUrl?.startsWith("http") ? homework.attachmentUrl : "",
    },
  });
  const isSubmitting = form.formState.isSubmitting;
  const currentFile = homework?.attachmentUrl?.startsWith("/api/files/") ? homework.attachmentUrl : null;

  async function onSubmit(values: HomeworkFormValues) {
    form.clearErrors("root");
    const file = values.attachment?.[0] as File | undefined;
    if (!values.attachmentUrl && !file && !homework?.attachmentUrl) {
      form.setError("attachmentUrl", { message: "Havola qo‘shing yoki fayl yuklang." });
      return;
    }
    if (file) {
      const error = validateHomeworkFile(file);
      if (error) {
        form.setError("attachment", { message: error });
        return;
      }
    }

    const formData = new FormData();
    formData.set("groupId", values.groupId);
    formData.set("title", values.title);
    formData.set("description", values.description);
    formData.set("dueDate", values.dueDate);
    formData.set("attachmentUrl", values.attachmentUrl);
    if (file) formData.set("attachment", file);

    try {
      const result = await saveHomework(homework?.id ?? null, formData);
      if (result.error) {
        form.setError("root", { message: result.error });
        return;
      }
      toast.success(homework ? "Vazifa yangilandi" : "Yangi vazifa yaratildi");
      onClose();
      router.refresh();
    } catch {
      form.setError("root", { message: "Vazifani saqlashda xatolik yuz berdi. Qayta urinib ko‘ring." });
    }
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open && !isSubmitting) onClose(); }}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader><DialogTitle>{homework ? "Vazifani tahrirlash" : "Yangi uy vazifasi"}</DialogTitle><DialogDescription>Vazifa tanlangan guruhdagi barcha faol o‘quvchilarga ko‘rinadi.</DialogDescription></DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
          {form.formState.errors.root && <div role="alert" className="flex gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"><CircleAlert className="mt-0.5 size-4 shrink-0" />{form.formState.errors.root.message}</div>}
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="groupId">Guruh</Label><select id="groupId" className="h-11 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" disabled={isSubmitting} {...form.register("groupId")}>{groups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}</select>{form.formState.errors.groupId && <p className="text-xs text-destructive">{form.formState.errors.groupId.message}</p>}</div>
            <div className="space-y-2"><Label htmlFor="dueDate">Topshirish muddati</Label><Input id="dueDate" type="date" disabled={isSubmitting} {...form.register("dueDate")} />{form.formState.errors.dueDate && <p className="text-xs text-destructive">{form.formState.errors.dueDate.message}</p>}</div>
          </div>
          <div className="space-y-2"><Label htmlFor="title">Sarlavha</Label><Input id="title" placeholder="Masalan: 3-bo‘lim bo‘yicha mashq" disabled={isSubmitting} {...form.register("title")} />{form.formState.errors.title && <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>}</div>
          <div className="space-y-2"><Label htmlFor="description">Vazifa tavsifi</Label><Textarea id="description" rows={5} placeholder="O‘quvchi nima qilishi, qanday topshirishi kerakligini yozing..." className="resize-y" disabled={isSubmitting} {...form.register("description")} />{form.formState.errors.description && <p className="text-xs text-destructive">{form.formState.errors.description.message}</p>}</div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="attachmentUrl">Material havolasi</Label><Input id="attachmentUrl" type="url" placeholder="https://..." disabled={isSubmitting} {...form.register("attachmentUrl")} />{form.formState.errors.attachmentUrl ? <p className="text-xs text-destructive">{form.formState.errors.attachmentUrl.message}</p> : <p className="text-xs leading-5 text-muted-foreground">Havola yoki fayldan kamida bittasi kerak.</p>}</div>
            <div className="space-y-2"><Label htmlFor="attachment">Yoki fayl yuklash</Label><Input id="attachment" type="file" accept={homeworkFileAccept} className="h-auto min-h-11 py-2 text-xs file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-2 file:text-xs file:font-medium" disabled={isSubmitting} {...form.register("attachment")} />{form.formState.errors.attachment ? <p className="text-xs text-destructive">{String(form.formState.errors.attachment.message)}</p> : <p className="text-xs leading-5 text-muted-foreground">PDF, Office, rasm, ZIP yoki TXT. 8 MB gacha.</p>}</div>
          </div>
          {currentFile && <a href={currentFile} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs font-medium text-primary hover:underline"><Paperclip className="size-3.5" />Hozirgi yuklangan faylni ochish</a>}
          <DialogFooter><Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Bekor qilish</Button><Button type="submit" disabled={isSubmitting}>{isSubmitting && <LoaderCircle className="animate-spin" />}{isSubmitting ? "Saqlanmoqda..." : "Saqlash"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
