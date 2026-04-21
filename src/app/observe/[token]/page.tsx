"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { getObserverView } from "@/lib/api";
import { io, Socket } from "socket.io-client";

interface ObserverData {
  poll: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    vote_type: string;
    closes_at: string | null;
  };
  results: {
    totalVotes: number;
    options: { id: string; label: string; position: number; vote_count: number; percentage: number }[];
  } | null;
}

export default function ObservePage() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<ObserverData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    getObserverView(token)
      .then((res) => {
        setData(res);
        setLastUpdated(new Date());
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  // Connect to WebSocket for live updates
  useEffect(() => {
    if (!data?.poll.id) return;
    const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api").replace("/api", "");
    const socket = io(apiBase, { transports: ["websocket", "polling"] });
    socketRef.current = socket;

    socket.emit("join-poll", data.poll.id);
    socket.on("poll-update", (update: { totalVotes: number; options: { id: string; label: string; position: number; vote_count: number; percentage: number }[] }) => {
      setData((prev) => prev ? { ...prev, results: { totalVotes: update.totalVotes, options: update.options } } : prev);
      setLastUpdated(new Date());
    });

    return () => { socket.disconnect(); };
  }, [data?.poll.id]);

  if (loading) {
    return (
      <Shell>
        <div className="space-y-4 animate-pulse w-full max-w-2xl">
          <div className="h-8 w-64 rounded bg-slate-200" />
          <div className="h-4 w-96 rounded bg-slate-200" />
          <div className="h-40 rounded-xl bg-slate-200" />
        </div>
      </Shell>
    );
  }

  if (error || !data) {
    return (
      <Shell>
        <div className="text-center space-y-4 max-w-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
            <svg className="h-7 w-7 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-900">Observer link not found</h1>
          <p className="text-sm text-slate-500">{error || "This link may have been removed by the election organiser."}</p>
        </div>
      </Shell>
    );
  }

  const { poll, results } = data;
  const maxVotes = Math.max(...(results?.options.map((o) => o.vote_count) ?? [0]), 1);
  const winner = results?.options.reduce((a, b) => a.vote_count > b.vote_count ? a : b);

  return (
    <Shell>
      <div className="w-full max-w-2xl space-y-6">
        {/* Header card */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[#1E3A8A]">Observer View</p>
              <h1 className="mt-1 text-xl font-bold text-slate-900">{poll.title}</h1>
              {poll.description && <p className="mt-1 text-sm text-slate-500">{poll.description}</p>}
            </div>
            <span className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
              poll.status === "active" ? "bg-green-50 text-green-700 ring-green-600/20"
              : poll.status === "ended" ? "bg-slate-100 text-slate-600 ring-slate-500/10"
              : "bg-yellow-50 text-yellow-700 ring-yellow-600/20"
            }`}>
              {poll.status}
            </span>
          </div>
          <div className="flex flex-wrap gap-4 text-xs text-slate-500 border-t border-slate-100 pt-3">
            <span>Total votes: <strong className="text-slate-800">{results?.totalVotes ?? 0}</strong></span>
            {poll.closes_at && (
              <span>Closes: <strong className="text-slate-800">{new Date(poll.closes_at).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}</strong></span>
            )}
            {lastUpdated && (
              <span className="flex items-center gap-1">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                Live · updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        {/* Results */}
        {results && results.options.length > 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-700">Current Results</h2>
            <div className="space-y-3">
              {results.options.map((option) => {
                const isLeading = winner && option.id === winner.id && results.totalVotes > 0;
                const barPct = maxVotes > 0 ? (option.vote_count / maxVotes) * 100 : 0;
                return (
                  <div key={option.id} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${isLeading ? "text-[#1E3A8A]" : "text-slate-800"}`}>{option.label}</span>
                        {isLeading && (
                          <span className="rounded-full bg-[#10B981]/10 px-2 py-0.5 text-xs font-semibold text-[#10B981]">Leading</span>
                        )}
                      </div>
                      <span className="text-slate-500 text-xs font-mono">
                        {option.vote_count % 1 !== 0 ? option.vote_count.toFixed(2) : option.vote_count} ({option.percentage}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${isLeading ? "bg-[#10B981]" : "bg-[#3B82F6]"}`}
                        style={{ width: `${barPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-400">
            No votes have been cast yet. Results will appear here in real time.
          </div>
        )}

        <p className="text-center text-xs text-slate-400">
          Read-only observer view · Powered by PowerPicker · Results update live
        </p>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <a href="/" className="text-xl font-bold text-[#1E3A8A]">PowerPicker</a>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-200">
            Observer View
          </span>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">{children}</main>
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
        Secured by PowerPicker &middot; Read-only access
      </footer>
    </div>
  );
}
