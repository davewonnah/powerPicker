"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { getPoll, castPublicVote, requestOtp, type Poll } from "@/lib/api";
import { useTranslations } from "@/hooks/useTranslations";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

function useCountdown(closesAt: string | null) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number; expired: boolean } | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!closesAt) return;

    function calc() {
      const diff = new Date(closesAt!).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
        if (intervalRef.current) clearInterval(intervalRef.current);
        return;
      }
      const totalSeconds = Math.floor(diff / 1000);
      setTimeLeft({
        days: Math.floor(totalSeconds / 86400),
        hours: Math.floor((totalSeconds % 86400) / 3600),
        minutes: Math.floor((totalSeconds % 3600) / 60),
        seconds: totalSeconds % 60,
        expired: false,
      });
    }

    calc();
    intervalRef.current = setInterval(calc, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [closesAt]);

  return timeLeft;
}

type Step = "code" | "otp" | "ballot" | "confirmed";

export default function VotePage() {
  const { id } = useParams<{ id: string }>();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [step, setStep] = useState<Step>("code");
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedMultiple, setSelectedMultiple] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [voterName, setVoterName] = useState("");
  const [confirmationId, setConfirmationId] = useState("");
  const [selectionLabel, setSelectionLabel] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState("");

  const countdown = useCountdown(poll?.closes_at ?? null);
  const { t, locale, setLocale, locales } = useTranslations();

  useEffect(() => {
    getPoll(id)
      .then(({ poll }) => {
        setPoll(poll);
        if (poll.voter_access === "link") {
          setStep("ballot");
        }
      })
      .catch((err) => setFetchError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const langSwitcher = <LanguageSwitcher locale={locale} locales={locales} onLocaleChange={setLocale} />;

  if (loading) {
    return (
      <Shell langSwitcher={langSwitcher} secureLabel={t("vote.secureVote")} footerText={t("vote.footer")}>
        <div className="w-full max-w-md text-center space-y-4">
          <div className="mx-auto h-14 w-14 rounded-full bg-slate-100 animate-pulse" />
          <div className="h-6 w-48 mx-auto rounded bg-slate-200 animate-pulse" />
        </div>
      </Shell>
    );
  }

  if (fetchError || !poll) {
    return (
      <Shell langSwitcher={langSwitcher} secureLabel={t("vote.secureVote")} footerText={t("vote.footer")}>
        <div className="w-full max-w-md text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
            <svg className="h-7 w-7 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{t("vote.notFound")}</h1>
          <p className="text-sm text-slate-500">{fetchError || t("vote.notFoundDesc")}</p>
          <a href="/" className="inline-block rounded-lg border border-slate-300 px-6 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100">
            {t("vote.backHome")}
          </a>
        </div>
      </Shell>
    );
  }

  if (poll.status === "ended") {
    return (
      <Shell langSwitcher={langSwitcher} secureLabel={t("vote.secureVote")} footerText={t("vote.footer")}>
        <div className="w-full max-w-md text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
            <svg className="h-7 w-7 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{t("vote.ended")}</h1>
          <p className="text-sm text-slate-500">{t("vote.endedDesc", { title: poll.title })}</p>
          <a href="/" className="inline-block rounded-lg border border-slate-300 px-6 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100">
            {t("vote.backHome")}
          </a>
        </div>
      </Shell>
    );
  }

  if (poll.status === "draft") {
    return (
      <Shell langSwitcher={langSwitcher} secureLabel={t("vote.secureVote")} footerText={t("vote.footer")}>
        <div className="w-full max-w-md text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-yellow-100">
            <svg className="h-7 w-7 text-yellow-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{t("vote.notStarted")}</h1>
          <p className="text-sm text-slate-500">{t("vote.notStartedDesc", { title: poll.title })}</p>
          <a href="/" className="inline-block rounded-lg border border-slate-300 px-6 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100">
            {t("vote.backHome")}
          </a>
        </div>
      </Shell>
    );
  }

  async function handleCodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!poll) return;
    const cleaned = code.trim().toUpperCase();
    if (cleaned.replace("-", "").length < 8) {
      setCodeError("Please enter a valid voting code.");
      return;
    }

    // For link-based polls, skip straight to ballot
    if (poll.voter_access === "link") {
      setVoterName("Voter");
      setCodeError("");
      setStep("ballot");
      return;
    }

    // For email-based polls, request OTP first
    setOtpLoading(true);
    setCodeError("");
    try {
      const result = await requestOtp(poll.id, cleaned);
      setMaskedEmail(result.maskedEmail);
      setStep("otp");
    } catch (err) {
      setCodeError(err instanceof Error ? err.message : "Could not send verification code.");
    } finally {
      setOtpLoading(false);
    }
  }

  function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (otp.trim().length !== 6) {
      setOtpError("Please enter the 6-digit code.");
      return;
    }
    setOtpError("");
    setStep("ballot");
  }

  function toggleMultiple(optionId: string) {
    setSelectedMultiple((prev) => {
      const next = new Set(prev);
      if (next.has(optionId)) next.delete(optionId);
      else next.add(optionId);
      return next;
    });
  }

  async function handleVoteSubmit() {
    if (!poll) return;
    const optionIds =
      poll.vote_type === "multiple"
        ? Array.from(selectedMultiple)
        : selected !== null ? [selected] : [];

    if (optionIds.length === 0) return;

    setSubmitError("");
    setSubmitting(true);
    try {
      const result = await castPublicVote(poll.id, code.trim().toUpperCase() || undefined, optionIds, otp.trim() || undefined);
      setConfirmationId(result.confirmationId);

      // Build selection label for confirmation screen
      if (poll.vote_type === "multiple") {
        setSelectionLabel(
          poll.options
            .filter((o) => optionIds.includes(o.id))
            .map((o) => o.label)
            .join(", ")
        );
      } else {
        setSelectionLabel(poll.options.find((o) => o.id === selected)?.label ?? "");
      }

      setStep("confirmed");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to submit vote");
    } finally {
      setSubmitting(false);
    }
  }

  const hasSelection =
    poll.vote_type === "multiple" ? selectedMultiple.size > 0 : selected !== null;

  const typeLabels = { single: "Single choice", multiple: "Multiple choice", ranked: "Ranked choice" };
  const instructionLabels = { single: "Select one option", multiple: "Select all that apply", ranked: "Select your top choice" };

  const endDateStr = poll.closes_at
    ? new Date(poll.closes_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })
    : null;

  return (
    <Shell langSwitcher={langSwitcher} secureLabel={t("vote.secureVote")} footerText={t("vote.footer")}>
      {/* Step: Code entry */}
      {step === "code" && (
        <div className="w-full max-w-md space-y-6">
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-blue-800">PowerPicker</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{poll.title}</p>
            {countdown && !countdown.expired && (
              <p className="mt-1.5 text-xs font-mono text-amber-600">
                Closes in {countdown.days > 0 ? `${countdown.days}d ` : ""}{String(countdown.hours).padStart(2, "0")}:{String(countdown.minutes).padStart(2, "0")}:{String(countdown.seconds).padStart(2, "0")}
              </p>
            )}
            {countdown?.expired && (
              <p className="mt-1.5 text-xs font-medium text-red-500">Voting has closed</p>
            )}
          </div>

          {poll.voter_access === "link" ? (
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
                <svg className="h-7 w-7 text-blue-800" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Ready to Vote</h1>
              <p className="text-sm text-slate-500">{t("vote.openPollDesc")}</p>
              <button
                onClick={() => setStep("ballot")}
                className="w-full rounded-lg bg-blue-800 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-900"
              >
                {t("vote.accessBallot")}
              </button>
            </div>
          ) : (
            <>
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
                  <svg className="h-7 w-7 text-blue-800" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                </div>
                <h1 className="mt-4 text-2xl font-bold text-slate-900">{t("vote.enterCode")}</h1>
                <p className="mt-2 text-sm text-slate-500">{t("vote.enterCodeDesc")}</p>
              </div>

              <form onSubmit={handleCodeSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => { setCode(e.target.value.toUpperCase()); setCodeError(""); }}
                    placeholder="XXXX-XXXX"
                    maxLength={9}
                    className={`block w-full rounded-lg border px-4 py-3 text-center text-lg font-semibold tracking-[0.3em] shadow-sm focus:outline-none focus:ring-2 ${
                      codeError
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                        : "border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    }`}
                  />
                  {codeError && <p className="mt-2 text-sm text-red-600">{codeError}</p>}
                </div>
                <button
                  type="submit"
                  disabled={otpLoading}
                  className="w-full rounded-lg bg-blue-800 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-900 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {otpLoading ? (
                    <span className="inline-flex items-center gap-2 justify-center">
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Sending code…
                    </span>
                  ) : t("vote.accessBallot")}
                </button>
              </form>

              <p className="text-center text-xs text-slate-400">{t("vote.codeSingleUse")}</p>
            </>
          )}
        </div>
      )}

      {/* Step: OTP verification */}
      {step === "otp" && (
        <div className="w-full max-w-md space-y-6">
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-blue-800">PowerPicker</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{poll.title}</p>
          </div>

          <div className="text-center space-y-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
              <svg className="h-7 w-7 text-blue-800" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{t("vote.otp.title")}</h1>
            <p className="text-sm text-slate-500">
              {t("vote.otp.desc", { email: maskedEmail })}
            </p>
          </div>

          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "").slice(0, 6)); setOtpError(""); }}
                placeholder="000000"
                maxLength={6}
                className={`block w-full rounded-lg border px-4 py-3 text-center text-2xl font-bold tracking-[0.5em] shadow-sm focus:outline-none focus:ring-2 ${
                  otpError
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                }`}
              />
              {otpError && <p className="mt-2 text-sm text-red-600">{otpError}</p>}
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-blue-800 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-900"
            >
              {t("vote.otp.verify")}
            </button>
            <button
              type="button"
              onClick={() => setStep("code")}
              className="w-full text-sm text-slate-500 hover:text-slate-700"
            >
              {t("vote.otp.back")}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400">{t("vote.otp.expiry")}</p>
        </div>
      )}

      {/* Step: Ballot */}
      {step === "ballot" && (
        <div className="w-full max-w-2xl space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-blue-800">PowerPicker</p>
              <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                Verified
              </span>
            </div>
            <h1 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">{poll.title}</h1>
            {poll.description && <p className="mt-2 text-sm text-slate-500">{poll.description}</p>}
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-400">
              {voterName && (
                <span className="inline-flex items-center gap-1">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                  Voting as {voterName}
                </span>
              )}
              {endDateStr && !countdown && (
                <span className="inline-flex items-center gap-1">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  Closes {endDateStr}
                </span>
              )}
              {countdown && !countdown.expired && (
                <span className="inline-flex items-center gap-1 font-mono text-amber-600">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  {countdown.days > 0 && `${countdown.days}d `}
                  {String(countdown.hours).padStart(2, "0")}:{String(countdown.minutes).padStart(2, "0")}:{String(countdown.seconds).padStart(2, "0")} remaining
                </span>
              )}
              {countdown?.expired && (
                <span className="inline-flex items-center gap-1 text-red-500">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  Voting closed
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                </svg>
                {typeLabels[poll.vote_type]} &middot; Anonymous
              </span>
            </div>
          </div>

          {/* Countdown banner — shown when under 1 hour remains */}
          {countdown && !countdown.expired && countdown.days === 0 && countdown.hours === 0 && (
            <div className="flex items-center gap-3 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
              <svg className="h-5 w-5 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-amber-800">Voting closes soon!</p>
                <p className="text-xs text-amber-600 font-mono">
                  {String(countdown.minutes).padStart(2, "0")}:{String(countdown.seconds).padStart(2, "0")} remaining — submit your vote before time runs out.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-700">{instructionLabels[poll.vote_type]}</h2>
            {poll.options.map((option) => {
              const isSelected =
                poll.vote_type === "multiple"
                  ? selectedMultiple.has(option.id)
                  : selected === option.id;
              const hasDetails = option.candidate_position || option.party || option.bio || option.image_url;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() =>
                    poll.vote_type === "multiple"
                      ? toggleMultiple(option.id)
                      : setSelected(option.id)
                  }
                  className={`flex w-full items-start gap-4 rounded-xl border p-4 text-left transition-all sm:p-5 ${
                    isSelected
                      ? "border-blue-800 bg-blue-50 ring-2 ring-blue-800"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                  }`}
                >
                  {/* Selector */}
                  <div className="mt-0.5 shrink-0">
                    {poll.vote_type === "multiple" ? (
                      <div className={`flex h-5 w-5 items-center justify-center rounded border-2 ${isSelected ? "border-blue-800 bg-blue-800" : "border-slate-300"}`}>
                        {isSelected && (
                          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                          </svg>
                        )}
                      </div>
                    ) : (
                      <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${isSelected ? "border-blue-800" : "border-slate-300"}`}>
                        {isSelected && <div className="h-2.5 w-2.5 rounded-full bg-blue-800" />}
                      </div>
                    )}
                  </div>

                  {/* Photo */}
                  {option.image_url && (
                    <img
                      src={option.image_url}
                      alt={option.label}
                      className="h-14 w-14 shrink-0 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold ${isSelected ? "text-blue-900" : "text-slate-900"}`}>
                      {option.label}
                    </p>
                    {hasDetails && (
                      <div className="mt-1 flex flex-wrap gap-2">
                        {option.candidate_position && (
                          <span className="text-xs font-medium text-slate-500">{option.candidate_position}</span>
                        )}
                        {option.party && (
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                            isSelected ? "bg-blue-100 text-blue-900 ring-blue-800/20" : "bg-slate-100 text-slate-600 ring-slate-500/10"
                          }`}>
                            {option.party}
                          </span>
                        )}
                      </div>
                    )}
                    {option.bio && (
                      <p className="mt-1.5 text-xs text-slate-500 leading-relaxed line-clamp-2">{option.bio}</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {submitError && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-400">Your vote is anonymous and final once submitted.</p>
            <button
              onClick={handleVoteSubmit}
              disabled={!hasSelection || submitting}
              className="rounded-lg bg-blue-800 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {t("vote.submitting")}
                </span>
              ) : t("vote.submitVote")}
            </button>
          </div>
        </div>
      )}

      {/* Step: Confirmed */}
      {step === "confirmed" && (
        <div className="w-full max-w-md text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{t("vote.submitted")}</h1>
            <p className="mt-2 text-sm text-slate-500">{t("vote.submittedDesc", { title: poll.title })}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 text-left">
            <h2 className="text-sm font-semibold text-slate-900">{t("vote.confirmationDetails")}</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">{t("vote.election")}</dt>
                <dd className="font-medium text-slate-700 text-right max-w-[60%]">{poll.title}</dd>
              </div>
              {selectionLabel && (
                <div className="flex justify-between">
                  <dt className="text-slate-500">{t("vote.yourChoice")}</dt>
                  <dd className="font-medium text-slate-700 text-right max-w-[60%]">{selectionLabel}</dd>
                </div>
              )}
              {confirmationId && (
                <div className="flex justify-between">
                  <dt className="text-slate-500">{t("vote.confirmationNum")}</dt>
                  <dd className="font-mono text-xs font-medium text-slate-700">{confirmationId}</dd>
                </div>
              )}
              {endDateStr && (
                <div className="flex justify-between">
                  <dt className="text-slate-500">Results available</dt>
                  <dd className="font-medium text-slate-700">{endDateStr}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <a href="/" className="inline-block rounded-lg border border-slate-300 px-6 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100">
              Back to Home
            </a>
            {confirmationId && (
              <a
                href={`/verify?token=${encodeURIComponent(confirmationId)}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#1E3A8A]/30 bg-[#1E3A8A]/5 px-6 py-2.5 text-sm font-medium text-[#1E3A8A] hover:bg-[#1E3A8A]/10"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                </svg>
                {t("vote.verifyMyVote")}
              </a>
            )}
          </div>
        </div>
      )}
    </Shell>
  );
}

function Shell({ children, langSwitcher, secureLabel, footerText }: {
  children: React.ReactNode;
  langSwitcher?: React.ReactNode;
  secureLabel?: string;
  footerText?: string;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <a href="/" className="text-xl font-bold text-blue-800">PowerPicker</a>
          <div className="flex items-center gap-3">
            {langSwitcher}
            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
              {secureLabel ?? "Secure Vote"}
            </span>
          </div>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">{children}</main>
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
        {footerText ?? "Secured by PowerPicker · Your vote is encrypted and anonymous."}
      </footer>
    </div>
  );
}
