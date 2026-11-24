import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";

export default function NotFound() {
  return <main className="flex min-h-dvh flex-col bg-background p-6"><Logo /><div className="m-auto flex max-w-md flex-col items-center text-center"><span className="mb-5 flex size-12 items-center justify-center rounded-xl bg-muted"><FileQuestion className="size-5 text-muted-foreground" /></span><p className="text-xs font-semibold uppercase tracking-widest text-primary">404 xatolik</p><h1 className="mt-2 text-2xl font-semibold">Sahifa topilmadi</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">Siz qidirayotgan sahifa mavjud emas yoki ko‘chirilgan bo‘lishi mumkin.</p><Button asChild className="mt-6"><Link href="/">Bosh sahifaga qaytish</Link></Button></div></main>;
}
