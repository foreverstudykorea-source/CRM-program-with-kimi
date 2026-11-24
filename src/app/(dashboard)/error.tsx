"use client";

import { CircleAlert, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className="flex min-h-[60vh] flex-col items-center justify-center text-center"><span className="mb-4 flex size-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive"><CircleAlert className="size-5" /></span><h1 className="text-xl font-semibold">Ma’lumotlarni yuklab bo‘lmadi</h1><p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">Vaqtinchalik xatolik yuz berdi. Internet aloqangizni tekshirib, qayta urinib ko‘ring.</p><Button onClick={reset} className="mt-6"><RotateCcw />Qayta urinish</Button></div>;
}
