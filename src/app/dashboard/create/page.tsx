"use client";

import { useState } from "react";

type VoteType = "single" | "multiple" | "ranked";

interface Option {
  id: string;
  value: string;
}

interface Voter {
  id: string;
  name: string;
  email: string;
  code: string;
}

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
    if (i === 3) code += "-";
  }
  return code;
}

const voteTypes: { value: VoteType; label: string; description: string }[] = [
  {
    value: "single",
    label: "Single Choice",
    description: "Voters pick one option.",
  },
  {
    value: "multiple",
    label: "Multiple Choice",
    description: "Voters can select more than one option.",
  },
  {
    value: "ranked",
    label: "Ranked Choice",
    description: "Voters rank options by preference.",
  },
];

export default function CreateVotePage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [voteType, setVoteType] = useState<VoteType>("single");
  const [options, setOptions] = useState<Option[]>([
    { id: "1", value: "" },
    { id: "2", value: "" },
  ]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [voterAccess, setVoterAccess] = useState<"link" | "email">("link");
  const [voters, setVoters] = useState<Voter[]>([]);
  const [newVoterName, setNewVoterName] = useState("");
  const [newVoterEmail, setNewVoterEmail] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [bulkEmails, setBulkEmails] = useState("");
  const [showBulkInput, setShowBulkInput] = useState(false);

  function addVoter() {
    if (!newVoterName.trim() || !newVoterEmail.trim()) return;
    setVoters([
      ...voters,
      {
        id: crypto.randomUUID(),
        name: newVoterName.trim(),
        email: newVoterEmail.trim(),
        code: generateCode(),
      },
    ]);
    setNewVoterName("");
    setNewVoterEmail("");
  }

  function addBulkVoters() {
    const lines = bulkEmails
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const newVoters: Voter[] = lines.map((line) => {
      const parts = line.split(",").map((p) => p.trim());
      const email = parts.find((p) => p.includes("@")) || parts[0];
      const name =
        parts.find((p) => !p.includes("@")) || email.split("@")[0];
      return {
        id: crypto.randomUUID(),
        name,
        email,
        code: generateCode(),
      };
    });
    setVoters([...voters, ...newVoters]);
    setBulkEmails("");
    setShowBulkInput(false);
  }

  function removeVoter(id: string) {
    setVoters(voters.filter((v) => v.id !== id));
  }

  function regenerateCode(id: string) {
    setVoters(
      voters.map((v) => (v.id === id ? { ...v, code: generateCode() } : v))
    );
  }

  function copyCode(id: string, code: string) {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function addOption() {
    setOptions([...options, { id: crypto.randomUUID(), value: "" }]);
  }

  function removeOption(id: string) {
    if (options.length <= 2) return;
    setOptions(options.filter((o) => o.id !== id));
  }

  function updateOption(id: string, value: string) {
    setOptions(options.map((o) => (o.id === id ? { ...o, value } : o)));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: integrate with backend
    console.log("Create vote:", {
      title,
      description,
      voteType,
      options,
      startDate,
      endDate,
      voterAccess,
      voters,
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create a Vote</h1>
        <p className="mt-1 text-sm text-gray-500">
          Set up a new election or poll for your group.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic info */}
        <section className="space-y-5 rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">Basic Info</h2>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="e.g. Student Council President 2026"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description{" "}
              <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Provide context or instructions for voters..."
            />
          </div>
        </section>

        {/* Vote type */}
        <section className="space-y-5 rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">Vote Type</h2>

          <div className="grid gap-3 sm:grid-cols-3">
            {voteTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setVoteType(type.value)}
                className={`rounded-lg border p-4 text-left transition-colors ${
                  voteType === type.value
                    ? "border-indigo-600 bg-indigo-50 ring-2 ring-indigo-600"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <p className={`text-sm font-semibold ${voteType === type.value ? "text-indigo-700" : "text-gray-900"}`}>
                  {type.label}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {type.description}
                </p>
              </button>
            ))}
          </div>
        </section>

        {/* Options / Candidates */}
        <section className="space-y-5 rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Options / Candidates
          </h2>

          <div className="space-y-3">
            {options.map((option, index) => (
              <div key={option.id} className="flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-500">
                  {index + 1}
                </span>
                <input
                  type="text"
                  required
                  value={option.value}
                  onChange={(e) => updateOption(option.id, e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder={`Option ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeOption(option.id)}
                  disabled={options.length <= 2}
                  className="shrink-0 rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addOption}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add option
          </button>
        </section>

        {/* Schedule */}
        <section className="space-y-5 rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">Schedule</h2>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                Start date & time
              </label>
              <input
                id="startDate"
                type="datetime-local"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                End date & time
              </label>
              <input
                id="endDate"
                type="datetime-local"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </section>

        {/* Voter access */}
        <section className="space-y-5 rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">Voter Access</h2>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setVoterAccess("link")}
              className={`rounded-lg border p-4 text-left transition-colors ${
                voterAccess === "link"
                  ? "border-indigo-600 bg-indigo-50 ring-2 ring-indigo-600"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <p className={`text-sm font-semibold ${voterAccess === "link" ? "text-indigo-700" : "text-gray-900"}`}>
                Share via Link
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Anyone with the link can vote. Great for quick polls.
              </p>
            </button>
            <button
              type="button"
              onClick={() => setVoterAccess("email")}
              className={`rounded-lg border p-4 text-left transition-colors ${
                voterAccess === "email"
                  ? "border-indigo-600 bg-indigo-50 ring-2 ring-indigo-600"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <p className={`text-sm font-semibold ${voterAccess === "email" ? "text-indigo-700" : "text-gray-900"}`}>
                Email Invite Only
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Only invited email addresses can vote. Best for elections.
              </p>
            </button>
          </div>
        </section>

        {/* Voters (shown when email access is selected) */}
        {voterAccess === "email" && (
          <section className="space-y-5 rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Voters</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Add voters and each will receive a unique voting code.
                </p>
              </div>
              {voters.length > 0 && (
                <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-600">
                  {voters.length} voter{voters.length !== 1 && "s"}
                </span>
              )}
            </div>

            {/* Add single voter */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={newVoterName}
                onChange={(e) => setNewVoterName(e.target.value)}
                placeholder="Name"
                className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none sm:w-1/3"
              />
              <input
                type="email"
                value={newVoterEmail}
                onChange={(e) => setNewVoterEmail(e.target.value)}
                placeholder="Email address"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addVoter();
                  }
                }}
                className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none sm:flex-1"
              />
              <button
                type="button"
                onClick={addVoter}
                className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Add Voter
              </button>
            </div>

            {/* Bulk add toggle */}
            <div>
              <button
                type="button"
                onClick={() => setShowBulkInput(!showBulkInput)}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
                {showBulkInput ? "Hide bulk add" : "Bulk add voters"}
              </button>

              {showBulkInput && (
                <div className="mt-3 space-y-3">
                  <textarea
                    rows={4}
                    value={bulkEmails}
                    onChange={(e) => setBulkEmails(e.target.value)}
                    placeholder={"Name, email@example.com\nJane Smith, jane@example.com\njohn@example.com"}
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                  <p className="text-xs text-gray-400">
                    One voter per line. Format: Name, email — or just an email address.
                  </p>
                  <button
                    type="button"
                    onClick={addBulkVoters}
                    className="rounded-lg border border-indigo-600 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
                  >
                    Add All
                  </button>
                </div>
              )}
            </div>

            {/* Voter list */}
            {voters.length > 0 && (
              <div className="space-y-2">
                <div className="hidden sm:grid sm:grid-cols-[1fr_1fr_auto_auto] gap-3 px-3 text-xs font-medium uppercase tracking-wider text-gray-400">
                  <span>Name</span>
                  <span>Email</span>
                  <span className="w-28 text-center">Voting Code</span>
                  <span className="w-20" />
                </div>

                <div className="divide-y divide-gray-100 rounded-lg border border-gray-200">
                  {voters.map((voter) => (
                    <div
                      key={voter.id}
                      className="flex flex-col gap-2 px-3 py-3 sm:grid sm:grid-cols-[1fr_1fr_auto_auto] sm:items-center sm:gap-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {voter.name}
                        </p>
                        <p className="text-xs text-gray-500 sm:hidden">
                          {voter.email}
                        </p>
                      </div>
                      <p className="hidden text-sm text-gray-600 sm:block">
                        {voter.email}
                      </p>

                      {/* Code */}
                      <div className="flex items-center gap-1.5">
                        <code className="w-28 rounded-md bg-gray-100 px-2.5 py-1.5 text-center text-sm font-semibold tracking-wider text-indigo-700">
                          {voter.code}
                        </code>
                        <button
                          type="button"
                          onClick={() => copyCode(voter.id, voter.code)}
                          className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                          title="Copy code"
                        >
                          {copiedId === voter.id ? (
                            <svg
                              className="h-4 w-4 text-green-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={2}
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m4.5 12.75 6 6 9-13.5"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184"
                              />
                            </svg>
                          )}
                        </button>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 self-end sm:self-auto w-20 justify-end">
                        <button
                          type="button"
                          onClick={() => regenerateCode(voter.id)}
                          className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                          title="Regenerate code"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182M2.985 19.644l3.181-3.182"
                            />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => removeVoter(voter.id)}
                          className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                          title="Remove voter"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Export all codes */}
                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-gray-400">
                    Codes are single-use. Each voter enters their code to access
                    the ballot.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      const csv = [
                        "Name,Email,Voting Code",
                        ...voters.map(
                          (v) => `${v.name},${v.email},${v.code}`
                        ),
                      ].join("\n");
                      const blob = new Blob([csv], { type: "text/csv" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "voter-codes.csv";
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                      />
                    </svg>
                    Export CSV
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Save as Draft
          </button>
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
          >
            Create Vote
          </button>
        </div>
      </form>
    </div>
  );
}
