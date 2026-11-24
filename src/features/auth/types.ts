import type { Role } from "@/generated/prisma/enums";

export type AuthUser = {
  id: string;
  fullName: string;
  phone: string;
  role: Role;
  isActive: boolean;
  avatarUrl: string | null;
  jobTitle: string | null;
};
