import { BarChart3, BookOpenCheck, CalendarCheck2, ClipboardList, GraduationCap, LayoutDashboard, Mail, ReceiptText, ScrollText, UserRoundCog, UsersRound, WalletCards, type LucideIcon } from "lucide-react";
import type { Role } from "@/generated/prisma/enums";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: Role[];
  section: "Asosiy" | "Boshqaruv" | "Moliya" | "Tizim";
};

const allRoles: Role[] = ["STUDENT", "TEACHER", "ADMIN", "FINANCE"];

export const navigation: NavItem[] = [
  { label: "Bosh sahifa", href: "/", icon: LayoutDashboard, roles: allRoles, section: "Asosiy" },
  { label: "Davomat", href: "/attendance", icon: CalendarCheck2, roles: ["STUDENT", "TEACHER", "ADMIN"], section: "Asosiy" },
  { label: "Uy vazifalari", href: "/homework", icon: BookOpenCheck, roles: ["STUDENT", "TEACHER"], section: "Asosiy" },
  { label: "Xabarlar", href: "/messages", icon: Mail, roles: ["STUDENT", "ADMIN", "FINANCE"], section: "Asosiy" },
  { label: "Guruhlarim", href: "/groups", icon: UsersRound, roles: ["TEACHER"], section: "Asosiy" },
  { label: "Support darslari", href: "/support", icon: CalendarCheck2, roles: ["STUDENT", "TEACHER"], section: "Asosiy" },
  { label: "O‘quvchilar", href: "/students", icon: GraduationCap, roles: ["ADMIN"], section: "Boshqaruv" },
  { label: "Xodimlar", href: "/teachers", icon: UserRoundCog, roles: ["ADMIN"], section: "Boshqaruv" },
  { label: "Guruhlar", href: "/groups", icon: UsersRound, roles: ["ADMIN"], section: "Boshqaruv" },
  { label: "Kurslar", href: "/courses", icon: ClipboardList, roles: ["ADMIN"], section: "Boshqaruv" },
  { label: "To‘lovlar", href: "/payments", icon: WalletCards, roles: ["STUDENT", "ADMIN", "FINANCE"], section: "Moliya" },
  { label: "Moliya", href: "/finance", icon: ReceiptText, roles: ["FINANCE"], section: "Moliya" },
  { label: "Qarzdorlar", href: "/debtors", icon: ReceiptText, roles: ["FINANCE"], section: "Moliya" },
  { label: "Hisobotlar", href: "/reports", icon: BarChart3, roles: ["FINANCE"], section: "Moliya" },
  { label: "Foydalanuvchilar", href: "/users", icon: UserRoundCog, roles: ["ADMIN"], section: "Tizim" },
  { label: "Audit jurnali", href: "/audit-log", icon: ScrollText, roles: ["ADMIN"], section: "Tizim" },
];

export const roleLabels: Record<Role, string> = {
  STUDENT: "O‘quvchi",
  TEACHER: "Ustoz",
  ADMIN: "Administrator",
  FINANCE: "Moliya admini",
};

export function getNavigation(role: Role, jobTitle?: string | null) {
  return navigation.filter((item) => item.roles.includes(role) && !(role === "TEACHER" && jobTitle && jobTitle !== "Ustoz" && item.href === "/attendance") && !(role === "TEACHER" && jobTitle === "Ustoz" && item.href === "/support"));
}

export function canAccessPath(role: Role, pathname: string) {
  if (pathname === "/") return true;
  return navigation.some((item) => item.roles.includes(role) && (pathname === item.href || pathname.startsWith(`${item.href}/`)));
}

export function getPageTitle(pathname: string, role: Role) {
  return navigation.find((item) => item.roles.includes(role) && item.href !== "/" && (pathname === item.href || pathname.startsWith(`${item.href}/`)))?.label ?? "Bosh sahifa";
}

