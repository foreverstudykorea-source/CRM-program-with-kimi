"use client";

import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import type { AuthUser } from "@/features/auth/types";
import { getNavigation } from "@/components/layout/navigation";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from "@/components/ui/command";

export function CommandPalette({ user, open, onOpenChange }: { user: AuthUser; open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const items = getNavigation(user.role, user.jobTitle);

  function navigate(href: string) {
    onOpenChange(false);
    router.push(href);
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} title="Global qidiruv" description="Sahifa yoki buyruqni qidiring">
      <CommandInput placeholder="Sahifa yoki buyruq qidirish..." autoFocus />
      <CommandList>
        <CommandEmpty>Hech narsa topilmadi.</CommandEmpty>
        <CommandGroup heading="Sahifalar">
          {items.map((item) => <CommandItem key={`${item.href}-${item.label}`} value={item.label} onSelect={() => navigate(item.href)}><item.icon />{item.label}<CommandShortcut>Ochish</CommandShortcut></CommandItem>)}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Sozlamalar">
          <CommandItem value="Mavzuni almashtirish" onSelect={() => { setTheme(resolvedTheme === "dark" ? "light" : "dark"); onOpenChange(false); }}>
            {resolvedTheme === "dark" ? <Sun /> : <Moon />}{resolvedTheme === "dark" ? "Yorug‘ rejim" : "Tungi rejim"}
          </CommandItem>
        </CommandGroup>
      </CommandList>
      <div className="flex items-center justify-between border-t border-border bg-muted/40 px-4 py-2.5 text-[11px] text-muted-foreground"><span>Tanlash uchun Enter</span><span>Yopish uchun Esc</span></div>
    </CommandDialog>
  );
}
