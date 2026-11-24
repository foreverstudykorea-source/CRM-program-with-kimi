import type { StudentPaymentStatus, StudentStatus } from "@/generated/prisma/enums";

export type StudentListItem = {
  id: string;
  fullName: string;
  phone: string;
  groups: string[];
  plannedGroup: string | null;
  status: StudentStatus;
  paymentStatus: StudentPaymentStatus;
  debtAmount: number | null;
  salesManager: string | null;
  notes: string | null;
  joinedAt: string;
};
