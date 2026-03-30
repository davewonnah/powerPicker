import Link from "next/link";

type Status = "active" | "ended" | "draft";

const votes = [
  {
    id: "1",
    title: "Student Council President 2026",
    status: "active" as Status,
    type: "Single Choice",
    voters: 124,
    totalVoters: 200,
    endDate: "Apr 2, 2026",
    createdAt: "Mar 20, 2026",
  },
  {
    id: "2",
    title: "Office Lunch Vendor Poll",
    status: "active" as Status,
    type: "Ranked Choice",
    voters: 18,
    totalVoters: 25,
    endDate: "Mar 28, 2026",
    createdAt: "Mar 22, 2026",
  },
  {
    id: "3",
    title: "Club Trip Destination",
    status: "ended" as Status,
    type: "Multiple Choice",
    voters: 45,
    totalVoters: 45,
    endDate: "Mar 15, 2026",
    createdAt: "Mar 1, 2026",
  },
  {
    id: "4",
    title: "Board Meeting Date",
    status: "draft" as Status,
    type: "Single Choice",
    voters: 0,
    totalVoters: 12,
    endDate: "—",
    createdAt: "Mar 25, 2026",
  },
  {
    id: "5",
    title: "Team Building Activity",
    status: "ended" as Status,
    type: "Multiple Choice",
    voters: 30,
    totalVoters: 32,
    endDate: "Mar 10, 2026",
    createdAt: "Feb 28, 2026",
  },
  {
    id: "6",
    title: "New Logo Design",
    status: "ended" as Status,
    type: "Single Choice",
    voters: 58,
    totalVoters: 60,
    endDate: "Feb 20, 2026",
    createdAt: "Feb 10, 2026",
  },
  {
    id: "7",
    title: "Q2 Budget Allocation",
    status: "draft" as Status,
    type: "Ranked Choice",
    voters: 0,
    totalVoters: 8,
    endDate: "—",
    createdAt: "Mar 27, 2026",
  },
  {
    id: "8",
    title: "Holiday Party Theme",
    status: "ended" as Status,
    type: "Single Choice",
    voters: 42,
    totalVoters: 42,
    endDate: "Feb 5, 2026",
    createdAt: "Jan 20, 2026",
  },
  {
    id: "9",
    title: "Remote Work Policy Poll",
    status: "ended" as Status,
    type: "Multiple Choice",
    voters: 95,
    totalVoters: 100,
    endDate: "Jan 15, 2026",
    createdAt: "Jan 5, 2026",
  },
  {
    id: "10",
    title: "Annual Award Nominees",
    status: "ended" as Status,
    type: "Ranked Choice",
    voters: 110,
    totalVoters: 120,
    endDate: "Dec 20, 2025",
    createdAt: "Dec 1, 2025",
  },
  {
    id: "11",
    title: "Workshop Topic Selection",
    status: "ended" as Status,
    type: "Multiple Choice",
    voters: 27,
    totalVoters: 30,
    endDate: "Nov 28, 2025",
    createdAt: "Nov 15, 2025",
  },
  {
    id: "12",
    title: "Charity Drive Cause",
    status: "ended" as Status,
    type: "Single Choice",
    voters: 65,
    totalVoters: 70,
    endDate: "Nov 10, 2025",
    createdAt: "Oct 28, 2025",
  },
];

const tabs: { label: string; filter: Status | "all" }[] = [
  { label: "All", filter: "all" },
  { label: "Active", filter: "active" },
  { label: "Ended", filter: "ended" },
  { label: "Drafts", filter: "draft" },
];

export default function MyVotesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Votes</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage all your elections and polls.
          </p>
        </div>
        <Link
          href="/dashboard/create"
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          New Vote
        </Link>
      </div>

      {/* Filters / Tabs */}
      <div className="flex gap-1 rounded-lg border border-gray-200 bg-white p-1">
        {tabs.map((tab) => {
          const count =
            tab.filter === "all"
              ? votes.length
              : votes.filter((v) => v.status === tab.filter).length;
          return (
            <button
              key={tab.filter}
              className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 first:bg-gray-100 first:text-gray-900"
            >
              {tab.label}
              <span className="rounded-full bg-gray-200 px-1.5 py-0.5 text-xs font-medium text-gray-600">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Votes grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {votes.map((vote) => (
          <Link
            key={vote.id}
            href={`/dashboard/votes/${vote.id}`}
            className="group rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600">
                {vote.title}
              </h3>
              <StatusBadge status={vote.status} />
            </div>

            <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
              <span>{vote.type}</span>
              <span className="h-1 w-1 rounded-full bg-gray-300" />
              <span>Created {vote.createdAt}</span>
            </div>

            {/* Progress */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Participation</span>
                <span className="font-medium text-gray-700">
                  {vote.voters}/{vote.totalVoters}
                </span>
              </div>
              <div className="mt-1.5 h-2 w-full rounded-full bg-gray-100">
                <div
                  className={`h-2 rounded-full ${
                    vote.status === "active"
                      ? "bg-indigo-600"
                      : vote.status === "ended"
                        ? "bg-gray-400"
                        : "bg-yellow-400"
                  }`}
                  style={{
                    width:
                      vote.totalVoters > 0
                        ? `${(vote.voters / vote.totalVoters) * 100}%`
                        : "0%",
                  }}
                />
              </div>
            </div>

            {vote.status !== "draft" && (
              <p className="mt-3 text-xs text-gray-400">
                {vote.status === "active" ? "Ends" : "Ended"} {vote.endDate}
              </p>
            )}
          </Link>
        ))}
      </div>
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
