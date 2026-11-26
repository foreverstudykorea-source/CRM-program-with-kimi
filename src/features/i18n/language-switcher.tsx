"use client";

import { Languages } from "lucide-react";
import { useTeacherLocale } from "@/features/i18n/teacher-locale-provider";
import { Button } from "@/components/ui/button";

export function LanguageSwitcher() {
  const { locale, setLocale } = useTeacherLocale();
  const nextLocale = locale === "uz" ? "ko" : "uz";
  return <Button variant="outline" size="sm" onClick={() => setLocale(nextLocale)} aria-label={nextLocale === "ko" ? "한국어로 전환" : "O‘zbek tiliga o‘tish"} title={nextLocale === "ko" ? "한국어로 전환" : "O‘zbek tiliga o‘tish"}><Languages />{nextLocale === "ko" ? "한국어" : "O‘zbek"}</Button>;
}
