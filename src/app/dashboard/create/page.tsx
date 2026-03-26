"use client";

import { useState } from "react";

type VoteType = "single" | "multiple" | "ranked";

interface Option {
  id: string;
  value: string;
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
