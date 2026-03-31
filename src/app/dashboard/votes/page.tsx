"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listPolls, type DashboardPoll } from "@/lib/api";

type Status = "active" | "ended" | "draft";

const VOTE_TYPE_LABELS: Record<string, string> = {
  single: "Single Choice",
  multiple: "Multiple Choice",
  ranked: "Ranked Choice",
};

const tabs: { label: string; filter: Status | "all" }[] = [
  { label: "All", filter: "all" },
  { label: "Active", filter: "active" },
  { label: "Ended", filter: "ended" },
  { label: "Drafts", filter: "draft" },
];

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function MyVotesPage() {
  const [polls, setPolls] = useState<DashboardPoll[]>([]);
  const [filter, setFilter] = useState<Status | "all">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    listPolls({ limit: 50 })
      .then(({ polls }) => setPolls(polls))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? polls : polls.filter((p) => p.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Votes</h1>
          <p className="mt-1 text-sm text-slate-500">Manage all your elections and polls.</p>
        </div>
        <Link
          href="/dashboard/create"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-900"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Vote
        </Link>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
        {tabs.map((tab) => {
          const count = tab.filter === "all"
            ? polls.length
            : polls.filter((p) => p.status === tab.filter).length;
          const active = filter === tab.filter;
          return (
            <button
              key={tab.filter}
              onClick={() => setFilter(tab.filter)}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                active
                  ? "bg-blue-800 text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              }`}
            >
              {tab.label}
              <span className={`rounded-full px-1.5 py-0.5 text-xs font-semibold ${
                active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-36 rounded-xl border border-slate-200 bg-white animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center">
          <p className="text-sm text-slate-500">
            {polls.length === 0 ? (
              <>No polls yet. <Link href="/dashboard/create" className="text-blue-800 hover:underline">Create your first vote</Link>.</>
            ) : (
              "No polls match this filter."
            )}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((poll) => {
            const pct = poll.total_participants > 0
              ? Math.min(100, Math.round((poll.votes_cast / poll.total_participants) * 100))
              : 0;
            return (
              <Link
                key={poll.id}
                href={`/dashboard/votes/${poll.id}`}
                className="group relative flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
              >
                {/* accent bar */}
                <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-full ${
                  poll.status === "active" ? "bg-blue-500" :
                  poll.status === "ended" ? "bg-slate-300" : "bg-amber-400"
                }`} />

                <div className="pl-3">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-800 leading-snug">
                      {poll.title}
                    </h3>
                    <StatusBadge status={poll.status} />
                  </div>

                  <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                    <span className="font-medium text-slate-500">{VOTE_TYPE_LABELS[poll.vote_type]}</span>
                    <span>·</span>
                    <span>Created {formatDate(poll.created_at)}</span>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-400">Participation</span>
                      <span className="font-semibold text-slate-700">{poll.votes_cast}/{poll.total_participants} <span className="font-normal text-slate-400">({pct}%)</span></span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          poll.status === "active" ? "bg-blue-500" :
                          poll.status === "ended" ? "bg-slate-400" : "bg-amber-400"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {poll.status !== "draft" && (
                    <p className="mt-3 text-xs text-slate-400">
                      {poll.status === "active" ? "Ends" : "Ended"} {formatDate(poll.closes_at)}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const styles = {
    active: "bg-green-50 text-green-700 ring-green-600/20",
    ended: "bg-slate-50 text-slate-600 ring-slate-500/10",
    draft: "bg-yellow-50 text-yellow-700 ring-yellow-600/20",
  };
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${styles[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
