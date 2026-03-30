"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getPoll, castPublicVote, type Poll } from "@/lib/api";

type Step = "code" | "ballot" | "confirmed";

export default function VotePage() {
  const { id } = useParams<{ id: string }>();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [step, setStep] = useState<Step>("code");
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [selected, setSelected] = useState<number | null>(null);
  const [selectedMultiple, setSelectedMultiple] = useState<Set<number>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [voterName, setVoterName] = useState("");
  const [confirmationId, setConfirmationId] = useState("");
  const [selectionLabel, setSelectionLabel] = useState("");

  useEffect(() => {
    getPoll(Number(id))
      .then(({ poll }) => setPoll(poll))
      .catch((err) => setFetchError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Shell>
        <div className="w-full max-w-md text-center space-y-4">
          <div className="mx-auto h-14 w-14 rounded-full bg-slate-100 animate-pulse" />
          <div className="h-6 w-48 mx-auto rounded bg-slate-200 animate-pulse" />
        </div>
      </Shell>
    );
  }

  if (fetchError || !poll) {
    return (
      <Shell>
        <div className="w-full max-w-md text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
            <svg className="h-7 w-7 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Vote Not Found</h1>
          <p className="text-sm text-slate-500">{fetchError || "This vote doesn't exist or the link is invalid."}</p>
          <a href="/" className="inline-block rounded-lg border border-slate-300 px-6 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100">
            Back to Home
          </a>
        </div>
      </Shell>
    );
  }

  if (poll.status === "ended") {
    return (
      <Shell>
        <div className="w-full max-w-md text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
            <svg className="h-7 w-7 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Voting Has Ended</h1>
          <p className="text-sm text-slate-500">
            <strong>{poll.title}</strong> is no longer accepting votes.
          </p>
          <a href="/" className="inline-block rounded-lg border border-slate-300 px-6 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100">
            Back to Home
          </a>
        </div>
      </Shell>
    );
  }

  if (poll.status === "draft") {
    return (
      <Shell>
        <div className="w-full max-w-md text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-yellow-100">
            <svg className="h-7 w-7 text-yellow-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Voting Hasn&apos;t Started</h1>
          <p className="text-sm text-slate-500">
            <strong>{poll.title}</strong> is not yet open for voting. Check back later.
          </p>
          <a href="/" className="inline-block rounded-lg border border-slate-300 px-6 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100">
            Back to Home
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

    // For link-based polls, skip code validation and go straight to ballot
    if (poll.voter_access === "link") {
      setVoterName("Voter");
      setCodeError("");
      setStep("ballot");
      return;
    }

    // For email-based polls, the code will be validated on submission
    setVoterName("");
    setCodeError("");
    setStep("ballot");
  }

  function toggleMultiple(optionId: number) {
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
      const result = await castPublicVote(poll.id, code.trim().toUpperCase(), optionIds);
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
    <Shell>
      {/* Step: Code entry */}
      {step === "code" && (
        <div className="w-full max-w-md space-y-6">
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-violet-600">PowerPicker</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{poll.title}</p>
          </div>

          {poll.voter_access === "link" ? (
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-violet-100">
                <svg className="h-7 w-7 text-violet-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Ready to Vote</h1>
              <p className="text-sm text-slate-500">This is an open poll. Click below to access your ballot.</p>
              <button
                onClick={() => setStep("ballot")}
                className="w-full rounded-lg bg-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-violet-700"
              >
                Access Ballot
              </button>
            </div>
          ) : (
            <>
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-violet-100">
                  <svg className="h-7 w-7 text-violet-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                </div>
                <h1 className="mt-4 text-2xl font-bold text-slate-900">Enter Your Voting Code</h1>
                <p className="mt-2 text-sm text-slate-500">
                  Enter the unique code you received for this election.
                </p>
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
                        : "border-slate-300 focus:border-violet-500 focus:ring-violet-500"
                    }`}
                  />
                  {codeError && <p className="mt-2 text-sm text-red-600">{codeError}</p>}
                </div>
                <button
                  type="submit"
                  className="w-full rounded-lg bg-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-violet-700"
                >
                  Access Ballot
                </button>
              </form>

              <p className="text-center text-xs text-slate-400">
                Your code is single-use and tied to this election only.
              </p>
            </>
          )}
        </div>
      )}

      {/* Step: Ballot */}
      {step === "ballot" && (
        <div className="w-full max-w-2xl space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-violet-600">PowerPicker</p>
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
              {endDateStr && (
                <span className="inline-flex items-center gap-1">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  Closes {endDateStr}
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
                      ? "border-violet-600 bg-violet-50 ring-2 ring-violet-600"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                  }`}
                >
                  {/* Selector */}
                  <div className="mt-0.5 shrink-0">
                    {poll.vote_type === "multiple" ? (
                      <div className={`flex h-5 w-5 items-center justify-center rounded border-2 ${isSelected ? "border-violet-600 bg-violet-600" : "border-slate-300"}`}>
                        {isSelected && (
                          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                          </svg>
                        )}
                      </div>
                    ) : (
                      <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${isSelected ? "border-violet-600" : "border-slate-300"}`}>
                        {isSelected && <div className="h-2.5 w-2.5 rounded-full bg-violet-600" />}
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
                    <p className={`font-semibold ${isSelected ? "text-violet-700" : "text-slate-900"}`}>
                      {option.label}
                    </p>
                    {hasDetails && (
                      <div className="mt-1 flex flex-wrap gap-2">
                        {option.candidate_position && (
                          <span className="text-xs font-medium text-slate-500">{option.candidate_position}</span>
                        )}
                        {option.party && (
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                            isSelected ? "bg-violet-100 text-violet-700 ring-violet-600/20" : "bg-slate-100 text-slate-600 ring-slate-500/10"
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
              className="rounded-lg bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Submitting...
                </span>
              ) : "Submit Vote"}
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
            <h1 className="text-2xl font-bold text-slate-900">Vote Submitted!</h1>
            <p className="mt-2 text-sm text-slate-500">
              Your vote for <strong>{poll.title}</strong> has been recorded.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 text-left">
            <h2 className="text-sm font-semibold text-slate-900">Confirmation Details</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Election</dt>
                <dd className="font-medium text-slate-700 text-right max-w-[60%]">{poll.title}</dd>
              </div>
              {selectionLabel && (
                <div className="flex justify-between">
                  <dt className="text-slate-500">Your choice</dt>
                  <dd className="font-medium text-slate-700 text-right max-w-[60%]">{selectionLabel}</dd>
                </div>
              )}
              {confirmationId && (
                <div className="flex justify-between">
                  <dt className="text-slate-500">Confirmation #</dt>
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

          <a href="/" className="inline-block rounded-lg border border-slate-300 px-6 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100">
            Back to Home
          </a>
        </div>
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <a href="/" className="text-xl font-bold text-violet-600">PowerPicker</a>
          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
            Secure Vote
          </span>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">{children}</main>
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
        Secured by PowerPicker &middot; Your vote is encrypted and anonymous.
      </footer>
    </div>
  );
}
