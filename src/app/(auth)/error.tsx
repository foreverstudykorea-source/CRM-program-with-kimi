"use client";

import { CircleAlert, RotateCcw } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";

export default function AuthError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="flex min-h-dvh flex-col bg-background p-6"><Logo /><div className="m-auto flex max-w-md flex-col items-center text-center"><span className="mb-5 flex size-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive"><CircleAlert className="size-5" /></span><h1 className="text-2xl font-semibold">Sahifani yuklab bo‘lmadi</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">Vaqtinchalik texnik xatolik yuz berdi. Birozdan keyin qayta urinib ko‘ring.</p><Button onClick={reset} className="mt-6"><RotateCcw />Qayta urinish</Button></div></main>;
}
