export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-indigo-600">PowerPicker</h1>
          <nav className="flex items-center gap-2 sm:gap-4">
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
      <main className="flex flex-1 flex-col items-center justify-center my-12 sm:my-16 md:my-22 px-4 sm:px-6 text-center">
        <h2 className="max-w-3xl text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
          Simple, secure voting for{" "}
          <span className="text-indigo-600">every group</span>
        </h2>
        <p className="mt-4 sm:mt-6 max-w-xl text-base sm:text-lg text-gray-600">
          Run elections and polls for your school, university, office, or
          community. Create a vote in minutes, share a link, and get results
          instantly.
        </p>
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
          <a
            href="/signup"
            className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 text-center"
          >
            Create a Vote
          </a>
          <a
            href="#features"
            className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100 text-center"
          >
            Learn More
          </a>
        </div>
      </main>

      {/* Features */}
      <section id="features" className="border-t border-gray-200 bg-white py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h3 className="text-center text-2xl sm:text-3xl font-bold text-gray-900">
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

      {/* How It Works */}
      <section className="bg-gray-50 py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h3 className="text-center text-2xl sm:text-3xl font-bold text-gray-900">
            How It Works
          </h3>
          <p className="mx-auto mt-3 sm:mt-4 max-w-2xl text-center text-sm sm:text-base text-gray-600">
            Get from idea to results in three simple steps. No complicated setup,
            no learning curve.
          </p>
          <div className="mt-10 sm:mt-14 grid gap-10 sm:grid-cols-3">
            <StepCard
              step={1}
              title="Create Your Vote"
              description="Choose a voting format, add your options, and set a deadline. Customize rules like anonymous voting or voter eligibility."
            />
            <StepCard
              step={2}
              title="Share the Link"
              description="Send a unique voting link to your group via email, chat, or social media. Each participant gets secure access."
            />
            <StepCard
              step={3}
              title="Get Results"
              description="Watch votes come in on your live dashboard. When voting closes, export detailed results and analytics."
            />
          </div>
        </div>
      </section>

      {/* Stats / Social Proof */}
      <section className="border-t border-gray-200 bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="grid grid-cols-3 gap-4 sm:gap-8 text-center">
            <div>
              <p className="text-2xl sm:text-4xl font-bold text-indigo-600">10K+</p>
              <p className="mt-2 text-sm text-gray-600">Votes created</p>
            </div>
            <div>
              <p className="text-2xl sm:text-4xl font-bold text-indigo-600">50K+</p>
              <p className="mt-2 text-sm text-gray-600">Ballots cast</p>
            </div>
            <div>
              <p className="text-2xl sm:text-4xl font-bold text-indigo-600">99.9%</p>
              <p className="mt-2 text-sm text-gray-600">Uptime reliability</p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="bg-gray-50 py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h3 className="text-center text-2xl sm:text-3xl font-bold text-gray-900">
            Built for Every Team
          </h3>
          <p className="mx-auto mt-3 sm:mt-4 max-w-2xl text-center text-sm sm:text-base text-gray-600">
            Whether you're running a student council election or picking a team
            lunch spot, PowerPicker scales to fit your needs.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <UseCaseCard
              title="Schools & Universities"
              description="Run student government elections, class polls, and faculty votes with verified student access."
            />
            <UseCaseCard
              title="Workplaces"
              description="Decide on team outings, gather anonymous feedback, or elect committee members."
            />
            <UseCaseCard
              title="Communities & Clubs"
              description="Let members vote on budgets, events, and leadership — all from their phone."
            />
            <UseCaseCard
              title="Non-Profits"
              description="Hold board elections and membership votes that meet your governance requirements."
            />
            <UseCaseCard
              title="Events & Conferences"
              description="Run live audience polls, speaker ratings, and award voting during your event."
            />
            <UseCaseCard
              title="Friends & Family"
              description="Settle debates the fair way — pick a movie night, holiday destination, or baby name."
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-gray-200 bg-white py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h3 className="text-center text-2xl sm:text-3xl font-bold text-gray-900">
            Frequently Asked Questions
          </h3>
          <p className="mx-auto mt-3 sm:mt-4 max-w-xl text-center text-sm sm:text-base text-gray-600">
            Everything you need to know about PowerPicker.
          </p>
          <dl className="mt-8 sm:mt-12 space-y-4 sm:space-y-6">
            <FaqItem
              question="Is PowerPicker free to use?"
              answer="Yes! PowerPicker is completely free for groups of up to 50 participants. For larger groups or advanced features like custom branding and detailed analytics, we offer affordable paid plans."
            />
            <FaqItem
              question="How do you keep votes secure?"
              answer="Every voter receives a unique, single-use link. Votes are encrypted in transit and at rest, and results are tamper-proof. We never share voter data with third parties."
            />
            <FaqItem
              question="What voting formats are supported?"
              answer="We support single choice, multiple choice, ranked choice (instant-runoff), and approval voting. You can pick the format that best fits your election or poll."
            />
            <FaqItem
              question="Can voters remain anonymous?"
              answer="Absolutely. When you create a vote, you can toggle anonymous mode so that results show only totals — no one, including the organizer, can see who voted for what."
            />
            <FaqItem
              question="Is there a limit on the number of options or candidates?"
              answer="No hard limit. You can add as many options as you need. For very large ballots we recommend keeping it under 50 options for the best voter experience."
            />
            <FaqItem
              question="Can I set a deadline for voting?"
              answer="Yes. Set a start and end date when creating your vote. Voting automatically closes at your deadline, and results are finalized instantly."
            />
            <FaqItem
              question="Do voters need to create an account?"
              answer="No. Voters can cast their ballot through the unique link without signing up. Only vote organizers need a PowerPicker account."
            />
          </dl>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-indigo-600 py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <h3 className="text-2xl sm:text-3xl font-bold text-white">
            Ready to run your first vote?
          </h3>
          <p className="mx-auto mt-3 sm:mt-4 max-w-xl text-sm sm:text-base text-indigo-100">
            Join thousands of groups who trust PowerPicker to make fair decisions.
            Create your first vote in under two minutes — no credit card required.
          </p>
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <a
              href="/signup"
              className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-indigo-50 text-center"
            >
              Get Started for Free
            </a>
            <a
              href="/contact"
              className="rounded-lg border border-indigo-300 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 text-center"
            >
              Contact Sales
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-900 text-gray-400">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div>
              <h4 className="text-lg font-bold text-white">PowerPicker</h4>
              <p className="mt-3 text-sm leading-relaxed">
                Simple, secure voting for every group. Create elections and polls
                in minutes.
              </p>
            </div>

            {/* Product */}
            <div>
              <h5 className="text-sm font-semibold uppercase tracking-wider text-gray-300">
                Product
              </h5>
              <ul className="mt-3 space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="/pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="/docs" className="hover:text-white transition-colors">Documentation</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h5 className="text-sm font-semibold uppercase tracking-wider text-gray-300">
                Company
              </h5>
              <ul className="mt-3 space-y-2 text-sm">
                <li><a href="/about" className="hover:text-white transition-colors">About</a></li>
                <li><a href="/blog" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h5 className="text-sm font-semibold uppercase tracking-wider text-gray-300">
                Legal
              </h5>
              <ul className="mt-3 space-y-2 text-sm">
                <li><a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-10 border-t border-gray-800 pt-6 text-center text-sm">
            &copy; {new Date().getFullYear()} PowerPicker. All rights reserved.
          </div>
        </div>
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

function StepCard({
  step,
  title,
  description,
}: {
  step: number;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-lg font-bold text-white">
        {step}
      </div>
      <h4 className="mt-4 text-lg font-semibold text-gray-900">{title}</h4>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">
        {description}
      </p>
    </div>
  );
}

function UseCaseCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h4 className="text-lg font-semibold text-gray-900">{title}</h4>
      <p className="mt-2 text-sm text-gray-600">{description}</p>
    </div>
  );
}

function FaqItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 sm:p-6">
      <dt className="text-sm sm:text-base font-semibold text-gray-900">{question}</dt>
      <dd className="mt-2 text-sm leading-relaxed text-gray-600">{answer}</dd>
    </div>
  );
}
