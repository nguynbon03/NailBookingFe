"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import type { Language } from "@/lib/translations";

const STORAGE_KEY = "nail_language";
const DEFAULT_LANG: Language = (
  String(process.env.NEXT_PUBLIC_SHOP_LANGUAGE || "en").toLowerCase().startsWith("vi") ? "vi" : "en"
) as Language;

interface LanguageCtx {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
}

const LanguageContext = createContext<LanguageCtx | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(DEFAULT_LANG);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "vi") {
      setLangState(saved);
    }
  }, []);

  const setLang = useCallback((next: Language) => {
    setLangState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const toggleLang = useCallback(() => {
    setLang(lang === "en" ? "vi" : "en");
  }, [lang, setLang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be in LanguageProvider");
  return ctx;
}
