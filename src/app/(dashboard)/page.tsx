import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Sparkles } from "lucide-react";
import type { Role } from "@/generated/prisma/enums";
import { requireUser } from "@/features/auth/session";
import { getNavigation, roleLabels } from "@/components/layout/navigation";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import { getServerTime } from "@/lib/server-time";
import { getTeacherLocale } from "@/features/i18n/server-locale";
import { teacherText } from "@/features/i18n/teacher-dictionary";

const homeCopy: Record<Role, { eyebrow: string; description: string }> = {
  STUDENT: { eyebrow: "O‘quvchi kabineti", description: "Darslaringiz, uy vazifalaringiz va o‘qish jarayoningizga oid barcha ma’lumotlar shu yerda." },
  TEACHER: { eyebrow: "Ustoz kabineti", description: "Guruhlaringizni boshqaring, davomatni oling va uy vazifalarini bir joydan kuzating." },
  ADMIN: { eyebrow: "Boshqaruv markazi", description: "Markazning kundalik jarayonlari, o‘quvchilar va jamoa faoliyatini yagona joydan boshqaring." },
  FINANCE: { eyebrow: "Moliya boshqaruvi", description: "To‘lovlar, oylik hisob-kitoblar va moliyaviy hisobotlarni aniq va qulay boshqaring." },
};

export default async function HomePage() {
  const user = await requireUser();
  const now = await getServerTime();
  const locale = await getTeacherLocale(user);
  const copy = user.role === "TEACHER" ? { eyebrow: teacherText(locale, "Ustoz kabineti"), description: teacherText(locale, homeCopy.TEACHER.description) } : homeCopy[user.role];
  const quickLinks = getNavigation(user.role, user.jobTitle).filter((item) => item.href !== "/").slice(0, 4);
  const firstName = user.fullName.split(" ")[0];

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-xl border border-border bg-card p-6 md:p-8">
        <div className="relative z-10 max-w-2xl">
          <div className="mb-5 flex flex-wrap items-center gap-2"><Badge variant="secondary">{teacherText(locale, user.jobTitle ?? roleLabels[user.role])}</Badge><Badge variant="success"><CheckCircle2 />{teacherText(locale, "Faol hisob")}</Badge></div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary">{copy.eyebrow}</p>
          <h1 className="text-2xl font-semibold tracking-[-0.03em] md:text-[32px] md:leading-tight">{teacherText(locale, "Xush kelibsiz")}, {firstName}.</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground md:text-base">{copy.description}</p>
          <p className="mt-6 text-xs font-medium text-muted-foreground">{teacherText(locale, "Bugun")} · {formatDate(now)}</p>
        </div>
        <div aria-hidden="true" className="absolute -right-8 -top-8 flex size-48 items-center justify-center rounded-full bg-primary/[0.045] md:right-8 md:top-1/2 md:-translate-y-1/2"><Sparkles className="size-12 text-primary/20" /></div>
      </section>

      <section>
        <div className="mb-4"><h2 className="text-base font-semibold">{teacherText(locale, "Tezkor o‘tish")}</h2><p className="mt-1 text-sm text-muted-foreground">{teacherText(locale, "Sizga ochiq bo‘limlar")}</p></div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {quickLinks.map((item) => <Link key={`${item.href}-${item.label}`} href={item.href}><Card className="group h-full p-5 transition-colors hover:border-primary/30 hover:bg-primary/[0.025]"><div className="flex items-start justify-between"><span className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary"><item.icon className="size-[18px]" /></span><ArrowUpRight className="size-4 text-muted-foreground/60 transition-colors group-hover:text-primary" /></div><h3 className="mt-5 text-sm font-semibold">{teacherText(locale, item.label)}</h3><p className="mt-1 text-xs text-muted-foreground">{teacherText(locale, "Bo‘limni ochish")}</p></Card></Link>)}
        </div>
      </section>
    </div>
  );
}
