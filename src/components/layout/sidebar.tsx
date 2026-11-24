"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import type { AuthUser } from "@/features/auth/types";
import { getNavigation, type NavItem } from "@/components/layout/navigation";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const sections: NavItem["section"][] = ["Asosiy", "Boshqaruv", "Moliya", "Tizim"];

function Navigation({ user, collapsed, onNavigate }: { user: AuthUser; collapsed: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const items = getNavigation(user.role, user.jobTitle);

  return (
    <nav aria-label="Asosiy menyu" className="no-scrollbar flex-1 space-y-5 overflow-y-auto px-3 py-5">
      {sections.map((section) => {
        const sectionItems = items.filter((item) => item.section === section);
        if (!sectionItems.length) return null;
        return (
          <div key={section}>
            {!collapsed && section !== "Asosiy" && <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">{section}</p>}
            {collapsed && section !== "Asosiy" && <div className="mx-3 mb-3 border-t border-border" />}
            <ul className="space-y-1">
              {sectionItems.map((item) => {
                const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                const link = <Link href={item.href} onClick={onNavigate} aria-current={active ? "page" : undefined} title={collapsed ? item.label : undefined} className={cn("flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground", active && "bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary", collapsed && "justify-center px-0")}><item.icon className="size-[18px] shrink-0" strokeWidth={active ? 2.2 : 1.8} /><span className={cn("truncate", collapsed && "sr-only")}>{item.label}</span>{active && !collapsed && <span className="ml-auto size-1.5 rounded-full bg-primary" />}</Link>;
                return <li key={`${item.href}-${item.label}`}>{collapsed ? <Tooltip><TooltipTrigger asChild>{link}</TooltipTrigger><TooltipContent side="right">{item.label}</TooltipContent></Tooltip> : link}</li>;
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}

export function Sidebar({ user, collapsed, onToggle, mobileOpen, onMobileOpenChange }: { user: AuthUser; collapsed: boolean; onToggle: () => void; mobileOpen: boolean; onMobileOpenChange: (open: boolean) => void }) {
  return (
    <>
      <aside className={cn("fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-border bg-sidebar transition-[width] duration-200 lg:flex", collapsed ? "w-[76px]" : "w-[256px]")}>
        <div className={cn("flex h-16 shrink-0 items-center border-b border-border px-5", collapsed && "justify-center px-3")}><Logo compact={collapsed} /></div>
        <Navigation user={user} collapsed={collapsed} />
        <div className={cn("border-t border-border p-3", collapsed && "flex justify-center")}>
          <Button variant="ghost" size={collapsed ? "icon" : "default"} onClick={onToggle} className={cn("text-xs", !collapsed && "w-full justify-start px-3")} aria-label={collapsed ? "Yon panelni ochish" : "Yon panelni yig‘ish"}>
            {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}{!collapsed && "Yig‘ish"}
          </Button>
        </div>
      </aside>

      <Dialog open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <DialogContent className="left-0 top-0 flex h-dvh w-[280px] max-w-[85vw] translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-y-0 border-l-0 bg-sidebar p-0" showCloseButton={false}>
          <DialogHeader className="sr-only"><DialogTitle>Asosiy menyu</DialogTitle><DialogDescription>Tizim sahifalari bo‘yicha navigatsiya</DialogDescription></DialogHeader>
          <div className="flex h-16 shrink-0 items-center border-b border-border px-5"><Logo /></div>
          <Navigation user={user} collapsed={false} onNavigate={() => onMobileOpenChange(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
