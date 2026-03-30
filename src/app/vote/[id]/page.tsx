"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

/* ── Types ──────────────────────────────────────────────── */

interface VoteOption {
  id: string;
  label: string;
  subtitle: string;
}

interface Participant {
  name: string;
  email: string;
  code: string;       // unique per vote — same person gets a different code in each election
  hasVoted: boolean;
}

interface VoteData {
  id: string;
  title: string;
  description: string;
  type: "single" | "multiple" | "ranked";
  organizer: string;
  orgId: string;       // tenant scope
  endDate: string;
  status: "active" | "ended" | "draft";
  options: VoteOption[];
  participants: Participant[];
}

/* ── Demo data ──────────────────────────────────────────── */
// Codes are scoped per vote. The same person (e.g. emma.wilson@acme.edu)
// can appear in multiple elections, each with a unique code.

const votes: Record<string, VoteData> = {
  "1": {
    id: "1",
    title: "Student Council President 2026",
    description:
      "Vote for the next student council president. Your vote is anonymous and cannot be changed once submitted.",
    type: "single",
    organizer: "Acme University",
    orgId: "org_acme",
    endDate: "April 2, 2026 at 5:00 PM",
    status: "active",
    options: [
      { id: "a", label: "Alice Johnson", subtitle: "Junior — Policy & Outreach" },
      { id: "b", label: "Bob Martinez", subtitle: "Senior — Student Affairs" },
      { id: "c", label: "Carol Chen", subtitle: "Sophomore — Community & Events" },
      { id: "d", label: "David Kim", subtitle: "Junior — Academics & Research" },
    ],
    participants: [
      { name: "Emma Wilson", email: "emma.wilson@acme.edu", code: "XKPL-3N7R", hasVoted: true },
      { name: "Liam Brown", email: "liam.brown@acme.edu", code: "WQJT-8M5D", hasVoted: true },
      { name: "Sophia Garcia", email: "sophia.garcia@acme.edu", code: "HNVE-4K9F", hasVoted: false },
      { name: "Noah Davis", email: "noah.davis@acme.edu", code: "RCTB-6P2G", hasVoted: false },
      { name: "Olivia Martinez", email: "olivia.martinez@acme.edu", code: "YZLA-7W3H", hasVoted: false },
      { name: "James Taylor", email: "james.taylor@acme.edu", code: "BFMU-9S5J", hasVoted: false },
    ],
  },
  "2": {
    id: "2",
    title: "Office Lunch Vendor Poll",
    description:
      "Help us pick the best lunch vendor for the office. Rank your top choices.",
    type: "ranked",
    organizer: "Acme University",
    orgId: "org_acme",
    endDate: "March 28, 2026 at 6:00 PM",
    status: "active",
    options: [
      { id: "a", label: "Bella Italia", subtitle: "Italian — pasta, pizza, salads" },
      { id: "b", label: "Green Bowl", subtitle: "Healthy — grain bowls, smoothies" },
      { id: "c", label: "Taco Fiesta", subtitle: "Mexican — tacos, burritos, nachos" },
      { id: "d", label: "Sushi Station", subtitle: "Japanese — sushi, ramen, poke" },
    ],
    // Note: Emma and Sophia are in BOTH votes, but with different codes
    participants: [
      { name: "Emma Wilson", email: "emma.wilson@acme.edu", code: "MPQR-2T8V", hasVoted: false },
      { name: "Sophia Garcia", email: "sophia.garcia@acme.edu", code: "KDLT-5Y3W", hasVoted: false },
      { name: "James Taylor", email: "james.taylor@acme.edu", code: "VNHB-7U4X", hasVoted: true },
      { name: "Ava Anderson", email: "ava.anderson@acme.edu", code: "FGWS-9R6Z", hasVoted: false },
      { name: "William Thomas", email: "william.thomas@acme.edu", code: "JCNP-3Q8A", hasVoted: false },
    ],
  },
  "3": {
    id: "3",
    title: "Club Trip Destination",
    description:
      "Vote on where the club should go for the annual trip this summer.",
    type: "multiple",
    organizer: "Acme University",
    orgId: "org_acme",
    endDate: "March 15, 2026 at 11:59 PM",
    status: "ended",
    options: [
      { id: "a", label: "Lake Tahoe", subtitle: "Hiking, kayaking, scenic views" },
      { id: "b", label: "Grand Canyon", subtitle: "Canyon trails, rafting, camping" },
      { id: "c", label: "Yosemite", subtitle: "Rock climbing, waterfalls, nature" },
      { id: "d", label: "Zion National Park", subtitle: "Desert hikes, canyoneering" },
    ],
    participants: [
      { name: "Emma Wilson", email: "emma.wilson@acme.edu", code: "ABCD-1234", hasVoted: true },
      { name: "Noah Davis", email: "noah.davis@acme.edu", code: "EFGH-5678", hasVoted: true },
    ],
  },
};

/* ── Component ──────────────────────────────────────────── */

type Step = "code" | "ballot" | "confirmed";

export default function VotePage() {
  const { id } = useParams<{ id: string }>();
  const [step, setStep] = useState<Step>("code");
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedMultiple, setSelectedMultiple] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [voterName, setVoterName] = useState("");

  const vote = votes[id];

  // Vote not found
  if (!vote) {
    return (
      <Shell>
        <div className="w-full max-w-md text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
            <svg className="h-7 w-7 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Vote Not Found</h1>
          <p className="text-sm text-gray-500">
            This vote doesn&apos;t exist or the link is invalid.
          </p>
          <a href="/" className="inline-block rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100">
            Back to Home
          </a>
        </div>
      </Shell>
    );
  }

  // Vote ended
  if (vote.status === "ended") {
    return (
      <Shell>
        <div className="w-full max-w-md text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
            <svg className="h-7 w-7 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Voting Has Ended</h1>
          <p className="text-sm text-gray-500">
            <strong>{vote.title}</strong> closed on {vote.endDate}. Results have been finalized.
          </p>
          <a href="/" className="inline-block rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100">
            Back to Home
          </a>
        </div>
      </Shell>
    );
  }

  // Vote not started (draft)
  if (vote.status === "draft") {
    return (
      <Shell>
        <div className="w-full max-w-md text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-yellow-100">
            <svg className="h-7 w-7 text-yellow-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Voting Hasn&apos;t Started</h1>
          <p className="text-sm text-gray-500">
            <strong>{vote.title}</strong> is not yet open for voting. Check back later.
          </p>
          <a href="/" className="inline-block rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100">
            Back to Home
          </a>
        </div>
      </Shell>
    );
  }

  function handleCodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = code.trim().toUpperCase().replace(/\s+/g, "");

    if (cleaned.length < 8) {
      setCodeError("Please enter a valid voting code.");
      return;
    }

    // Validate code against THIS vote's participant list only
    const participant = vote.participants.find(
      (p) => p.code.replace("-", "") === cleaned.replace("-", "")
    );

    if (!participant) {
      setCodeError(
        "Invalid code. This code is not authorized for this election. Please check your code and try again."
      );
      return;
    }

    if (participant.hasVoted) {
      setCodeError(
        "This code has already been used to cast a vote. Each code can only be used once."
      );
      return;
    }

    setVoterName(participant.name);
    setCodeError("");
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

  function handleVoteSubmit() {
    if (vote.type === "multiple" && selectedMultiple.size === 0) return;
    if (vote.type !== "multiple" && !selected) return;

    setSubmitting(true);
    // Simulate API — in production this marks the participant's code as used
    setTimeout(() => {
      setSubmitting(false);
      setStep("confirmed");
    }, 1200);
  }

  const hasSelection =
    vote.type === "multiple" ? selectedMultiple.size > 0 : !!selected;

  const selectionLabel =
    vote.type === "multiple"
      ? vote.options
          .filter((o) => selectedMultiple.has(o.id))
          .map((o) => o.label)
          .join(", ")
      : vote.options.find((o) => o.id === selected)?.label || "";

  const typeLabels = {
    single: "Single choice",
    multiple: "Multiple choice",
    ranked: "Ranked choice",
  };

  const instructionLabels = {
    single: "Select one option",
    multiple: "Select all that apply",
    ranked: "Select your top choice",
  };

  return (
    <Shell>
      {step === "code" && (
        <div className="w-full max-w-md space-y-6">
          {/* Vote title preview */}
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-indigo-600">
              {vote.organizer}
            </p>
            <p className="mt-1 text-sm font-semibold text-gray-900">
              {vote.title}
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100">
              <svg
                className="h-7 w-7 text-indigo-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                />
              </svg>
            </div>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">
              Enter Your Voting Code
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Enter the unique code you received for this election. Codes are
              specific to each vote — a code from another election won&apos;t
              work here.
            </p>
          </div>

          <form onSubmit={handleCodeSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setCodeError("");
                }}
                placeholder="XXXX-XXXX"
                maxLength={9}
                className={`block w-full rounded-lg border px-4 py-3 text-center text-lg font-semibold tracking-[0.3em] shadow-sm focus:outline-none focus:ring-2 ${
                  codeError
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                }`}
              />
              {codeError && (
                <p className="mt-2 text-sm text-red-600">{codeError}</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
            >
              Access Ballot
            </button>
          </form>

          <p className="text-center text-xs text-gray-400">
            Your code is single-use and tied to this election only.
          </p>
        </div>
      )}

      {step === "ballot" && (
        <div className="w-full max-w-2xl space-y-6">
          {/* Voter greeting + vote info */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-indigo-600">
                {vote.organizer}
              </p>
              <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                Verified
              </span>
            </div>
            <h1 className="mt-1 text-xl font-bold text-gray-900 sm:text-2xl">
              {vote.title}
            </h1>
            <p className="mt-2 text-sm text-gray-500">{vote.description}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-400">
              <span className="inline-flex items-center gap-1">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
                Voting as {voterName}
              </span>
              <span className="inline-flex items-center gap-1">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                Closes {vote.endDate}
              </span>
              <span className="inline-flex items-center gap-1">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                </svg>
                {typeLabels[vote.type]} &middot; Anonymous
              </span>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-700">
              {instructionLabels[vote.type]}
            </h2>
            {vote.options.map((option) => {
              const isSelected =
                vote.type === "multiple"
                  ? selectedMultiple.has(option.id)
                  : selected === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() =>
                    vote.type === "multiple"
                      ? toggleMultiple(option.id)
                      : setSelected(option.id)
                  }
                  className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all sm:p-5 ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-50 ring-2 ring-indigo-600"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                  }`}
                >
                  {/* Selection indicator */}
                  {vote.type === "multiple" ? (
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-600"
                          : "border-gray-300"
                      }`}
                    >
                      {isSelected && (
                        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                      )}
                    </div>
                  ) : (
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                        isSelected ? "border-indigo-600" : "border-gray-300"
                      }`}
                    >
                      {isSelected && (
                        <div className="h-2.5 w-2.5 rounded-full bg-indigo-600" />
                      )}
                    </div>
                  )}
                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        isSelected ? "text-indigo-700" : "text-gray-900"
                      }`}
                    >
                      {option.label}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {option.subtitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Submit */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-gray-400">
              Your vote is anonymous and final once submitted.
            </p>
            <button
              onClick={handleVoteSubmit}
              disabled={!hasSelection || submitting}
              className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Submitting...
                </span>
              ) : (
                "Submit Vote"
              )}
            </button>
          </div>
        </div>
      )}

      {step === "confirmed" && (
        <div className="w-full max-w-md text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Vote Submitted!
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Your vote for <strong>{vote.title}</strong> has been recorded.
              Thank you for participating, {voterName}.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 text-left">
            <h2 className="text-sm font-semibold text-gray-900">
              Confirmation Details
            </h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Election</dt>
                <dd className="font-medium text-gray-700 text-right max-w-[60%]">
                  {vote.title}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Organization</dt>
                <dd className="font-medium text-gray-700">
                  {vote.organizer}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Your choice</dt>
                <dd className="font-medium text-gray-700 text-right max-w-[60%]">
                  {selectionLabel}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Confirmation #</dt>
                <dd className="font-mono text-xs font-medium text-gray-700">
                  {`${vote.orgId.toUpperCase()}-${id}-${Date.now().toString(36).toUpperCase()}`}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Results available</dt>
                <dd className="font-medium text-gray-700">{vote.endDate}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-left">
            <p className="text-xs text-blue-700">
              <strong>Participating in other elections?</strong> Each election
              has its own unique code. Your code for this vote cannot be used
              in any other election.
            </p>
          </div>

          <a
            href="/"
            className="inline-block rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Back to Home
          </a>
        </div>
      )}
    </Shell>
  );
}

/* ── Shell wrapper ──────────────────────────────────────── */

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <a href="/" className="text-xl font-bold text-indigo-600">
            PowerPicker
          </a>
          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
            Secure Vote
          </span>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
        {children}
      </main>
      <footer className="border-t border-gray-200 bg-white py-4 text-center text-xs text-gray-400">
        Secured by PowerPicker &middot; Your vote is encrypted and anonymous.
      </footer>
    </div>
  );
}
