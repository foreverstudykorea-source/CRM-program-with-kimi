import { BookOpen, CalendarDays, ExternalLink, Paperclip } from "lucide-react";
import type { HomeworkItem } from "@/features/homework/types";
import { HomeworkStatusBadge } from "@/features/homework/homework-status-badge";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/format";

export function HomeworkCard({ item, action }: { item: HomeworkItem; action?: React.ReactNode }) {
  return (
    <Card className="flex h-full flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2"><HomeworkStatusBadge status={item.status} /><span className="text-[11px] text-muted-foreground">{formatDate(item.createdAt)}</span></div>
        {action}
      </div>
      <h3 className="mt-4 text-base font-semibold leading-6 tracking-[-0.01em]">{item.title}</h3>
      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground"><BookOpen className="size-3.5 shrink-0" /><span>{item.groupName}</span></div>
      <p className="mt-4 flex-1 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{item.description}</p>
      <div className="mt-5 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-xs font-medium"><CalendarDays className="size-4 text-muted-foreground" /><span>Muddat: <time dateTime={item.dueDate} className="tabular-nums">{formatDate(item.dueDate)}</time></span></div>
        {item.attachmentUrl && <a href={item.attachmentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-8 items-center gap-1.5 rounded-md text-xs font-medium text-primary hover:underline"><Paperclip className="size-3.5" />Materialni ochish<ExternalLink className="size-3" /></a>}
      </div>
    </Card>
  );
}
