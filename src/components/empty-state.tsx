import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({ icon: Icon, title, description, action, className }: { icon: LucideIcon; title: string; description: string; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 py-14 text-center", className)}>
      <span className="mb-4 flex size-11 items-center justify-center rounded-xl border border-border bg-muted"><Icon className="size-5 text-muted-foreground" /></span>
      <h2 className="text-sm font-semibold">{title}</h2>
      <p className="mt-1.5 max-w-sm text-sm leading-6 text-muted-foreground">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
