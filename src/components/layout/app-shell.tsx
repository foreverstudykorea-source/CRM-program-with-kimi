"use client";

import { useEffect, useState } from "react";
import type { AuthUser } from "@/features/auth/types";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { CommandPalette } from "@/components/layout/command-palette";
import { cn } from "@/lib/utils";

export function AppShell({ user, children }: { user: AuthUser; children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((open) => !open);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="min-h-dvh">
      <a href="#main-content" className="fixed left-4 top-3 z-[100] -translate-y-20 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-transform focus:translate-y-0">Asosiy tarkibga o‘tish</a>
      <Sidebar user={user} collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} mobileOpen={mobileOpen} onMobileOpenChange={setMobileOpen} />
      <div className={cn("min-h-dvh transition-[padding] duration-200", collapsed ? "lg:pl-[76px]" : "lg:pl-[256px]")}>
        <Topbar user={user} onMenuClick={() => setMobileOpen(true)} onSearchClick={() => setCommandOpen(true)} />
        <main id="main-content" className="mx-auto w-full max-w-[1600px] p-4 md:p-6 lg:p-8">{children}</main>
      </div>
      <CommandPalette user={user} open={commandOpen} onOpenChange={setCommandOpen} />
    </div>
  );
}
