"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { setTeacherLocaleAction } from "@/features/i18n/actions";
import { teacherText, type TeacherLocale } from "@/features/i18n/teacher-dictionary";

type LocaleContextValue = {
  locale: TeacherLocale;
  setLocale: (locale: TeacherLocale) => void;
  t: (text: string) => string;
};

const TeacherLocaleContext = createContext<LocaleContextValue>({ locale: "uz", setLocale: () => undefined, t: (text) => text });

export function TeacherLocaleProvider({ initialLocale, children }: { initialLocale: TeacherLocale; children: React.ReactNode }) {
  const router = useRouter();
  const [locale, setLocaleState] = useState(initialLocale);

  const setLocale = useCallback((nextLocale: TeacherLocale) => {
    setLocaleState(nextLocale);
    void setTeacherLocaleAction(nextLocale).then(() => router.refresh());
  }, [router]);
  const t = useCallback((text: string) => teacherText(locale, text), [locale]);
  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <TeacherLocaleContext.Provider value={value}>{children}</TeacherLocaleContext.Provider>;
}

export function useTeacherLocale() {
  return useContext(TeacherLocaleContext);
}
