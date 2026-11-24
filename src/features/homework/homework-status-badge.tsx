import { Badge } from "@/components/ui/badge";
import { homeworkStatusLabels } from "@/features/homework/utils";
import type { HomeworkStatus } from "@/features/homework/types";

export function HomeworkStatusBadge({ status }: { status: HomeworkStatus }) {
  return <Badge variant={status === "OVERDUE" ? "destructive" : status === "DUE_SOON" ? "warning" : "default"}>{homeworkStatusLabels[status]}</Badge>;
}
