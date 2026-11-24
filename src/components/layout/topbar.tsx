"use client";

import { useTransition } from "react";
import { usePathname } from "next/navigation";
import { Bell, ChevronRight, LoaderCircle, LogOut, Menu, Search } from "lucide-react";
import type { AuthUser } from "@/features/auth/types";
import { logoutAction } from "@/features/auth/actions";
import { getPageTitle, roleLabels } from "@/components/layout/navigation";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { getInitials, formatPhone } from "@/lib/format";

export function Topbar({ user, onMenuClick, onSearchClick }: { user: AuthUser; onMenuClick: () => void; onSearchClick: () => void }) {
  const pathname = usePathname();
  const [isLoggingOut, startLogout] = useTransition();
  const title = getPageTitle(pathname, user.role);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-border bg-background/95 px-4 backdrop-blur md:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick} aria-label="Menyuni ochish"><Menu className="size-5" /></Button>
      <div className="hidden min-w-0 items-center gap-2 text-sm sm:flex">
        {pathname !== "/" && <><span className="text-muted-foreground">Asosiy</span><ChevronRight className="size-3.5 text-muted-foreground" /></>}
        <span className="truncate font-medium">{title}</span>
      </div>
      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <button type="button" onClick={onSearchClick} className="mr-1 hidden h-9 w-[230px] items-center gap-2 rounded-lg border border-border bg-card px-3 text-left text-sm text-muted-foreground transition-colors hover:bg-muted md:flex xl:w-[280px]" aria-label="Global qidiruvni ochish">
          <Search className="size-4" /><span className="flex-1">Qidirish...</span><kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-sans text-[10px]">Ctrl K</kbd>
        </button>
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onSearchClick} aria-label="Qidirish"><Search className="size-[18px]" /></Button>
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label="Bildirishnomalar"><Bell className="size-[18px]" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0">
            <DropdownMenuLabel className="p-4 text-sm font-semibold text-foreground">Bildirishnomalar</DropdownMenuLabel>
            <DropdownMenuSeparator className="m-0" />
            <div className="flex flex-col items-center px-6 py-8 text-center"><span className="mb-3 flex size-10 items-center justify-center rounded-full bg-muted"><Bell className="size-4 text-muted-foreground" /></span><p className="text-sm font-medium">Hozircha xabar yo‘q</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Yangi bildirishnomalar shu yerda ko‘rinadi.</p></div>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="mx-1 hidden h-6 w-px bg-border sm:block" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="flex min-h-11 items-center gap-2 rounded-lg px-1.5 text-left outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring" aria-label="Foydalanuvchi menyusi">
              <Avatar className="size-8"><AvatarImage src={user.avatarUrl ?? undefined} alt="" /><AvatarFallback>{getInitials(user.fullName)}</AvatarFallback></Avatar>
              <span className="hidden max-w-36 xl:block"><span className="block truncate text-xs font-semibold">{user.fullName}</span><span className="block text-[11px] text-muted-foreground">{user.jobTitle ?? roleLabels[user.role]}</span></span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel className="p-3"><span className="block text-sm font-semibold text-foreground">{user.fullName}</span><span className="mt-1 block text-xs font-normal">{formatPhone(user.phone)}</span></DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" disabled={isLoggingOut} onSelect={(event) => { event.preventDefault(); startLogout(async () => { await logoutAction(); }); }}>
              {isLoggingOut ? <LoaderCircle className="animate-spin" /> : <LogOut />}{isLoggingOut ? "Chiqilmoqda..." : "Tizimdan chiqish"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
