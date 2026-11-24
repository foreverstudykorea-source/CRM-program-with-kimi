import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/features/auth/session";
import { navigation } from "@/components/layout/navigation";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";

export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const user = await requireUser();
  const pathname = `/${decodeURIComponent(section)}`;
  const matchingItems = navigation.filter((item) => item.href === pathname);
  const item = matchingItems.find((candidate) => candidate.roles.includes(user.role));

  if (!matchingItems.length) notFound();
  if (!item) redirect("/");

  return (
    <div>
      <PageHeader title={item.label} description={`${item.label} bo‘limi sizning ${user.role === "STUDENT" ? "hisobingiz" : "rolingiz"} uchun moslashtiriladi.`} />
      <EmptyState icon={item.icon} title="Bo‘lim tayyorlanmoqda" description="Ushbu funksiya keyingi ish bosqichida to‘liq ishga tushadi. Hozircha navigatsiya va ruxsatlar tekshiruvi faol." action={<Button asChild variant="outline"><Link href="/">Bosh sahifaga qaytish</Link></Button>} />
    </div>
  );
}
