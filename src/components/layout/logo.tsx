import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ compact = false, inverted = false }: { compact?: boolean; inverted?: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-primary text-primary-foreground">
        <GraduationCap className="size-5" strokeWidth={2} />
      </span>
      {!compact && (
        <span className="min-w-0">
          <span className={cn("block truncate text-[15px] font-bold tracking-[-0.02em]", inverted && "text-white")}>Forever Study</span>
          <span className={cn("block text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase", inverted && "text-zinc-400")}>Ichki CRM</span>
        </span>
      )}
    </div>
  );
}
