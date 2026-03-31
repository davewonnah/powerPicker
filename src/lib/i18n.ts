export type Locale = "en" | "fr" | "sw";

export const SUPPORTED_LOCALES: Locale[] = ["en", "fr", "sw"];
export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  sw: "Kiswahili",
};

// Detect best locale from browser or localStorage
export function detectLocale(): Locale {
  if (typeof window === "undefined") return "en";

  const stored = localStorage.getItem("pp_locale") as Locale | null;
  if (stored && SUPPORTED_LOCALES.includes(stored)) return stored;

  const browserLang = navigator.language.split("-")[0].toLowerCase();
  if (SUPPORTED_LOCALES.includes(browserLang as Locale)) return browserLang as Locale;

  return "en";
}

export function saveLocale(locale: Locale) {
  if (typeof window !== "undefined") localStorage.setItem("pp_locale", locale);
}

// Nested key getter: t("vote.submitVote") → messages.vote.submitVote
export function getMsg(messages: Record<string, unknown>, key: string): string {
  const parts = key.split(".");
  let val: unknown = messages;
  for (const part of parts) {
    if (typeof val !== "object" || val === null) return key;
    val = (val as Record<string, unknown>)[part];
  }
  return typeof val === "string" ? val : key;
}

// Simple interpolation: t("vote.closesIn", { time: "01:30" })
export function interpolate(str: string, vars: Record<string, string>): string {
  return str.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`);
}
