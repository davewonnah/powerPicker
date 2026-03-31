"use client";

import { LOCALE_LABELS, type Locale } from "@/lib/i18n";

interface Props {
  locale: Locale;
  locales: Locale[];
  onLocaleChange: (loc: Locale) => void;
  variant?: "light" | "dark";
}

export function LanguageSwitcher({ locale, locales, onLocaleChange, variant = "light" }: Props) {
  const isDark = variant === "dark";
  return (
    <div className="relative inline-block">
      <select
        value={locale}
        onChange={(e) => onLocaleChange(e.target.value as Locale)}
        className={`appearance-none cursor-pointer rounded-lg border px-3 py-1.5 pr-7 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] ${
          isDark
            ? "bg-white/10 border-white/20 text-white"
            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
        }`}
        aria-label="Select language"
      >
        {locales.map((loc) => (
          <option key={loc} value={loc} className="bg-white text-slate-900">
            {LOCALE_LABELS[loc]}
          </option>
        ))}
      </select>
      <div className={`pointer-events-none absolute inset-y-0 right-2 flex items-center ${isDark ? "text-white/60" : "text-slate-400"}`}>
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </div>
    </div>
  );
}
