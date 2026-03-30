"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getDashboard, type DashboardStats, type DashboardPoll } from "@/lib/api";

const VOTE_TYPE_LABELS: Record<string, string> = {
  single: "Single Choice",
  multiple: "Multiple Choice",
  ranked: "Ranked Choice",
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [polls, setPolls] = useState<DashboardPoll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getDashboard()
      .then(({ stats, myPolls }) => {
        setStats(stats);
        setPolls(myPolls.slice(0, 4));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const avgTurnout =
    stats && stats.total_participants > 0
      ? Math.round((stats.total_votes_cast / stats.total_participants) * 100)
      : 0;

  const statCards = stats
    ? [
        { label: "Total Polls", value: String(stats.polls_created), change: "Created by you" },
        { label: "Active Now", value: String(stats.active_polls), change: "Accepting votes" },
        { label: "Total Participants", value: String(stats.total_participants), change: "Across all polls" },
        { label: "Avg. Turnout", value: `${avgTurnout}%`, change: "Votes cast / invited" },
      ]
    : [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Overview of your votes and elections.</p>
        </div>
        <Link
          href="/dashboard/create"
          className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Create Vote
        </Link>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl border border-slate-200 bg-white animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, i) => (
            <div key={stat.label} className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className={`absolute right-0 top-0 h-full w-1.5 rounded-r-xl ${
                i === 0 ? "bg-violet-500" : i === 1 ? "bg-emerald-500" : i === 2 ? "bg-sky-500" : "bg-amber-500"
              }`} />
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{stat.label}</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{stat.value}</p>
              <p className="mt-1 text-xs text-slate-400">{stat.change}</p>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Recent Votes</h2>
          <Link href="/dashboard/votes" className="text-sm font-medium text-violet-600 hover:text-violet-500">
            View all
          </Link>
        </div>

        {loading ? (
          <div className="divide-y divide-slate-100">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-14 px-6 animate-pulse flex items-center gap-4">
                <div className="h-4 w-48 rounded bg-slate-100" />
                <div className="h-4 w-16 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        ) : polls.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-slate-500">
            No polls yet.{" "}
            <Link href="/dashboard/create" className="text-violet-600 hover:underline">
              Create your first vote
            </Link>
            .
          </div>
        ) : (
          <>
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-500">
                    <th className="px-6 py-3 font-medium">Title</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium">Type</th>
                    <th className="px-6 py-3 font-medium">Participation</th>
                    <th className="px-6 py-3 font-medium">End Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {polls.map((poll) => (
                    <tr key={poll.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-900">
                        <Link href={`/dashboard/votes/${poll.id}`} className="hover:text-violet-600">
                          {poll.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={poll.status} />
                      </td>
                      <td className="px-6 py-4 text-slate-500">{VOTE_TYPE_LABELS[poll.vote_type]}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-20 rounded-full bg-slate-200">
                            <div
                              className="h-2 rounded-full bg-violet-600"
                              style={{
                                width: poll.total_participants > 0
                                  ? `${Math.min(100, Math.round((poll.votes_cast / poll.total_participants) * 100))}%`
                                  : "0%",
                              }}
                            />
                          </div>
                          <span className="text-xs text-slate-500">
                            {poll.votes_cast}/{poll.total_participants}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{formatDate(poll.closes_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="sm:hidden divide-y divide-slate-100">
              {polls.map((poll) => (
                <Link key={poll.id} href={`/dashboard/votes/${poll.id}`} className="block px-6 py-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-slate-900">{poll.title}</p>
                    <StatusBadge status={poll.status} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{VOTE_TYPE_LABELS[poll.vote_type]}</span>
                    <span>{poll.votes_cast}/{poll.total_participants} voted</span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: "active" | "ended" | "draft" }) {
  const styles = {
    active: "bg-green-50 text-green-700 ring-green-600/20",
    ended: "bg-slate-50 text-slate-600 ring-slate-500/10",
    draft: "bg-yellow-50 text-yellow-700 ring-yellow-600/20",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${styles[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
