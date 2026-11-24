import type { AttendanceStatus } from "@/generated/prisma/enums";
import { attendanceStatusLabels } from "@/features/attendance/types";
import { Badge } from "@/components/ui/badge";

const variants = { PRESENT: "success", ABSENT: "destructive", LATE: "warning", EXCUSED: "secondary" } as const;

export function AttendanceStatusBadge({ status }: { status: AttendanceStatus }) {
  return <Badge variant={variants[status]}>{attendanceStatusLabels[status]}</Badge>;
}
