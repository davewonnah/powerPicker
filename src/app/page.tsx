export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold text-indigo-600">PowerPicker</h1>
          <nav className="flex items-center gap-4">
            <a
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Log in
            </a>
            <a
              href="/signup"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Get Started
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center mb-22 mt-22 px-6 text-center">
        <h2 className="max-w-3xl text-5xl font-bold tracking-tight text-gray-900">
          Simple, secure voting for{" "}
          <span className="text-indigo-600">every group</span>
        </h2>
        <p className="mt-6 max-w-xl text-lg text-gray-600">
          Run elections and polls for your school, university, office, or
          community. Create a vote in minutes, share a link, and get results
          instantly.
        </p>
        <div className="mt-10 flex gap-4">
          <a
            href="/signup"
            className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
          >
            Create a Vote
          </a>
          <a
            href="#features"
            className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100"
          >
            Learn More
          </a>
        </div>
      </main>

      {/* Features */}
      <section id="features" className="border-t border-gray-200 bg-white py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h3 className="text-center text-3xl font-bold text-gray-900">
            Why PowerPicker?
          </h3>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              title="Easy Setup"
              description="Create an election or poll in minutes. No technical expertise required."
            />
            <FeatureCard
              title="Secure & Private"
              description="Each voter gets a unique link. Results are tamper-proof and transparent."
            />
            <FeatureCard
              title="Real-Time Results"
              description="Watch votes come in live. Export results when the election closes."
            />
            <FeatureCard
              title="Works Everywhere"
              description="Voters can cast ballots from any device — phone, tablet, or desktop."
            />
            <FeatureCard
              title="Flexible Voting"
              description="Single choice, multiple choice, ranked choice — pick the format that fits."
            />
            <FeatureCard
              title="Free for Small Groups"
              description="Run votes for up to 50 participants at no cost. Scale when you need to."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 py-8 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} PowerPicker. All rights reserved.
      </footer>
    </div>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
      <h4 className="text-lg font-semibold text-gray-900">{title}</h4>
      <p className="mt-2 text-sm text-gray-600">{description}</p>
    </div>
  );
}
