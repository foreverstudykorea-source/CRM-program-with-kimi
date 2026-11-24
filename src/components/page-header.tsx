import { cn } from "@/lib/utils";

export function PageHeader({ title, description, action, className }: { title: string; description?: string; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between", className)}>
      <div><h1 className="text-2xl font-semibold tracking-[-0.025em] text-foreground">{title}</h1>{description && <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>}</div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
