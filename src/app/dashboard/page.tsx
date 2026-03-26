import Link from "next/link";

const stats = [
  { label: "Total Votes", value: "12", change: "+3 this month" },
  { label: "Active Now", value: "2", change: "Ends soon" },
  { label: "Total Participants", value: "348", change: "+52 this month" },
  { label: "Avg. Turnout", value: "78%", change: "+5% vs last" },
];

const recentVotes = [
  {
    id: "1",
    title: "Student Council President 2026",
    status: "active" as const,
    type: "Single Choice",
    voters: 124,
    totalVoters: 200,
    endDate: "Apr 2, 2026",
  },
  {
    id: "2",
    title: "Office Lunch Vendor Poll",
    status: "active" as const,
    type: "Ranked Choice",
    voters: 18,
    totalVoters: 25,
    endDate: "Mar 28, 2026",
  },
  {
    id: "3",
    title: "Club Trip Destination",
    status: "ended" as const,
    type: "Multiple Choice",
    voters: 45,
    totalVoters: 45,
    endDate: "Mar 15, 2026",
  },
  {
    id: "4",
    title: "Board Meeting Date",
    status: "draft" as const,
    type: "Single Choice",
    voters: 0,
    totalVoters: 12,
    endDate: "—",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Overview of your votes and elections.
          </p>
        </div>
        <Link
          href="/dashboard/create"
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Create Vote
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-gray-200 bg-white p-5"
          >
            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">
              {stat.value}
            </p>
            <p className="mt-1 text-xs text-gray-400">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Recent votes table */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Votes</h2>
          <Link
            href="/dashboard/votes"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            View all
          </Link>
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500">
                <th className="px-6 py-3 font-medium">Title</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Participation</th>
                <th className="px-6 py-3 font-medium">End Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentVotes.map((vote) => (
                <tr key={vote.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {vote.title}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={vote.status} />
                  </td>
                  <td className="px-6 py-4 text-gray-500">{vote.type}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-20 rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-indigo-600"
                          style={{
                            width: `${(vote.voters / vote.totalVoters) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">
                        {vote.voters}/{vote.totalVoters}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{vote.endDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="sm:hidden divide-y divide-gray-100">
          {recentVotes.map((vote) => (
            <div key={vote.id} className="px-6 py-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-medium text-gray-900">{vote.title}</p>
                <StatusBadge status={vote.status} />
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{vote.type}</span>
                <span>
                  {vote.voters}/{vote.totalVoters} voted
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-gray-200">
                <div
                  className="h-1.5 rounded-full bg-indigo-600"
                  style={{
                    width: `${(vote.voters / vote.totalVoters) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: "active" | "ended" | "draft" }) {
  const styles = {
    active: "bg-green-50 text-green-700 ring-green-600/20",
    ended: "bg-gray-50 text-gray-600 ring-gray-500/10",
    draft: "bg-yellow-50 text-yellow-700 ring-yellow-600/20",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${styles[status]}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
