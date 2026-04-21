import { getToken, clearAuth } from "./auth";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers as Record<string, string> | undefined),
    },
  });

  const body = await res.json().catch(() => ({}));

  if (res.status === 401) {
    clearAuth();
    window.location.href = "/login";
    throw new Error("Session expired. Please log in again.");
  }

  if (!res.ok) {
    throw new Error((body as { message?: string }).message ?? `Request failed (${res.status})`);
  }

  return body as T;
}

/* ── Types ──────────────────────────────────────────────────── */

export interface User {
  id: string;
  username: string;
  email: string;
  role?: "user" | "admin" | "super_admin";
}

export interface PollOption {
  id: string;
  label: string;
  position: number;
  vote_count: number;
  candidate_position: string | null;
  party: string | null;
  bio: string | null;
  image_url: string | null;
}

export interface Poll {
  id: string;
  title: string;
  description: string | null;
  vote_type: "single" | "multiple" | "ranked";
  voter_access: "link" | "email";
  status: "draft" | "active" | "ended";
  starts_at: string | null;
  closes_at: string | null;
  quorum: number | null;
  created_at: string;
  creator_id: string;
  options: PollOption[];
  totalVotes: number;
  totalParticipants: number;
  votedCount: number;
}

export interface Participant {
  id: string;
  poll_id: string;
  name: string;
  email: string;
  code: string;
  has_voted: boolean;
  voted_at: string | null;
}

export interface DashboardStats {
  polls_created: number;
  active_polls: number;
  total_participants: number;
  total_votes_cast: number;
}

export interface DashboardPoll {
  id: string;
  title: string;
  vote_type: "single" | "multiple" | "ranked";
  voter_access: "link" | "email";
  status: "draft" | "active" | "ended";
  starts_at: string | null;
  closes_at: string | null;
  created_at: string;
  total_participants: number;
  votes_cast: number;
}

/* ── Auth ───────────────────────────────────────────────────── */

export const authLogin = (email: string, password: string) =>
  apiFetch<{ user: User; token: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const authRegister = (username: string, email: string, password: string) =>
  apiFetch<{ user: User; token: string }>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, email, password }),
  });

export const getMe = () =>
  apiFetch<{ user: User }>("/auth/me");

export const updateProfile = (username: string, email: string) =>
  apiFetch<{ user: User }>("/auth/me", {
    method: "PATCH",
    body: JSON.stringify({ username, email }),
  });

export const changePassword = (currentPassword: string, newPassword: string) =>
  apiFetch<{ message: string }>("/auth/password", {
    method: "PATCH",
    body: JSON.stringify({ currentPassword, newPassword }),
  });

/* ── Dashboard ──────────────────────────────────────────────── */

export const getDashboard = () =>
  apiFetch<{
    stats: DashboardStats;
    myPolls: DashboardPoll[];
    myVotes: unknown[];
    recentActivity: unknown[];
  }>("/dashboard");

/* ── Polls ──────────────────────────────────────────────────── */

export interface CandidateOption {
  label: string;
  candidate_position?: string;
  party?: string;
  bio?: string;
  image_url?: string;
}

export interface CreatePollPayload {
  title: string;
  description?: string;
  voteType: "single" | "multiple" | "ranked";
  voterAccess: "link" | "email";
  startsAt?: string;
  closesAt?: string;
  quorum?: number;
  reminderHoursBefore?: number;
  allowedCountries?: string[];
  options: (string | CandidateOption)[];
  voters?: { name: string; email: string; code: string; weight?: number }[];
}

export interface Observer {
  id: string;
  poll_id: string;
  email: string;
  name: string | null;
  token: string;
  added_at: string;
  observeUrl: string;
}

export interface FraudAlert {
  id: string;
  alert_type: string;
  severity: string;
  message: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export const createPoll = (data: CreatePollPayload) =>
  apiFetch<{ poll: Poll }>("/polls", { method: "POST", body: JSON.stringify(data) });

export const listPolls = (params?: { status?: string; page?: number; limit?: number }) => {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  return apiFetch<{ polls: DashboardPoll[]; total: number; page: number; limit: number }>(
    `/polls${qs.toString() ? `?${qs}` : ""}`
  );
};

export const getPoll = (id: string) =>
  apiFetch<{ poll: Poll }>(`/polls/${id}`);

export const updatePoll = (id: string, data: { title?: string; description?: string; status?: string }) =>
  apiFetch<{ poll: Poll }>(`/polls/${id}`, { method: "PATCH", body: JSON.stringify(data) });

export const deletePoll = (id: string) =>
  apiFetch<{ message: string }>(`/polls/${id}`, { method: "DELETE" });

export const getPollResults = (id: string) =>
  apiFetch<{
    pollId: string;
    title: string;
    voteType: string;
    status: string;
    totalVotes: number;
    options: (PollOption & { percentage: number })[];
  }>(`/polls/${id}/votes/results`);

/* ── Participants ───────────────────────────────────────────── */

export const listParticipants = (pollId: string) =>
  apiFetch<{ participants: Participant[] }>(`/polls/${pollId}/participants`);

export const addParticipant = (pollId: string, data: { name: string; email: string; code: string }) =>
  apiFetch<{ participant: Participant }>(`/polls/${pollId}/participants`, {
    method: "POST",
    body: JSON.stringify(data),
  });

export const regenerateParticipantCode = (pollId: string, participantId: string, code: string) =>
  apiFetch<{ participant: Participant }>(`/polls/${pollId}/participants/${participantId}/code`, {
    method: "PATCH",
    body: JSON.stringify({ code }),
  });

export const removeParticipant = (pollId: string, participantId: string) =>
  apiFetch<{ message: string }>(`/polls/${pollId}/participants/${participantId}`, {
    method: "DELETE",
  });

/* ── Upload ─────────────────────────────────────────────────── */

export const uploadImage = async (file: File): Promise<string> => {
  const token = getToken();
  const formData = new FormData();
  formData.append("image", file);
  const res = await fetch(`${BASE}/upload`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((body as { message?: string }).message ?? "Upload failed");
  const imageUrl = (body as { url: string }).url;
  // Build full URL pointing to the API server
  return `${BASE.replace("/api", "")}${imageUrl}`;
};

/* ── Public voting ──────────────────────────────────────────── */

export const requestOtp = (pollId: string, code: string) =>
  apiFetch<{ sent: boolean; maskedEmail: string }>(`/polls/${pollId}/votes/request-otp`, {
    method: "POST",
    body: JSON.stringify({ code }),
  });

export const castPublicVote = (pollId: string, code: string | undefined, optionIds: string[], otp?: string) =>
  apiFetch<{ message: string; confirmationId: string }>(`/polls/${pollId}/votes/cast`, {
    method: "POST",
    body: JSON.stringify({ ...(code ? { code } : {}), optionIds, ...(otp ? { otp } : {}) }),
  });

export interface AnalyticsTimelinePoint {
  hour: string;
  votes: number;
  cumulative: number;
  turnoutPct: number;
}

export interface AnalyticsOption {
  id: string;
  label: string;
  position: number;
  vote_count: number;
  percentage: number;
}

export interface PollAnalytics {
  timeline: AnalyticsTimelinePoint[];
  options: AnalyticsOption[];
  totalVotes: number;
  totalParticipants: number;
  voted: number;
  pending: number;
  turnoutPct: number;
}

export const getPollAnalytics = (pollId: string) =>
  apiFetch<PollAnalytics>(`/polls/${pollId}/votes/analytics`);

// Observers
export const listObservers = (pollId: string) =>
  apiFetch<{ observers: Observer[] }>(`/polls/${pollId}/observers`);

export const addObserver = (pollId: string, data: { email: string; name?: string }) =>
  apiFetch<{ observer: Observer }>(`/polls/${pollId}/observers`, {
    method: "POST", body: JSON.stringify(data),
  });

export const removeObserver = (pollId: string, observerId: string) =>
  apiFetch<{ message: string }>(`/polls/${pollId}/observers/${observerId}`, { method: "DELETE" });

export const getObserverView = (token: string) =>
  apiFetch<{ poll: { id: string; title: string; description: string | null; status: string; vote_type: string; closes_at: string | null }; results: { totalVotes: number; options: (PollOption & { percentage: number })[] } | null }>(
    `/observe/${encodeURIComponent(token)}`
  );

// AI Insights
export const getPollInsights = (pollId: string) =>
  apiFetch<{ insights: string; generatedAt: string; cached: boolean }>(`/polls/${pollId}/votes/insights`);

export const regeneratePollInsights = (pollId: string) =>
  apiFetch<{ insights: string; generatedAt: string; cached: boolean }>(`/polls/${pollId}/votes/insights/regenerate`, { method: "POST" });

// Fraud alerts
export const getFraudAlerts = (pollId: string) =>
  apiFetch<{ alerts: FraudAlert[] }>(`/polls/${pollId}/votes/fraud-alerts`);

export const verifyVote = (token: string) =>
  apiFetch<{ verified: boolean; pollTitle?: string; pollStatus?: string; votedAt?: string; voterName?: string | null; message?: string }>(
    `/verify/${encodeURIComponent(token)}`
  );

/* ── Admin: User Management ────────────────────────────────── */

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: "user" | "admin" | "super_admin";
  created_at: string;
  polls_count?: number;
}

export const adminListUsers = (params?: { search?: string; role?: string; page?: number; limit?: number }) => {
  const qs = new URLSearchParams();
  if (params?.search) qs.set("search", params.search);
  if (params?.role) qs.set("role", params.role);
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  return apiFetch<{ users: AdminUser[]; total: number; page: number; limit: number }>(
    `/admin/users${qs.toString() ? `?${qs}` : ""}`
  );
};

export const adminGetUser = (id: string) =>
  apiFetch<{ user: AdminUser }>(`/admin/users/${id}`);

export const adminUpdateUser = (id: string, data: { username?: string; email?: string; role?: string }) =>
  apiFetch<{ user: AdminUser }>(`/admin/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const adminDeleteUser = (id: string) =>
  apiFetch<{ message: string }>(`/admin/users/${id}`, { method: "DELETE" });
