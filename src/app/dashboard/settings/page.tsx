"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [name, setName] = useState("John Doe");
  const [email, setEmail] = useState("john@example.com");
  const [org, setOrg] = useState("Acme University");

  const [emailNotifs, setEmailNotifs] = useState(true);
  const [voteReminders, setVoteReminders] = useState(true);
  const [resultAlerts, setResultAlerts] = useState(false);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account and preferences.
        </p>
      </div>

      {/* Profile */}
      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
        <p className="mt-1 text-sm text-gray-500">
          Your personal information.
        </p>

        <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-2xl font-bold text-white">
              JD
            </div>
            <button className="text-xs font-medium text-indigo-600 hover:text-indigo-500">
              Change photo
            </button>
          </div>

          {/* Fields */}
          <div className="flex-1 space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Full name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="org"
                className="block text-sm font-medium text-gray-700"
              >
                Organization{" "}
                <span className="text-gray-400">(optional)</span>
              </label>
              <input
                id="org"
                type="text"
                value={org}
                onChange={(e) => setOrg(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700">
            Save Changes
          </button>
        </div>
      </section>

      {/* Notifications */}
      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
        <p className="mt-1 text-sm text-gray-500">
          Choose what you get notified about.
        </p>

        <div className="mt-6 space-y-4">
          <Toggle
            label="Email notifications"
            description="Receive email updates about your votes."
            checked={emailNotifs}
            onChange={setEmailNotifs}
          />
          <Toggle
            label="Vote reminders"
            description="Get reminded before a vote you created is about to end."
            checked={voteReminders}
            onChange={setVoteReminders}
          />
          <Toggle
            label="Result alerts"
            description="Get notified the moment a vote closes and results are available."
            checked={resultAlerts}
            onChange={setResultAlerts}
          />
        </div>
      </section>

      {/* Password */}
      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Password</h2>
        <p className="mt-1 text-sm text-gray-500">
          Update your password to keep your account secure.
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="current-password"
              className="block text-sm font-medium text-gray-700"
            >
              Current password
            </label>
            <input
              id="current-password"
              type="password"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="new-password"
                className="block text-sm font-medium text-gray-700"
              >
                New password
              </label>
              <input
                id="new-password"
                type="password"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm new password
              </label>
              <input
                id="confirm-password"
                type="password"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700">
            Update Password
          </button>
        </div>
      </section>

      {/* Danger zone */}
      <section className="rounded-xl border border-red-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-red-600">Danger Zone</h2>
        <p className="mt-1 text-sm text-gray-500">
          Irreversible actions for your account.
        </p>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">
              Delete account
            </p>
            <p className="text-sm text-gray-500">
              Permanently delete your account and all associated data.
            </p>
          </div>
          <button className="shrink-0 rounded-lg border border-red-300 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50">
            Delete Account
          </button>
        </div>
      </section>
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
          checked ? "bg-indigo-600" : "bg-gray-200"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
