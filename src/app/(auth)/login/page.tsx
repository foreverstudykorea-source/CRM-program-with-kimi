import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CalendarCheck2, MessageSquareText, WalletCards } from "lucide-react";
import { getCurrentUser } from "@/features/auth/session";
import { LoginForm } from "@/features/auth/login-form";
import { Logo } from "@/components/layout/logo";

export const metadata: Metadata = { title: "Tizimga kirish" };

const features = [
  { icon: CalendarCheck2, label: "Darslar va davomat nazorati" },
  { icon: WalletCards, label: "To‘lovlar va moliyaviy hisobotlar" },
  { icon: MessageSquareText, label: "Jamoa bilan tezkor aloqa" },
];

async function LoginContent({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next: nextPath } = await searchParams;
  const user = await getCurrentUser();
  if (user) redirect("/");

  return (
    <main className="grid min-h-dvh bg-card lg:grid-cols-[0.9fr_1.1fr]">
      <section className="relative hidden flex-col justify-between overflow-hidden bg-[#191921] p-12 text-white lg:flex xl:p-16">
        <Logo inverted />
        <div className="relative z-10 max-w-lg">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-300">Yagona ish maydoni</p>
          <h1 className="text-4xl font-semibold leading-[1.15] tracking-[-0.035em]">Markazingizning kundalik ishlari bir joyda.</h1>
          <p className="mt-5 max-w-md text-base leading-7 text-zinc-400">Darslarni rejalashtiring, o‘quvchilar rivojini kuzating va jamoangiz bilan samarali ishlang.</p>
          <div className="mt-10 space-y-4 border-t border-white/10 pt-8">
            {features.map(({ icon: Icon, label }) => <div key={label} className="flex items-center gap-3 text-sm text-zinc-300"><span className="flex size-9 items-center justify-center rounded-lg border border-white/10 bg-white/5"><Icon className="size-4 text-indigo-300" /></span>{label}</div>)}
          </div>
        </div>
        <p className="text-xs text-zinc-500">Faqat Forever Study jamoasi va o‘quvchilari uchun.</p>
        <div aria-hidden="true" className="absolute -right-32 -top-32 size-96 rounded-full border border-white/[0.06]" />
        <div aria-hidden="true" className="absolute -right-20 -top-20 size-72 rounded-full border border-white/[0.06]" />
      </section>

      <section className="flex min-h-dvh flex-col px-5 py-6 sm:px-10 lg:px-16">
        <div className="lg:hidden"><Logo /></div>
        <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center py-12">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold tracking-[-0.025em]">Xush kelibsiz</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Davom etish uchun administrator bergan hisob ma’lumotlarini kiriting.</p>
          </div>
          <LoginForm nextPath={nextPath} />
          <p className="mt-6 text-center text-xs leading-5 text-muted-foreground">Hisobingizga kira olmasangiz, administratorga murojaat qiling.</p>
        </div>
        <p className="text-center text-[11px] text-muted-foreground">Forever Study · Ichki foydalanish uchun tizim</p>
      </section>
    </main>
  );
}

export default function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  return <Suspense fallback={<main className="flex min-h-dvh items-center justify-center bg-card"><div className="flex flex-col items-center gap-5"><Logo /><p className="text-sm text-muted-foreground">Yuklanmoqda...</p></div></main>}><LoginContent searchParams={searchParams} /></Suspense>;
}
