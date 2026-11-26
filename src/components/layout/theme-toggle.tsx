"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, SunMoon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTeacherLocale } from "@/features/i18n/teacher-locale-provider";

const subscribe = () => () => undefined;

export function ThemeToggle() {
  const { t } = useTeacherLocale();
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const { resolvedTheme, setTheme } = useTheme();
  const Icon = !mounted ? SunMoon : resolvedTheme === "dark" ? Moon : Sun;
  const label = !mounted ? t("Mavzuni almashtirish") : resolvedTheme === "dark" ? t("Yorug‘ rejimga o‘tish") : t("Tungi rejimga o‘tish");

  return <Button variant="ghost" size="icon" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} aria-label={label} disabled={!mounted}><Icon className="size-[18px]" /></Button>;
}
