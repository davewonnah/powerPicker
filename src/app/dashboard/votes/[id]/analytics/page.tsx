"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { getPollAnalytics, getPoll, type PollAnalytics, type Poll } from "@/lib/api";

const BLUE = "#1E3A8A";
const SKY = "#3B82F6";
const EMERALD = "#10B981";
const SLATE = "#94A3B8";

function formatHour(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

function formatDay(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatTimelineLabel(iso: string, points: { hour: string }[]) {
  // If data spans more than 1 day, show date+hour; otherwise just hour
  if (points.length < 2) return formatHour(iso);
  const first = new Date(points[0].hour);
  const last = new Date(points[points.length - 1].hour);
  const spanDays = (last.getTime() - first.getTime()) / 86400000;
  return spanDays > 1 ? `${formatDay(iso)} ${formatHour(iso)}` : formatHour(iso);
}

export default function AnalyticsPage() {
  const { id } = useParams<{ id: string }>();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [analytics, setAnalytics] = useState<PollAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getPoll(Number(id)), getPollAnalytics(Number(id))])
      .then(([{ poll }, data]) => {
        setPoll(poll);
        setAnalytics(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 rounded bg-slate-200 animate-pulse" />
        <div className="grid gap-4 sm:grid-cols-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-slate-200 animate-pulse" />)}
        </div>
        <div className="h-64 rounded-xl bg-slate-200 animate-pulse" />
      </div>
    );
  }

  if (error || !analytics || !poll) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
        <p className="text-slate-500">{error || "Analytics unavailable."}</p>
        <Link href={`/dashboard/votes/${id}`} className="text-sm text-[#1E3A8A] underline">Back to poll</Link>
      </div>
    );
  }

  const winnerOption = analytics.options.reduce(
    (a, b) => a.vote_count > b.vote_count ? a : b,
    analytics.options[0]
  );

  const timelineLabelled = analytics.timeline.map((t) => ({
    ...t,
    label: formatTimelineLabel(t.hour, analytics.timeline),
  }));

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div>
        <Link
          href={`/dashboard/votes/${id}`}
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          Back to {poll.title}
        </Link>
        <div className="mt-3 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Turnout Analytics</h1>
            <p className="text-sm text-slate-500 mt-0.5">{poll.title}</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${
            poll.status === "active" ? "bg-green-50 text-green-700 ring-green-600/20"
            : poll.status === "ended" ? "bg-slate-100 text-slate-600 ring-slate-500/10"
            : "bg-yellow-50 text-yellow-700 ring-yellow-600/20"
          }`}>
            {poll.status}
          </span>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total Votes"
          value={String(analytics.totalVotes)}
          sub="ballots cast"
          color={BLUE}
          icon={<BallotIcon />}
        />
        <KpiCard
          label="Turnout Rate"
          value={`${analytics.turnoutPct}%`}
          sub={analytics.totalParticipants > 0 ? `${analytics.voted} of ${analytics.totalParticipants} participants` : "open poll"}
          color={EMERALD}
          icon={<TurnoutIcon />}
        />
        <KpiCard
          label="Pending Voters"
          value={String(analytics.pending)}
          sub={analytics.pending > 0 ? "yet to vote" : "everyone voted!"}
          color={analytics.pending === 0 ? EMERALD : "#F59E0B"}
          icon={<ClockIcon />}
        />
        <KpiCard
          label="Leading Option"
          value={analytics.totalVotes > 0 ? winnerOption.label : "—"}
          sub={analytics.totalVotes > 0 ? `${winnerOption.vote_count} votes · ${winnerOption.percentage}%` : "no votes yet"}
          color={SKY}
          icon={<TrophyIcon />}
        />
      </div>

      {/* Turnout donut + progression */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Donut / ring */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Participation</h2>
          <TurnoutRing voted={analytics.voted} total={analytics.totalParticipants} />
        </div>

        {/* Cumulative votes over time */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Votes Over Time</h2>
          {timelineLabelled.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-slate-400">No votes recorded yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={timelineLabelled} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={SKY} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={SKY} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: SLATE }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: SLATE }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E2E8F0" }}
                  formatter={(v, name) => [v, name === "cumulative" ? "Total votes" : "New votes"]}
                  labelFormatter={(l) => `At ${l}`}
                />
                <Area type="monotone" dataKey="cumulative" stroke={SKY} strokeWidth={2} fill="url(#blueGrad)" name="cumulative" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Candidate results breakdown */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-800 mb-5">Results Breakdown</h2>
        {analytics.totalVotes === 0 ? (
          <p className="text-sm text-slate-400">No votes have been cast yet.</p>
        ) : (
          <div className="space-y-1">
            <ResponsiveContainer width="100%" height={Math.max(200, analytics.options.length * 52)}>
              <BarChart
                data={analytics.options}
                layout="vertical"
                margin={{ top: 0, right: 60, left: 8, bottom: 0 }}
                barCategoryGap="30%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: SLATE }} tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="label" width={140} tick={{ fontSize: 12, fill: "#1E293B" }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E2E8F0" }}
                  formatter={(v) => [`${v} votes`]}
                />
                <Bar dataKey="vote_count" radius={[0, 4, 4, 0]} label={{ position: "right", fontSize: 11, fill: SLATE, formatter: (v: unknown) => `${analytics.options.find(o => o.vote_count === v)?.percentage ?? 0}%` }}>
                  {analytics.options.map((opt) => (
                    <Cell
                      key={opt.id}
                      fill={opt.id === winnerOption.id && analytics.totalVotes > 0 ? EMERALD : SKY}
                      fillOpacity={0.85}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Hourly new votes */}
      {timelineLabelled.length > 1 && (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">New Votes Per Hour</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={timelineLabelled} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: SLATE }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: SLATE }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E2E8F0" }}
                formatter={(v) => [v, "New votes"]}
                labelFormatter={(l) => `At ${l}`}
              />
              <Bar dataKey="votes" fill={BLUE} fillOpacity={0.7} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────────── */

function KpiCard({ label, value, sub, color, icon }: { label: string; value: string; sub: string; color: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
        <div className="rounded-lg p-1.5" style={{ backgroundColor: `${color}15` }}>
          <div style={{ color }}>{icon}</div>
        </div>
      </div>
      <p className="mt-3 text-2xl font-bold text-slate-900 truncate">{value}</p>
      <p className="mt-0.5 text-xs text-slate-500 truncate">{sub}</p>
    </div>
  );
}

function TurnoutRing({ voted, total }: { voted: number; total: number }) {
  const pct = total > 0 ? Math.round((voted / total) * 100) : 0;
  const r = 52;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  if (total === 0) {
    // Open poll — just show vote count
    return (
      <div className="flex flex-col items-center justify-center py-4 space-y-1">
        <p className="text-4xl font-bold text-[#1E3A8A]">{voted}</p>
        <p className="text-sm text-slate-500">votes cast</p>
        <p className="text-xs text-slate-400">Open poll — no participant limit</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative flex items-center justify-center">
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r={r} fill="none" stroke="#F1F5F9" strokeWidth="14" />
          <circle
            cx="70" cy="70" r={r} fill="none"
            stroke={pct === 100 ? EMERALD : "#3B82F6"}
            strokeWidth="14"
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeDashoffset={circ / 4}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.6s ease" }}
          />
        </svg>
        <div className="absolute text-center">
          <p className="text-3xl font-bold text-slate-900">{pct}%</p>
          <p className="text-xs text-slate-400">turnout</p>
        </div>
      </div>
      <div className="w-full space-y-1.5 text-sm">
        <div className="flex justify-between">
          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#3B82F6]" /> Voted
          </span>
          <span className="font-semibold text-slate-800">{voted}</span>
        </div>
        <div className="flex justify-between">
          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-slate-200" /> Pending
          </span>
          <span className="font-semibold text-slate-800">{total - voted}</span>
        </div>
        <div className="flex justify-between border-t border-slate-100 pt-1.5">
          <span className="text-slate-500">Total invited</span>
          <span className="font-semibold text-slate-800">{total}</span>
        </div>
      </div>
    </div>
  );
}

/* ── Icons ─────────────────────────────────────────────────── */

function BallotIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15a2.25 2.25 0 0 1 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
    </svg>
  );
}

function TurnoutIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />
    </svg>
  );
}
