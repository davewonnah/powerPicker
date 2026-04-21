"use client";

import { useState, useEffect } from "react";
import { getMe, updateProfile, changePassword } from "@/lib/api";
import { getStoredUser, setStoredUser } from "@/lib/auth";

export default function SettingsPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    // Seed from localStorage immediately, then refresh from API
    const stored = getStoredUser();
    if (stored) {
      setUsername(stored.username);
      setEmail(stored.email);
    }
    getMe()
      .then(({ user }) => {
        setUsername(user.username);
        setEmail(user.email);
      })
      .catch(() => {});
  }, []);

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");
    setProfileSaving(true);
    try {
      const { user } = await updateProfile(username, email);
      setStoredUser(user);
      setProfileSuccess("Profile updated successfully.");
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Failed to save profile.");
    } finally {
      setProfileSaving(false);
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    setPasswordSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordSuccess("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Failed to update password.");
    } finally {
      setPasswordSaving(false);
    }
  }

  const initials = username ? username.slice(0, 2).toUpperCase() : "??";

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your account and preferences.</p>
      </div>

      {/* Profile */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Profile</h2>
        <p className="mt-1 text-sm text-slate-500">Your personal information.</p>

        <form onSubmit={handleProfileSave}>
          <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#3B82F6] to-[#1E3A8A] text-2xl font-bold text-white">
                {initials}
              </div>
            </div>

            {/* Fields */}
            <div className="flex-1 space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-slate-700">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {profileError && (
            <p className="mt-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">{profileError}</p>
          )}
          {profileSuccess && (
            <p className="mt-4 rounded-lg bg-green-50 px-4 py-2.5 text-sm text-green-700">{profileSuccess}</p>
          )}

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={profileSaving}
              className="rounded-lg bg-[#1E3A8A] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-900 disabled:opacity-60"
            >
              {profileSaving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </section>

      {/* Password */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Password</h2>
        <p className="mt-1 text-sm text-slate-500">Update your password to keep your account secure.</p>

        <form onSubmit={handlePasswordChange}>
          <div className="mt-6 space-y-4">
            <div>
              <label htmlFor="current-password" className="block text-sm font-medium text-slate-700">
                Current password
              </label>
              <input
                id="current-password"
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-slate-700">
                  New password
                </label>
                <input
                  id="new-password"
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-700">
                  Confirm new password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {passwordError && (
            <p className="mt-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">{passwordError}</p>
          )}
          {passwordSuccess && (
            <p className="mt-4 rounded-lg bg-green-50 px-4 py-2.5 text-sm text-green-700">{passwordSuccess}</p>
          )}

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={passwordSaving}
              className="rounded-lg bg-[#1E3A8A] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-900 disabled:opacity-60"
            >
              {passwordSaving ? "Updating…" : "Update Password"}
            </button>
          </div>
        </form>
      </section>

      {/* Danger zone */}
      <section className="rounded-xl border border-red-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-red-600">Danger Zone</h2>
        <p className="mt-1 text-sm text-slate-500">Irreversible actions for your account.</p>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-900">Delete account</p>
            <p className="text-sm text-slate-500">Permanently delete your account and all associated data.</p>
          </div>
          <button className="shrink-0 rounded-lg border border-red-300 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50">
            Delete Account
          </button>
        </div>
      </section>
    </div>
  );
}
