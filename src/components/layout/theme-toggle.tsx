"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, SunMoon } from "lucide-react";
import { Button } from "@/components/ui/button";

const subscribe = () => () => undefined;

export function ThemeToggle() {
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const { resolvedTheme, setTheme } = useTheme();
  const Icon = !mounted ? SunMoon : resolvedTheme === "dark" ? Moon : Sun;
  const label = !mounted ? "Mavzuni almashtirish" : resolvedTheme === "dark" ? "Yorug‘ rejimga o‘tish" : "Tungi rejimga o‘tish";

  return <Button variant="ghost" size="icon" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} aria-label={label} disabled={!mounted}><Icon className="size-[18px]" /></Button>;
}
