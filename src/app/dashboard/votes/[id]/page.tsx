"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

type Status = "active" | "ended" | "draft";

interface Vote {
  id: string;
  title: string;
  description: string;
  status: Status;
  type: string;
  createdAt: string;
  startDate: string;
  endDate: string;
  voterAccess: string;
  totalVoters: number;
  options: { name: string; votes: number }[];
  activity: { time: string; text: string }[];
  timeLeft: string;
}

const allVotes: Record<string, Vote> = {
  "1": {
    id: "1",
    title: "Student Council President 2026",
    description:
      "Vote for the next student council president. Each student gets one vote. Results will be announced at the assembly on April 3rd.",
    status: "active",
    type: "Single Choice",
    createdAt: "Mar 20, 2026",
    startDate: "Mar 25, 2026 9:00 AM",
    endDate: "Apr 2, 2026 5:00 PM",
    voterAccess: "Email Invite Only",
    totalVoters: 200,
    options: [
      { name: "Alice Johnson", votes: 52 },
      { name: "Bob Martinez", votes: 38 },
      { name: "Carol Chen", votes: 22 },
      { name: "David Kim", votes: 12 },
    ],
    activity: [
      { time: "2 min ago", text: "3 new votes cast" },
      { time: "15 min ago", text: "5 new votes cast" },
      { time: "1 hour ago", text: "Reminder email sent to 76 voters" },
      { time: "3 hours ago", text: "12 new votes cast" },
      { time: "Yesterday", text: "Vote opened for submissions" },
    ],
    timeLeft: "4 days",
  },
  "2": {
    id: "2",
    title: "Office Lunch Vendor Poll",
    description:
      "Help us pick the best lunch vendor for the office. Rank your top choices and the winner will be our go-to for Q2.",
    status: "active",
    type: "Ranked Choice",
    createdAt: "Mar 22, 2026",
    startDate: "Mar 23, 2026 8:00 AM",
    endDate: "Mar 28, 2026 6:00 PM",
    voterAccess: "Share via Link",
    totalVoters: 25,
    options: [
      { name: "Bella Italia", votes: 9 },
      { name: "Green Bowl", votes: 5 },
      { name: "Taco Fiesta", votes: 3 },
      { name: "Sushi Station", votes: 1 },
    ],
    activity: [
      { time: "10 min ago", text: "2 new votes cast" },
      { time: "2 hours ago", text: "1 new vote cast" },
      { time: "Yesterday", text: "Poll shared with the team" },
    ],
    timeLeft: "Ended",
  },
  "3": {
    id: "3",
    title: "Club Trip Destination",
    description:
      "Vote on where the club should go for the annual trip this summer. All active members are eligible to vote.",
    status: "ended",
    type: "Multiple Choice",
    createdAt: "Mar 1, 2026",
    startDate: "Mar 3, 2026 12:00 PM",
    endDate: "Mar 15, 2026 11:59 PM",
    voterAccess: "Email Invite Only",
    totalVoters: 45,
    options: [
      { name: "Lake Tahoe", votes: 28 },
      { name: "Grand Canyon", votes: 22 },
      { name: "Yosemite", votes: 19 },
      { name: "Zion National Park", votes: 14 },
    ],
    activity: [
      { time: "Mar 15", text: "Vote closed — Lake Tahoe wins" },
      { time: "Mar 14", text: "8 new votes cast" },
      { time: "Mar 12", text: "Reminder sent to 12 voters" },
      { time: "Mar 3", text: "Vote opened for submissions" },
    ],
    timeLeft: "Ended",
  },
  "4": {
    id: "4",
    title: "Board Meeting Date",
    description:
      "Please select your preferred date for the upcoming board meeting. We'll go with the most popular option.",
    status: "draft",
    type: "Single Choice",
    createdAt: "Mar 25, 2026",
    startDate: "—",
    endDate: "—",
    voterAccess: "Email Invite Only",
    totalVoters: 12,
    options: [
      { name: "April 10, 2026", votes: 0 },
      { name: "April 14, 2026", votes: 0 },
      { name: "April 17, 2026", votes: 0 },
    ],
    activity: [{ time: "Mar 25", text: "Draft created" }],
    timeLeft: "Not started",
  },
  "5": {
    id: "5",
    title: "Team Building Activity",
    description:
      "Pick your top activities for the next team building day. You can select more than one!",
    status: "ended",
    type: "Multiple Choice",
    createdAt: "Feb 28, 2026",
    startDate: "Mar 1, 2026 9:00 AM",
    endDate: "Mar 10, 2026 5:00 PM",
    voterAccess: "Share via Link",
    totalVoters: 32,
    options: [
      { name: "Escape Room", votes: 24 },
      { name: "Bowling", votes: 18 },
      { name: "Cooking Class", votes: 15 },
      { name: "Go-Karts", votes: 12 },
    ],
    activity: [
      { time: "Mar 10", text: "Vote closed — Escape Room wins" },
      { time: "Mar 8", text: "6 new votes cast" },
      { time: "Mar 1", text: "Vote opened" },
    ],
    timeLeft: "Ended",
  },
  "6": {
    id: "6",
    title: "New Logo Design",
    description:
      "We've narrowed it down to 3 logo concepts. Vote for the one you think best represents our brand.",
    status: "ended",
    type: "Single Choice",
    createdAt: "Feb 10, 2026",
    startDate: "Feb 12, 2026 10:00 AM",
    endDate: "Feb 20, 2026 10:00 AM",
    voterAccess: "Email Invite Only",
    totalVoters: 60,
    options: [
      { name: "Concept A — Modern Minimal", votes: 32 },
      { name: "Concept B — Bold Gradient", votes: 18 },
      { name: "Concept C — Classic Serif", votes: 8 },
    ],
    activity: [
      { time: "Feb 20", text: "Vote closed — Concept A wins" },
      { time: "Feb 18", text: "15 new votes cast" },
      { time: "Feb 12", text: "Vote opened" },
    ],
    timeLeft: "Ended",
  },
  "7": {
    id: "7",
    title: "Q2 Budget Allocation",
    description:
      "Rank the proposed budget categories by priority to help the finance team allocate Q2 funds.",
    status: "draft",
    type: "Ranked Choice",
    createdAt: "Mar 27, 2026",
    startDate: "—",
    endDate: "—",
    voterAccess: "Email Invite Only",
    totalVoters: 8,
    options: [
      { name: "Marketing", votes: 0 },
      { name: "Engineering", votes: 0 },
      { name: "Customer Support", votes: 0 },
      { name: "Operations", votes: 0 },
    ],
    activity: [{ time: "Mar 27", text: "Draft created" }],
    timeLeft: "Not started",
  },
  "8": {
    id: "8",
    title: "Holiday Party Theme",
    description:
      "Pick the theme for this year's holiday party! Results will be announced next Monday.",
    status: "ended",
    type: "Single Choice",
    createdAt: "Jan 20, 2026",
    startDate: "Jan 22, 2026 9:00 AM",
    endDate: "Feb 5, 2026 5:00 PM",
    voterAccess: "Share via Link",
    totalVoters: 42,
    options: [
      { name: "Winter Wonderland", votes: 18 },
      { name: "Roaring 20s", votes: 14 },
      { name: "Tropical Luau", votes: 10 },
    ],
    activity: [
      { time: "Feb 5", text: "Vote closed — Winter Wonderland wins" },
      { time: "Feb 3", text: "9 new votes cast" },
      { time: "Jan 22", text: "Vote opened" },
    ],
    timeLeft: "Ended",
  },
  "9": {
    id: "9",
    title: "Remote Work Policy Poll",
    description:
      "Share your preferences on remote work to help shape our updated policy.",
    status: "ended",
    type: "Multiple Choice",
    createdAt: "Jan 5, 2026",
    startDate: "Jan 6, 2026 9:00 AM",
    endDate: "Jan 15, 2026 11:59 PM",
    voterAccess: "Email Invite Only",
    totalVoters: 100,
    options: [
      { name: "3 days remote / 2 in-office", votes: 52 },
      { name: "Fully remote", votes: 38 },
      { name: "2 days remote / 3 in-office", votes: 28 },
      { name: "Fully in-office", votes: 5 },
    ],
    activity: [
      { time: "Jan 15", text: "Vote closed — 3/2 hybrid wins" },
      { time: "Jan 12", text: "20 new votes cast" },
      { time: "Jan 6", text: "Vote opened" },
    ],
    timeLeft: "Ended",
  },
  "10": {
    id: "10",
    title: "Annual Award Nominees",
    description:
      "Rank the nominees for the annual team award. The top-ranked nominee wins the award.",
    status: "ended",
    type: "Ranked Choice",
    createdAt: "Dec 1, 2025",
    startDate: "Dec 5, 2025 9:00 AM",
    endDate: "Dec 20, 2025 5:00 PM",
    voterAccess: "Email Invite Only",
    totalVoters: 120,
    options: [
      { name: "Sarah Park", votes: 45 },
      { name: "Mike Reynolds", votes: 35 },
      { name: "Priya Sharma", votes: 20 },
      { name: "Tom Baker", votes: 10 },
    ],
    activity: [
      { time: "Dec 20", text: "Vote closed — Sarah Park wins" },
      { time: "Dec 15", text: "30 new votes cast" },
      { time: "Dec 5", text: "Vote opened" },
    ],
    timeLeft: "Ended",
  },
  "11": {
    id: "11",
    title: "Workshop Topic Selection",
    description:
      "Which workshop topics are you most interested in? Select all that apply.",
    status: "ended",
    type: "Multiple Choice",
    createdAt: "Nov 15, 2025",
    startDate: "Nov 16, 2025 9:00 AM",
    endDate: "Nov 28, 2025 5:00 PM",
    voterAccess: "Share via Link",
    totalVoters: 30,
    options: [
      { name: "AI & Machine Learning", votes: 22 },
      { name: "Cloud Architecture", votes: 16 },
      { name: "Leadership Skills", votes: 12 },
      { name: "Public Speaking", votes: 9 },
    ],
    activity: [
      { time: "Nov 28", text: "Vote closed — AI/ML wins" },
      { time: "Nov 22", text: "10 new votes cast" },
      { time: "Nov 16", text: "Vote opened" },
    ],
    timeLeft: "Ended",
  },
  "12": {
    id: "12",
    title: "Charity Drive Cause",
    description:
      "Vote for the cause you'd like our annual charity drive to support this year.",
    status: "ended",
    type: "Single Choice",
    createdAt: "Oct 28, 2025",
    startDate: "Oct 30, 2025 9:00 AM",
    endDate: "Nov 10, 2025 5:00 PM",
    voterAccess: "Email Invite Only",
    totalVoters: 70,
    options: [
      { name: "Education for All", votes: 28 },
      { name: "Clean Water Initiative", votes: 22 },
      { name: "Hunger Relief", votes: 15 },
    ],
    activity: [
      { time: "Nov 10", text: "Vote closed — Education for All wins" },
      { time: "Nov 5", text: "18 new votes cast" },
      { time: "Oct 30", text: "Vote opened" },
    ],
    timeLeft: "Ended",
  },
};

export default function VoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const vote = allVotes[id];

  if (!vote) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Vote not found</h1>
        <p className="mt-2 text-sm text-gray-500">
          The vote you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/dashboard/votes"
          className="mt-6 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Back to My Votes
        </Link>
      </div>
    );
  }

  const totalCast = vote.options.reduce((sum, o) => sum + o.votes, 0);
  const leadingVotes = Math.max(...vote.options.map((o) => o.votes));

  return (
    <div className="space-y-6">
      {/* Breadcrumb & header */}
      <div>
        <Link
          href="/dashboard/votes"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
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
              d="M15.75 19.5 8.25 12l7.5-7.5"
            />
          </svg>
          Back to My Votes
        </Link>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{vote.title}</h1>
            <StatusBadge status={vote.status} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/dashboard/votes/${vote.id}/participants`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
              </svg>
              Participants
            </Link>
            <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Share Link
            </button>
            <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Edit
            </button>
            {vote.status === "active" && (
              <button className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100">
                End Vote
              </button>
            )}
          </div>
        </div>
        {vote.description && (
          <p className="mt-2 max-w-2xl text-sm text-gray-500">
            {vote.description}
          </p>
        )}
      </div>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Voters"
          value={String(vote.totalVoters)}
          sub="Invited"
        />
        <StatCard
          label="Votes Cast"
          value={String(totalCast)}
          sub={
            vote.totalVoters > 0
              ? `${Math.round((totalCast / vote.totalVoters) * 100)}% turnout`
              : "0% turnout"
          }
        />
        <StatCard label="Options" value={String(vote.options.length)} sub="Candidates" />
        <StatCard label="Time Left" value={vote.timeLeft} sub={vote.endDate !== "—" ? `Ends ${vote.endDate}` : "Not scheduled"} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Results */}
        <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            {vote.status === "ended" ? "Final Results" : vote.status === "active" ? "Live Results" : "Results"}
          </h2>

          {totalCast === 0 ? (
            <div className="mt-6 py-8 text-center">
              <p className="text-sm text-gray-500">No votes have been cast yet.</p>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {[...vote.options]
                .sort((a, b) => b.votes - a.votes)
                .map((option) => {
                  const pct =
                    totalCast > 0
                      ? Math.round((option.votes / totalCast) * 100)
                      : 0;
                  const isLeading = option.votes === leadingVotes;
                  return (
                    <div key={option.name}>
                      <div className="flex items-center justify-between text-sm">
                        <span
                          className={`font-medium ${isLeading ? "text-indigo-700" : "text-gray-700"}`}
                        >
                          {option.name}
                          {isLeading && (
                            <span className="ml-2 text-xs text-indigo-500">
                              {vote.status === "ended" ? "Winner" : "Leading"}
                            </span>
                          )}
                        </span>
                        <span className="text-gray-500">
                          {option.votes} votes ({pct}%)
                        </span>
                      </div>
                      <div className="mt-1.5 h-3 w-full rounded-full bg-gray-100">
                        <div
                          className={`h-3 rounded-full ${isLeading ? "bg-indigo-600" : "bg-gray-300"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Sidebar info */}
        <div className="space-y-6">
          {/* Details card */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-sm font-semibold text-gray-900">Details</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Type</dt>
                <dd className="font-medium text-gray-700">{vote.type}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Access</dt>
                <dd className="font-medium text-gray-700">
                  {vote.voterAccess}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Created</dt>
                <dd className="font-medium text-gray-700">{vote.createdAt}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Start</dt>
                <dd className="font-medium text-gray-700">{vote.startDate}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">End</dt>
                <dd className="font-medium text-gray-700">{vote.endDate}</dd>
              </div>
            </dl>
          </div>

          {/* Activity feed */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-sm font-semibold text-gray-900">
              Recent Activity
            </h2>
            <ul className="mt-4 space-y-3">
              {vote.activity.map((item, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="shrink-0 mt-0.5 h-2 w-2 rounded-full bg-indigo-400" />
                  <div>
                    <p className="text-gray-700">{item.text}</p>
                    <p className="text-xs text-gray-400">{item.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
      <p className="mt-1 text-xs text-gray-400">{sub}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const styles = {
    active: "bg-green-50 text-green-700 ring-green-600/20",
    ended: "bg-gray-50 text-gray-600 ring-gray-500/10",
    draft: "bg-yellow-50 text-yellow-700 ring-yellow-600/20",
  };

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${styles[status]}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
