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
  id: number;
  username: string;
  email: string;
}

export interface PollOption {
  id: number;
  label: string;
  position: number;
  vote_count: number;
  candidate_position: string | null;
  party: string | null;
  bio: string | null;
  image_url: string | null;
}

export interface Poll {
  id: number;
  title: string;
  description: string | null;
  vote_type: "single" | "multiple" | "ranked";
  voter_access: "link" | "email";
  status: "draft" | "active" | "ended";
  starts_at: string | null;
  closes_at: string | null;
  quorum: number | null;
  created_at: string;
  creator_id: number;
  options: PollOption[];
  totalVotes: number;
  totalParticipants: number;
  votedCount: number;
}

export interface Participant {
  id: number;
  poll_id: number;
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
  id: number;
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
  options: (string | CandidateOption)[];
  voters?: { name: string; email: string; code: string }[];
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

export const getPoll = (id: number) =>
  apiFetch<{ poll: Poll }>(`/polls/${id}`);

export const updatePoll = (id: number, data: { title?: string; description?: string; status?: string }) =>
  apiFetch<{ poll: Poll }>(`/polls/${id}`, { method: "PATCH", body: JSON.stringify(data) });

export const deletePoll = (id: number) =>
  apiFetch<{ message: string }>(`/polls/${id}`, { method: "DELETE" });

export const getPollResults = (id: number) =>
  apiFetch<{
    pollId: number;
    title: string;
    voteType: string;
    status: string;
    totalVotes: number;
    options: (PollOption & { percentage: number })[];
  }>(`/polls/${id}/votes/results`);

/* ── Participants ───────────────────────────────────────────── */

export const listParticipants = (pollId: number) =>
  apiFetch<{ participants: Participant[] }>(`/polls/${pollId}/participants`);

export const addParticipant = (pollId: number, data: { name: string; email: string; code: string }) =>
  apiFetch<{ participant: Participant }>(`/polls/${pollId}/participants`, {
    method: "POST",
    body: JSON.stringify(data),
  });

export const regenerateParticipantCode = (pollId: number, participantId: number, code: string) =>
  apiFetch<{ participant: Participant }>(`/polls/${pollId}/participants/${participantId}/code`, {
    method: "PATCH",
    body: JSON.stringify({ code }),
  });

export const removeParticipant = (pollId: number, participantId: number) =>
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

export const castPublicVote = (pollId: number, code: string, optionIds: number[]) =>
  apiFetch<{ message: string; confirmationId: string }>(`/polls/${pollId}/votes/cast`, {
    method: "POST",
    body: JSON.stringify({ code, optionIds }),
  });

export interface AnalyticsTimelinePoint {
  hour: string;
  votes: number;
  cumulative: number;
  turnoutPct: number;
}

export interface AnalyticsOption {
  id: number;
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

export const getPollAnalytics = (pollId: number) =>
  apiFetch<PollAnalytics>(`/polls/${pollId}/votes/analytics`);

export const verifyVote = (token: string) =>
  apiFetch<{ verified: boolean; pollTitle?: string; pollStatus?: string; votedAt?: string; voterName?: string | null; message?: string }>(
    `/verify/${encodeURIComponent(token)}`
  );
