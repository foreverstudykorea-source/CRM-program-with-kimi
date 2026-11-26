import { Suspense } from "react";
import { requireUser } from "@/features/auth/session";
import { AppShell } from "@/components/layout/app-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { getTeacherLocale } from "@/features/i18n/server-locale";
import { db } from "@/lib/db";

async function AuthenticatedShell({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const locale = await getTeacherLocale(user);
  const unreadCount = user.role === "STUDENT" ? await db.message.count({ where: { recipientId: user.id, readAt: null } }) : 0;
  return <AppShell user={user} locale={locale} unreadCount={unreadCount}>{children}</AppShell>;
}

function ShellFallback() {
  return <div className="min-h-dvh"><aside className="fixed inset-y-0 left-0 hidden w-[256px] border-r border-border bg-sidebar p-5 lg:block"><Skeleton className="h-9 w-40" /><div className="mt-10 space-y-3">{Array.from({ length: 7 }).map((_, index) => <Skeleton key={index} className="h-10 w-full" />)}</div></aside><div className="lg:pl-[256px]"><header className="flex h-16 items-center justify-between border-b border-border px-4 md:px-6"><Skeleton className="h-5 w-32" /><Skeleton className="h-9 w-48" /></header><main className="p-4 md:p-6 lg:p-8"><Skeleton className="h-64 w-full rounded-xl" /><div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-36 rounded-xl" />)}</div></main></div></div>;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<ShellFallback />}><AuthenticatedShell>{children}</AuthenticatedShell></Suspense>;
}
