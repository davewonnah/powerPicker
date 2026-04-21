"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  listParticipants,
  addParticipant,
  regenerateParticipantCode,
  removeParticipant,
  type Participant,
} from "@/lib/api";

type VoteStatus = "voted" | "pending";

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
    if (i === 3) code += "-";
  }
  return code;
}

function participantStatus(p: Participant): VoteStatus {
  return p.has_voted ? "voted" : "pending";
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}

export default function ParticipantsPage() {
  const { id: pollId } = useParams<{ id: string }>();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<VoteStatus | "all">("all");
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [addError, setAddError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    listParticipants(pollId)
      .then(({ participants }) => setParticipants(participants))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [pollId]);

  const filtered = participants.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || participantStatus(p) === filter;
    return matchesSearch && matchesFilter;
  });

  const votedCount = participants.filter((p) => p.has_voted).length;
  const pendingCount = participants.filter((p) => !p.has_voted).length;

  async function handleAddParticipant() {
    if (!newName.trim() || !newEmail.trim()) return;
    setAddError("");
    const code = generateCode();
    try {
      const { participant } = await addParticipant(pollId, {
        name: newName.trim(),
        email: newEmail.trim(),
        code,
      });
      setParticipants((prev) => [...prev, participant]);
      setNewName("");
      setNewEmail("");
      setShowAddForm(false);
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Failed to add participant");
    }
  }

  async function handleRegenerateCode(participantId: string) {
    const code = generateCode();
    try {
      const { participant } = await regenerateParticipantCode(pollId, participantId, code);
      setParticipants((prev) => prev.map((p) => (p.id === participantId ? participant : p)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to regenerate code");
    }
  }

  async function handleRemoveParticipant(participantId: string) {
    try {
      await removeParticipant(pollId, participantId);
      setParticipants((prev) => prev.filter((p) => p.id !== participantId));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(participantId);
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove participant");
    }
  }

  async function handleRemoveSelected() {
    for (const pid of selectedIds) {
      await handleRemoveParticipant(pid);
    }
    setSelectedIds(new Set());
  }

  function copyCode(id: string, code: string) {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function copyVotingLink(id: string) {
    const url = `${window.location.origin}/vote/${pollId}`;
    navigator.clipboard.writeText(url);
    setCopiedLinkId(id);
    setTimeout(() => setCopiedLinkId(null), 2000);
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((p) => p.id)));
    }
  }

  function exportCsv() {
    const rows = [
      "Name,Email,Code,Status,Voted At",
      ...participants.map(
        (p) => `${p.name},${p.email},${p.code},${participantStatus(p)},${p.voted_at ?? ""}`
      ),
    ].join("\n");
    const blob = new Blob([rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "participants.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div>
        <Link
          href={`/dashboard/votes/${pollId}`}
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          Back to Vote
        </Link>

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Participants</h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage voters, codes, and track who has voted.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportCsv}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Export
            </button>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-800 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-900"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Participant
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500">Total</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{participants.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500">Voted</p>
          <p className="mt-1 text-2xl font-bold text-green-600">{votedCount}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500">Pending</p>
          <p className="mt-1 text-2xl font-bold text-yellow-600">{pendingCount}</p>
        </div>
      </div>

      {/* Add participant form */}
      {showAddForm && (
        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-5">
          <h3 className="text-sm font-semibold text-slate-900">Add New Participant</h3>
          {addError && (
            <p className="mt-2 text-sm text-red-600">{addError}</p>
          )}
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Full name"
              className="block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none sm:w-1/3"
            />
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Email address"
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddParticipant(); }}}
              className="block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none sm:flex-1"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddParticipant}
                className="rounded-lg bg-blue-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-900"
              >
                Add
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500">A unique voting code will be generated automatically.</p>
        </div>
      )}

      {/* Search + Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or code..."
            className="block w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex gap-1 rounded-lg border border-slate-200 bg-white p-1">
          {([
            { label: "All", value: "all", count: participants.length },
            { label: "Voted", value: "voted", count: votedCount },
            { label: "Pending", value: "pending", count: pendingCount },
          ] as const).map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                filter === tab.value ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
              <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-xs text-slate-600">{tab.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Bulk actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
          <span className="text-sm font-medium text-blue-900">{selectedIds.size} selected</span>
          <div className="h-4 w-px bg-blue-200" />
          <button onClick={handleRemoveSelected} className="text-sm font-medium text-red-600 hover:text-red-500">
            Remove
          </button>
          <button onClick={() => setSelectedIds(new Set())} className="ml-auto text-sm text-slate-500 hover:text-slate-700">
            Clear
          </button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white">
        {loading ? (
          <div className="divide-y divide-slate-100">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 px-4 animate-pulse flex items-center gap-4">
                <div className="h-4 w-4 rounded bg-slate-100" />
                <div className="h-4 w-32 rounded bg-slate-100" />
                <div className="h-4 w-48 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-500">
                    <th className="px-4 py-3 font-medium w-10">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === filtered.length && filtered.length > 0}
                        onChange={toggleSelectAll}
                        className="h-4 w-4 rounded border-slate-300 text-blue-800 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Voting Code</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Voted At</th>
                    <th className="px-4 py-3 font-medium w-24" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(p.id)}
                          onChange={() => toggleSelect(p.id)}
                          className="h-4 w-4 rounded border-slate-300 text-blue-800 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900">{p.name}</td>
                      <td className="px-4 py-3 text-slate-500">{p.email}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <code className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold tracking-wider text-blue-900">
                            {p.code}
                          </code>
                          <button
                            onClick={() => copyCode(p.id, p.code)}
                            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            title="Copy code"
                          >
                            {copiedId === p.id ? (
                              <svg className="h-3.5 w-3.5 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                              </svg>
                            ) : (
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                              </svg>
                            )}
                          </button>
                          <button
                            onClick={() => copyVotingLink(p.id)}
                            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            title="Copy voting link"
                          >
                            {copiedLinkId === p.id ? (
                              <svg className="h-3.5 w-3.5 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                              </svg>
                            ) : (
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <ParticipantBadge status={participantStatus(p)} />
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400">{formatDate(p.voted_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {!p.has_voted && (
                            <button
                              onClick={() => handleRegenerateCode(p.id)}
                              className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                              title="Regenerate code"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182M2.985 19.644l3.181-3.182" />
                              </svg>
                            </button>
                          )}
                          <button
                            onClick={() => handleRemoveParticipant(p.id)}
                            className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                            title="Remove participant"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-slate-100">
              {filtered.map((p) => (
                <div key={p.id} className="px-4 py-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(p.id)}
                        onChange={() => toggleSelect(p.id)}
                        className="h-4 w-4 rounded border-slate-300 text-blue-800 focus:ring-blue-500"
                      />
                      <div>
                        <p className="font-medium text-slate-900">{p.name}</p>
                        <p className="text-xs text-slate-500">{p.email}</p>
                      </div>
                    </div>
                    <ParticipantBadge status={participantStatus(p)} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <code className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold tracking-wider text-blue-900">
                        {p.code}
                      </code>
                      <button onClick={() => copyCode(p.id, p.code)} className="rounded p-1 text-slate-400" title="Copy code">
                        {copiedId === p.id ? (
                          <svg className="h-3.5 w-3.5 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                          </svg>
                        ) : (
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                          </svg>
                        )}
                      </button>
                      <button onClick={() => copyVotingLink(p.id)} className="rounded p-1 text-slate-400" title="Copy voting link">
                        {copiedLinkId === p.id ? (
                          <svg className="h-3.5 w-3.5 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                          </svg>
                        ) : (
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                          </svg>
                        )}
                      </button>
                    </div>
                    <div className="flex items-center gap-1">
                      {!p.has_voted && (
                        <button onClick={() => handleRegenerateCode(p.id)} className="rounded p-1.5 text-slate-400">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182M2.985 19.644l3.181-3.182" />
                          </svg>
                        </button>
                      )}
                      <button onClick={() => handleRemoveParticipant(p.id)} className="rounded p-1.5 text-slate-400 hover:text-red-500">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  {p.voted_at && <p className="text-xs text-slate-400">Voted {formatDate(p.voted_at)}</p>}
                </div>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="px-6 py-12 text-center">
                <p className="text-sm text-slate-500">No participants found.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ParticipantBadge({ status }: { status: VoteStatus }) {
  const styles = {
    voted: "bg-green-50 text-green-700 ring-green-600/20",
    pending: "bg-yellow-50 text-yellow-700 ring-yellow-600/20",
  };
  const labels = { voted: "Voted", pending: "Pending" };
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
