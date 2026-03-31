"use client";

import { useState, useEffect, useCallback } from "react";
import { detectLocale, saveLocale, getMsg, interpolate, SUPPORTED_LOCALES, type Locale } from "@/lib/i18n";

type Messages = Record<string, unknown>;

export function useTranslations() {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [messages, setMessages] = useState<Messages>({});

  useEffect(() => {
    const detected = detectLocale();
    loadMessages(detected);
  }, []);

  async function loadMessages(loc: Locale) {
    try {
      const mod = await import(`../../messages/${loc}.json`);
      setMessages(mod.default as Messages);
      setLocaleState(loc);
    } catch {
      // Fallback to English
      const mod = await import("../../messages/en.json");
      setMessages(mod.default as Messages);
      setLocaleState("en");
    }
  }

  function setLocale(loc: Locale) {
    saveLocale(loc);
    loadMessages(loc);
  }

  const t = useCallback(
    (key: string, vars?: Record<string, string>): string => {
      const raw = getMsg(messages, key);
      return vars ? interpolate(raw, vars) : raw;
    },
    [messages]
  );

  return { t, locale, setLocale, locales: SUPPORTED_LOCALES };
}
