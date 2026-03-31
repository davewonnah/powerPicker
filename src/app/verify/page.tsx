"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { verifyVote } from "@/lib/api";
import { useTranslations } from "@/hooks/useTranslations";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

type VerifyResult =
  | { verified: true; pollTitle: string; pollStatus: string; votedAt: string; voterName: string | null }
  | { verified: false; message: string };

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyContent />
    </Suspense>
  );
}

function VerifyContent() {
  const searchParams = useSearchParams();
  const [token, setToken] = useState(searchParams.get("token") ?? "");
  const [loading, setLoading] = useState(false);
  const { t, locale, setLocale, locales } = useTranslations();

  // Auto-verify if token comes from URL
  useEffect(() => {
    const urlToken = searchParams.get("token");
    if (urlToken) {
      setToken(urlToken);
    }
  }, [searchParams]);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [inputError, setInputError] = useState("");

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = token.trim();
    if (!cleaned) {
      setInputError("Please enter your confirmation number.");
      return;
    }
    setInputError("");
    setResult(null);
    setLoading(true);
    try {
      const data = await verifyVote(cleaned);
      if (data.verified) {
        setResult({
          verified: true,
          pollTitle: data.pollTitle!,
          pollStatus: data.pollStatus!,
          votedAt: data.votedAt!,
          voterName: data.voterName ?? null,
        });
      } else {
        setResult({ verified: false, message: data.message ?? "No vote found with this confirmation number." });
      }
    } catch {
      setResult({ verified: false, message: "Unable to verify. Please check your confirmation number and try again." });
    } finally {
      setLoading(false);
    }
  }

  const votedAtFormatted = result?.verified
    ? new Date(result.votedAt).toLocaleString("en-US", {
        month: "long", day: "numeric", year: "numeric",
        hour: "numeric", minute: "2-digit",
      })
    : null;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <a href="/" className="text-xl font-bold text-[#1E3A8A]">PowerPicker</a>
          <div className="flex items-center gap-3">
            <LanguageSwitcher locale={locale} locales={locales} onLocaleChange={setLocale} />
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-[#1E3A8A] ring-1 ring-inset ring-[#1E3A8A]/20">
              {t("verify.voteVerification")}
            </span>
          </div>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#1E3A8A]/10">
              <svg className="h-7 w-7 text-[#1E3A8A]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{t("verify.title")}</h1>
            <p className="text-sm text-slate-500">{t("verify.desc")}</p>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label htmlFor="token" className="block text-sm font-medium text-slate-700 mb-1.5">
                {t("verify.label")}
              </label>
              <input
                id="token"
                type="text"
                value={token}
                onChange={(e) => { setToken(e.target.value); setInputError(""); setResult(null); }}
                placeholder="e.g. 5-12-ABC123-XYZ"
                className={`block w-full rounded-lg border px-4 py-3 text-sm font-mono shadow-sm focus:outline-none focus:ring-2 ${
                  inputError
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-slate-300 focus:border-[#1E3A8A] focus:ring-[#1E3A8A]"
                }`}
              />
              {inputError && <p className="mt-1.5 text-xs text-red-600">{inputError}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#1E3A8A] px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-900 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {t("verify.verifying")}
                </span>
              ) : t("verify.button")}
            </button>
          </form>

          {/* Result */}
          {result !== null && (
            result.verified ? (
              <div className="rounded-xl border border-[#10B981]/30 bg-[#10B981]/5 p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#10B981]/15">
                    <svg className="h-6 w-6 text-[#10B981]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{t("verify.verified")}</p>
                    <p className="text-xs text-slate-500">{t("verify.verifiedDesc")}</p>
                  </div>
                </div>

                <dl className="space-y-2 text-sm border-t border-[#10B981]/20 pt-4">
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Election</dt>
                    <dd className="font-medium text-slate-800 text-right max-w-[60%]">{result.pollTitle}</dd>
                  </div>
                  {result.voterName && (
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Voter</dt>
                      <dd className="font-medium text-slate-800">{result.voterName}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Voted at</dt>
                    <dd className="font-medium text-slate-800">{votedAtFormatted}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Status</dt>
                    <dd>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                        result.pollStatus === "active"
                          ? "bg-green-50 text-green-700 ring-green-600/20"
                          : result.pollStatus === "ended"
                          ? "bg-slate-100 text-slate-600 ring-slate-500/10"
                          : "bg-yellow-50 text-yellow-700 ring-yellow-600/20"
                      }`}>
                        {result.pollStatus}
                      </span>
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Confirmation #</dt>
                    <dd className="font-mono text-xs text-slate-700 break-all text-right max-w-[60%]">{token.trim()}</dd>
                  </div>
                </dl>
              </div>
            ) : (
              <div className="rounded-xl border border-red-200 bg-red-50 p-5 flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100">
                  <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-red-800">Not Found</p>
                  <p className="text-xs text-red-600 mt-0.5">{result.message}</p>
                </div>
              </div>
            )
          )}

          <p className="text-center text-xs text-slate-400">{t("verify.footer")}</p>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
        Secured by PowerPicker &middot; Votes are encrypted and anonymous.
      </footer>
    </div>
  );
}
