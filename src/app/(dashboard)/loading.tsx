import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return <div className="space-y-6" aria-label="Ma’lumotlar yuklanmoqda"><div className="space-y-3"><Skeleton className="h-7 w-52" /><Skeleton className="h-4 w-80 max-w-full" /></div><Skeleton className="h-64 w-full rounded-xl" /><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-36 rounded-xl" />)}</div></div>;
}
