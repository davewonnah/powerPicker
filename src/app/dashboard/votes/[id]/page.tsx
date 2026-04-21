"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getPoll, updatePoll, addParticipant, listParticipants, listObservers, addObserver as addObserverApi, removeObserver as removeObserverApi, getPollInsights, regeneratePollInsights, getFraudAlerts, type Poll, type Participant, type Observer, type FraudAlert } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { io, Socket } from "socket.io-client";

type Status = "active" | "ended" | "draft";

const VOTE_TYPE_LABELS: Record<string, string> = {
  single: "Single Choice",
  multiple: "Multiple Choice",
  ranked: "Ranked Choice",
};

const VOTER_ACCESS_LABELS: Record<string, string> = {
  link: "Share via Link",
  email: "Email Invite Only",
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}

function getTimeLeft(closesAt: string | null, status: Status): string {
  if (status === "ended") return "Ended";
  if (status === "draft") return "Not started";
  if (!closesAt) return "No deadline";
  const diff = new Date(closesAt).getTime() - Date.now();
  if (diff <= 0) return "Ended";
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  if (days > 0) return `${days} day${days !== 1 ? "s" : ""}`;
  if (hours > 0) return `${hours} hour${hours !== 1 ? "s" : ""}`;
  return "< 1 hour";
}

export default function VoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ending, setEnding] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [addError, setAddError] = useState("");
  const [adding, setAdding] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [showBulk, setShowBulk] = useState(false);
  const [bulkAdding, setBulkAdding] = useState(false);

  // Observer state
  const [observers, setObservers] = useState<Observer[]>([]);
  const [newObserverEmail, setNewObserverEmail] = useState("");
  const [newObserverName, setNewObserverName] = useState("");
  const [addingObserver, setAddingObserver] = useState(false);
  const [observerError, setObserverError] = useState("");
  const [copiedObserverId, setCopiedObserverId] = useState<string | null>(null);

  // AI insights state
  const [insights, setInsights] = useState<{ text: string; generatedAt: string } | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState("");

  // Fraud alerts state
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([]);

  // WebSocket
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const pollId = id;
    getPoll(pollId)
      .then(({ poll }) => {
        setPoll(poll);
        if (poll.voter_access === "email") {
          listParticipants(pollId).then(({ participants }) => setParticipants(participants));
        }
        listObservers(pollId).then(({ observers }) => setObservers(observers)).catch(() => {});
        getFraudAlerts(pollId).then(({ alerts }) => setFraudAlerts(alerts)).catch(() => {});
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  // WebSocket for live result updates
  useEffect(() => {
    const pollId = id;
    if (!pollId) return;
    const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api").replace("/api", "");
    const socket = io(apiBase, { transports: ["websocket", "polling"] });
    socketRef.current = socket;
    socket.emit("join-poll", pollId);
    socket.on("poll-update", (update: { totalVotes: number; options: Poll["options"] }) => {
      setPoll((prev) => prev ? { ...prev, options: update.options } : prev);
    });
    return () => { socket.disconnect(); };
  }, [id]);

  function generateCode(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
      if (i === 3) code += "-";
    }
    return code;
  }

  async function handleAddParticipant(e: React.FormEvent) {
    e.preventDefault();
    if (!poll || !newName.trim() || !newEmail.trim()) return;
    setAddError("");
    setAdding(true);
    try {
      const { participant } = await addParticipant(poll.id, {
        name: newName.trim(),
        email: newEmail.trim(),
        code: generateCode(),
      });
      setParticipants((prev) => [...prev, participant]);
      setPoll((prev) => prev ? { ...prev, totalParticipants: prev.totalParticipants + 1 } : prev);
      setNewName("");
      setNewEmail("");
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Failed to add participant");
    } finally {
      setAdding(false);
    }
  }

  function parseLines(raw: string): { name: string; email: string }[] {
    return raw
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .filter((l) => !l.toLowerCase().startsWith("name")) // skip header rows
      .map((line) => {
        const parts = line.split(",").map((p) => p.trim());
        const email = parts.find((p) => p.includes("@")) ?? "";
        const name = parts.find((p) => !p.includes("@")) ?? email.split("@")[0];
        return { name, email };
      })
      .filter((v) => v.email.includes("@"));
  }

  async function handleBulkAdd() {
    if (!poll) return;
    setBulkAdding(true);
    setAddError("");
    const rows = parseLines(bulkText);
    const added: Participant[] = [];
    for (const row of rows) {
      try {
        const { participant } = await addParticipant(poll.id, { ...row, code: generateCode() });
        added.push(participant);
      } catch {
        // skip duplicates silently
      }
    }
    setParticipants((prev) => [...prev, ...added]);
    setPoll((prev) => prev ? { ...prev, totalParticipants: prev.totalParticipants + added.length } : prev);
    setBulkText("");
    setShowBulk(false);
    setBulkAdding(false);
  }

  function handleCsvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setBulkText(ev.target?.result as string);
      setShowBulk(true);
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  async function handleExportPdf() {
    if (!poll) return;
    const token = getToken();
    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
    const url = `${apiBase}/polls/${poll.id}/votes/results/pdf`;
    try {
      const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const objUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objUrl;
      a.download = `results-${poll.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objUrl);
    } catch {
      setError("Failed to export PDF. Please try again.");
    }
  }

  async function handleAddObserver(e: React.FormEvent) {
    e.preventDefault();
    if (!poll || !newObserverEmail.trim()) return;
    setObserverError("");
    setAddingObserver(true);
    try {
      const { observer } = await addObserverApi(poll.id, { email: newObserverEmail.trim(), name: newObserverName.trim() || undefined });
      setObservers((prev) => [...prev, observer]);
      setNewObserverEmail("");
      setNewObserverName("");
    } catch (err) {
      setObserverError(err instanceof Error ? err.message : "Failed to add observer");
    } finally {
      setAddingObserver(false);
    }
  }

  async function handleRemoveObserver(observerId: string) {
    if (!poll) return;
    await removeObserverApi(poll.id, observerId).catch(() => {});
    setObservers((prev) => prev.filter((o) => o.id !== observerId));
  }

  function copyObserverLink(observer: Observer) {
    navigator.clipboard.writeText(observer.observeUrl);
    setCopiedObserverId(observer.id);
    setTimeout(() => setCopiedObserverId(null), 2000);
  }

  async function handleGenerateInsights() {
    if (!poll) return;
    setInsightsLoading(true);
    setInsightsError("");
    try {
      const res = insights
        ? await regeneratePollInsights(poll.id)
        : await getPollInsights(poll.id);
      setInsights({ text: res.insights, generatedAt: res.generatedAt });
    } catch (err) {
      setInsightsError(err instanceof Error ? err.message : "Failed to generate insights");
    } finally {
      setInsightsLoading(false);
    }
  }

  async function handleEndVote() {
    if (!poll) return;
    setEnding(true);
    try {
      const { poll: updated } = await updatePoll(poll.id, { status: "ended" });
      setPoll((prev) => prev ? { ...prev, status: updated.status } : prev);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to end vote");
    } finally {
      setEnding(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 rounded bg-slate-200 animate-pulse" />
        <div className="grid gap-4 sm:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl border border-slate-200 bg-white animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-900">{error || "Vote not found"}</h1>
        <Link
          href="/dashboard/votes"
          className="mt-6 rounded-lg bg-blue-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-900"
        >
          Back to My Votes
        </Link>
      </div>
    );
  }

  const totalCast = poll.options.reduce((sum, o) => sum + o.vote_count, 0);
  const leadingVotes = Math.max(...poll.options.map((o) => o.vote_count), 0);

  return (
    <div className="space-y-6">
      {/* Breadcrumb & header */}
      <div>
        <Link
          href="/dashboard/votes"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          Back to My Votes
        </Link>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{poll.title}</h1>
            <StatusBadge status={poll.status} />
          </div>
          <div className="flex flex-wrap gap-2">
            {poll.voter_access === "email" && (
              <Link
                href={`/dashboard/votes/${poll.id}/participants`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                </svg>
                Participants
              </Link>
            )}
            <Link
              href={`/dashboard/votes/${poll.id}/analytics`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
              </svg>
              Analytics
            </Link>
            {(poll.status === "ended" || poll.votedCount > 0) && (
              <button
                onClick={handleExportPdf}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Export PDF
              </button>
            )}
            {poll.status === "active" && (
              <button
                onClick={handleEndVote}
                disabled={ending}
                className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 disabled:opacity-60"
              >
                {ending ? "Ending…" : "End Vote"}
              </button>
            )}
          </div>
        </div>
        {poll.description && (
          <p className="mt-2 max-w-2xl text-sm text-slate-500">{poll.description}</p>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Voters" value={String(poll.totalParticipants)} sub="Invited" />
        <StatCard
          label="Votes Cast"
          value={String(poll.votedCount)}
          sub={poll.totalParticipants > 0
            ? `${Math.round((poll.votedCount / poll.totalParticipants) * 100)}% turnout`
            : "0% turnout"}
        />
        <StatCard label="Options" value={String(poll.options.length)} sub="Candidates" />
        <StatCard
          label="Time Left"
          value={getTimeLeft(poll.closes_at, poll.status)}
          sub={poll.closes_at ? `Ends ${formatDate(poll.closes_at)}` : "No deadline"}
        />
      </div>

      {/* Participants quick-add (email polls only) */}
      {poll.voter_access === "email" && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Participants</h2>
              <p className="text-sm text-slate-500 mt-0.5">{participants.length} invited · {participants.filter(p => p.has_voted).length} voted</p>
            </div>
            <Link
              href={`/dashboard/votes/${poll.id}/participants`}
              className="text-sm font-medium text-blue-800 hover:text-blue-500"
            >
              Manage all
            </Link>
          </div>

          <form onSubmit={handleAddParticipant} className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Full name"
              className="block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none sm:w-1/3"
            />
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Email address"
              className="block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none sm:flex-1"
            />
            <button
              type="submit"
              disabled={adding || !newName.trim() || !newEmail.trim()}
              className="shrink-0 rounded-lg bg-blue-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-900 disabled:opacity-60"
            >
              {adding ? "Adding…" : "Add"}
            </button>
          </form>

          {addError && <p className="text-sm text-red-600">{addError}</p>}

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowBulk(!showBulk)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
              {showBulk ? "Hide bulk add" : "Bulk add"}
            </button>
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
              </svg>
              Upload CSV
              <input type="file" accept=".csv,.txt" className="sr-only" onChange={handleCsvUpload} />
            </label>
          </div>

          {showBulk && (
            <div className="space-y-2">
              <textarea
                rows={5}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder={"Name, email@example.com\nJane Smith, jane@example.com\njohn@example.com"}
                className="block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-mono shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <p className="text-xs text-slate-400">One participant per line. Format: Name, email — or just an email.</p>
              <button
                type="button"
                onClick={handleBulkAdd}
                disabled={bulkAdding || !bulkText.trim()}
                className="rounded-lg bg-blue-800 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-900 disabled:opacity-60"
              >
                {bulkAdding ? "Adding…" : `Add ${parseLines(bulkText).length || ""} Participants`}
              </button>
            </div>
          )}

          {participants.length > 0 && (
            <div className="divide-y divide-slate-100 rounded-lg border border-slate-100 max-h-56 overflow-y-auto">
              {participants.slice(-5).reverse().map((p) => (
                <div key={p.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <div>
                    <p className="font-medium text-slate-900">{p.name}</p>
                    <p className="text-xs text-slate-400">{p.email}</p>
                  </div>
                  <span className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                    p.has_voted
                      ? "bg-green-50 text-green-700 ring-green-600/20"
                      : "bg-yellow-50 text-yellow-700 ring-yellow-600/20"
                  }`}>
                    {p.has_voted ? "Voted" : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Observers */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Observers</h2>
          <p className="text-sm text-slate-500 mt-0.5">Add read-only auditors who can watch results live without logging in.</p>
        </div>

        <form onSubmit={handleAddObserver} className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={newObserverName}
            onChange={(e) => setNewObserverName(e.target.value)}
            placeholder="Name (optional)"
            className="block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none sm:w-1/3"
          />
          <input
            type="email"
            value={newObserverEmail}
            onChange={(e) => setNewObserverEmail(e.target.value)}
            placeholder="Email address"
            required
            className="block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none sm:flex-1"
          />
          <button
            type="submit"
            disabled={addingObserver || !newObserverEmail.trim()}
            className="shrink-0 rounded-lg bg-[#1E3A8A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-900 disabled:opacity-60"
          >
            {addingObserver ? "Adding…" : "Add Observer"}
          </button>
        </form>
        {observerError && <p className="text-sm text-red-600">{observerError}</p>}

        {observers.length > 0 && (
          <div className="divide-y divide-slate-100 rounded-lg border border-slate-100">
            {observers.map((observer) => (
              <div key={observer.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <div>
                  <p className="font-medium text-slate-900">{observer.name || observer.email}</p>
                  {observer.name && <p className="text-xs text-slate-400">{observer.email}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => copyObserverLink(observer)}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    {copiedObserverId === observer.id ? "Copied!" : "Copy link"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveObserver(observer.id)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {observers.length === 0 && (
          <p className="text-sm text-slate-400">No observers yet. Add one above — they'll receive an email with a private link.</p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Results */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            {poll.status === "ended" ? "Final Results" : poll.status === "active" ? "Live Results" : "Results"}
          </h2>

          {totalCast === 0 ? (
            <div className="mt-6 py-8 text-center">
              <p className="text-sm text-slate-500">No votes have been cast yet.</p>
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {[...poll.options]
                .sort((a, b) => b.vote_count - a.vote_count)
                .map((option) => {
                  const pct = totalCast > 0 ? Math.round((option.vote_count / totalCast) * 100) : 0;
                  const isLeading = option.vote_count === leadingVotes && leadingVotes > 0;
                  return (
                    <div key={option.id} className={`rounded-lg p-3 ${isLeading ? "bg-blue-50 border border-blue-100" : "bg-slate-50"}`}>
                      <div className="flex items-center gap-3">
                        {option.image_url && (
                          <img src={option.image_url} alt={option.label} className="h-10 w-10 rounded-full object-cover shrink-0 border-2 border-white shadow-sm" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 flex-wrap text-sm">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`font-semibold ${isLeading ? "text-blue-900" : "text-slate-800"}`}>{option.label}</span>
                              {option.candidate_position && <span className="text-xs text-slate-400">{option.candidate_position}</span>}
                              {option.party && (
                                <span className={`text-xs rounded-full px-2 py-0.5 font-medium ring-1 ring-inset ${isLeading ? "bg-blue-100 text-blue-900 ring-blue-800/20" : "bg-slate-100 text-slate-500 ring-slate-400/20"}`}>
                                  {option.party}
                                </span>
                              )}
                              {isLeading && <span className="text-xs font-semibold text-blue-500">{poll.status === "ended" ? "Winner" : "Leading"}</span>}
                            </div>
                            <span className="shrink-0 text-xs text-slate-500">{option.vote_count % 1 !== 0 ? option.vote_count.toFixed(2) : option.vote_count} votes ({pct}%)</span>
                          </div>
                          <div className="mt-2 h-2 w-full rounded-full bg-white/80 border border-slate-100">
                            <div className={`h-2 rounded-full transition-all ${isLeading ? "bg-blue-800" : "bg-slate-300"}`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Sidebar info */}
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-sm font-semibold text-slate-900">Details</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Type</dt>
                <dd className="font-medium text-slate-700">{VOTE_TYPE_LABELS[poll.vote_type]}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Access</dt>
                <dd className="font-medium text-slate-700">{VOTER_ACCESS_LABELS[poll.voter_access]}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Created</dt>
                <dd className="font-medium text-slate-700">{formatDate(poll.created_at)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Start</dt>
                <dd className="font-medium text-slate-700">{formatDate(poll.starts_at)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">End</dt>
                <dd className="font-medium text-slate-700">{formatDate(poll.closes_at)}</dd>
              </div>
              {poll.quorum != null && (
                <div className="flex justify-between">
                  <dt className="text-slate-500">Quorum</dt>
                  <dd className="font-medium text-slate-700">
                    {poll.votedCount} / {poll.quorum} votes
                    {poll.votedCount >= poll.quorum && (
                      <span className="ml-1.5 text-xs font-semibold text-[#10B981]">Reached</span>
                    )}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Share link (for link-based polls) */}
          {poll.voter_access === "link" && poll.status === "active" && (
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="text-sm font-semibold text-slate-900">Share</h2>
              <p className="mt-2 text-xs text-slate-500">Anyone with this link can vote.</p>
              <button
                onClick={() => {
                  const url = `${window.location.origin}/vote/${poll.id}`;
                  navigator.clipboard.writeText(url);
                }}
                className="mt-3 w-full rounded-lg border border-blue-300 px-3 py-2 text-xs font-medium text-blue-800 hover:bg-blue-50"
              >
                Copy voting link
              </button>
            </div>
          )}
        </div>
      </div>
      {/* AI Insights */}
      {poll.votedCount > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">AI Insights</h2>
              <p className="text-sm text-slate-500 mt-0.5">Plain-language summary of the election results generated by AI.</p>
            </div>
            <button
              onClick={handleGenerateInsights}
              disabled={insightsLoading}
              className="shrink-0 inline-flex items-center gap-2 rounded-lg bg-[#1E3A8A] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-900 disabled:opacity-60"
            >
              {insightsLoading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Analysing…
                </>
              ) : insights ? "Regenerate" : "Generate Summary"}
            </button>
          </div>
          {insightsError && <p className="text-sm text-red-600">{insightsError}</p>}
          {insights && (
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{insights.text}</p>
              <p className="mt-3 text-xs text-slate-400">Generated {new Date(insights.generatedAt).toLocaleString()}</p>
            </div>
          )}
          {!insights && !insightsLoading && !insightsError && (
            <p className="text-sm text-slate-400">Click "Generate Summary" to get an AI-powered analysis of the results.</p>
          )}
        </div>
      )}

      {/* Fraud Alerts */}
      {fraudAlerts.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 space-y-3">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            <h2 className="text-base font-semibold text-amber-900">Security Alerts ({fraudAlerts.length})</h2>
          </div>
          <div className="space-y-2">
            {fraudAlerts.map((alert) => (
              <div key={alert.id} className={`rounded-lg border p-3 ${alert.severity === "critical" ? "bg-red-50 border-red-200" : "bg-white border-amber-200"}`}>
                <div className="flex items-start gap-2">
                  <span className={`mt-0.5 inline-flex shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${alert.severity === "critical" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                    {alert.severity}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{alert.message}</p>
                    <p className="mt-0.5 text-xs text-slate-400">{new Date(alert.created_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{sub}</p>
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
