import type { ChargeStatus } from "@/generated/prisma/enums";
import { chargeStatusLabels } from "@/features/finance/labels";
import { Badge } from "@/components/ui/badge";

export function ChargeStatusBadge({ status }: { status: ChargeStatus }) {
  return <Badge variant={status === "PAID" ? "success" : status === "PARTIAL" ? "warning" : "destructive"}>{chargeStatusLabels[status]}</Badge>;
}
