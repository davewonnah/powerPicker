"use client";

import { useState } from "react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F9FAFB]">
      <Nav />
      <Hero />
      <TrustBar />
      <Features />
      <HowItWorks />
      <FeatureDeep />
      <UseCases />
      <Faq />
      <CtaBanner />
      <Footer />
    </div>
  );
}

/* ── Nav ─────────────────────────────────────────────────────── */

function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1E3A8A] shadow-sm">
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
            </svg>
          </div>
          <span className="text-lg font-bold text-[#1E3A8A]">PowerPicker</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          <a href="#features" className="text-sm font-medium text-slate-600 hover:text-[#1E3A8A]">Features</a>
          <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-[#1E3A8A]">How it works</a>
          <a href="#use-cases" className="text-sm font-medium text-slate-600 hover:text-[#1E3A8A]">Use cases</a>
          <a href="#faq" className="text-sm font-medium text-slate-600 hover:text-[#1E3A8A]">FAQ</a>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">Log in</Link>
          <Link href="/signup" className="rounded-lg bg-[#1E3A8A] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-900">
            Get Started Free
          </Link>
        </div>

        {/* Mobile burger */}
        <button onClick={() => setOpen(!open)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:hidden">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            {open
              ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-slate-100 bg-white px-4 py-4 space-y-3 md:hidden">
          {["#features", "#how-it-works", "#use-cases", "#faq"].map((href) => (
            <a key={href} href={href} onClick={() => setOpen(false)}
              className="block text-sm font-medium capitalize text-slate-600 hover:text-[#1E3A8A]">
              {href.replace("#", "").replace(/-/g, " ")}
            </a>
          ))}
          <div className="flex gap-3 pt-2 border-t border-slate-100">
            <Link href="/login" className="flex-1 rounded-lg border border-slate-300 py-2 text-center text-sm font-medium text-slate-700">Log in</Link>
            <Link href="/signup" className="flex-1 rounded-lg bg-[#1E3A8A] py-2 text-center text-sm font-semibold text-white">Get Started</Link>
          </div>
        </div>
      )}
    </header>
  );
}

/* ── Hero ────────────────────────────────────────────────────── */

function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#1E3A8A] py-20 sm:py-28">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-[#3B82F6]/20" />
        <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-[#3B82F6]/10" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-blue-200 ring-1 ring-white/20">
          <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
          Trusted by schools, organisations &amp; communities
        </span>
        <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
          Run secure, transparent{" "}
          <span className="text-[#3B82F6]">elections</span>{" "}
          your group trusts
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base text-blue-200 sm:text-lg">
          PowerPicker makes it simple to create an election in minutes, invite participants, and deliver verified results — from student councils to AGMs to community polls.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/signup"
            className="w-full rounded-lg bg-[#3B82F6] px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-400 sm:w-auto">
            Create a Vote — It&apos;s Free
          </Link>
          <a href="#how-it-works"
            className="w-full rounded-lg border border-white/30 px-8 py-3.5 text-sm font-semibold text-white hover:bg-white/10 sm:w-auto">
            See How It Works
          </a>
        </div>

        {/* Hero badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4 text-xs text-blue-300">
          {["No credit card required", "Anonymous voting", "Instant results", "Works on any device"].map((b) => (
            <span key={b} className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5 text-[#10B981]" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              {b}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Trust Bar ───────────────────────────────────────────────── */

function TrustBar() {
  const stats = [
    { value: "10K+", label: "Elections created" },
    { value: "50K+", label: "Ballots cast" },
    { value: "3", label: "Languages supported" },
    { value: "99.9%", label: "Uptime" },
  ];
  return (
    <section className="border-b border-slate-200 bg-white py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-2xl font-bold text-[#1E3A8A] sm:text-3xl">{s.value}</p>
              <p className="mt-1 text-xs text-slate-500 sm:text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Features ────────────────────────────────────────────────── */

const FEATURES = [
  {
    icon: "🗳️",
    title: "Election Templates",
    description: "Start fast with 8 pre-built templates — AGMs, student elections, board votes, church leadership, community polls and more. One click pre-fills the entire form.",
  },
  {
    icon: "🔢",
    title: "Flexible Voting Types",
    description: "Single choice, multiple choice, and ranked choice — pick the format that matches your election. Set a quorum to auto-close once enough votes are in.",
  },
  {
    icon: "👤",
    title: "Rich Candidate Profiles",
    description: "Each candidate gets a photo, position title, party affiliation, and campaign bio displayed on the ballot — just like a real election.",
  },
  {
    icon: "⏱️",
    title: "Live Countdown Timer",
    description: "Voters see a live countdown to the closing time on their ballot. An amber warning banner fires when under 60 minutes remain.",
  },
  {
    icon: "✅",
    title: "Vote Verification",
    description: "Every voter receives a unique confirmation number. They can visit /verify at any time to prove their vote was recorded correctly.",
  },
  {
    icon: "📊",
    title: "Turnout Analytics",
    description: "Track participation with a real-time dashboard — cumulative vote chart, hourly breakdown, turnout ring, and a highlighted winner bar chart.",
  },
  {
    icon: "📄",
    title: "PDF Results Export",
    description: "Download a formatted results report as a PDF — includes turnout summary, candidate breakdown, and bar charts. Ready to file or share officially.",
  },
  {
    icon: "💬",
    title: "WhatsApp Voting",
    description: "Voters can cast their ballot via a WhatsApp chat conversation — no app or browser required. Critical for markets where WhatsApp is the primary channel.",
  },
  {
    icon: "🌍",
    title: "Multi-Language Support",
    description: "The voter-facing ballot auto-detects the browser language and displays in English, French, or Kiswahili. More languages can be added easily.",
  },
  {
    icon: "📱",
    title: "Installable PWA",
    description: "PowerPicker can be installed directly to the home screen on any phone or desktop — no app store required. Works in low-connectivity conditions.",
  },
  {
    icon: "📋",
    title: "Bulk Participant Import",
    description: "Add hundreds of voters at once by pasting a list or uploading a CSV. Each participant gets a unique access code automatically.",
  },
  {
    icon: "🔒",
    title: "Two Access Modes",
    description: "Open link mode for public polls, or invite-only email mode where each voter gets a unique XXXX-XXXX code — preventing duplicate or unauthorised votes.",
  },
];

function Features() {
  return (
    <section id="features" className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-[#3B82F6]">Features</span>
          <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">Everything you need to run a real election</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-500">
            Built for organisations that need more than a simple poll — with the security, transparency, and trust that serious elections require.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <span className="text-3xl">{f.icon}</span>
              <h3 className="mt-3 text-base font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── How It Works ────────────────────────────────────────────── */

const STEPS = [
  {
    step: 1,
    title: "Create your election",
    description: "Pick a template or start from scratch. Set the title, add candidates with photos and bios, choose single/multiple/ranked voting, set a closing date, and optionally configure a quorum.",
  },
  {
    step: 2,
    title: "Invite your voters",
    description: "Share an open link — or switch to invite-only mode and bulk import your voter list via CSV. Each participant gets a unique access code that prevents duplicate votes.",
  },
  {
    step: 3,
    title: "Voters cast their ballot",
    description: "Voters open the link on any device or vote via WhatsApp. They see a live countdown, select their candidate, and receive a confirmation number for their records.",
  },
  {
    step: 4,
    title: "Review results & export",
    description: "Watch turnout in real-time on the analytics dashboard. When voting closes, download a PDF report or export the data — ready for minutes, filings, or announcements.",
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-slate-200 bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-[#3B82F6]">How it works</span>
          <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">From setup to results in four steps</h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-slate-500">No technical expertise needed. Most elections are live within five minutes.</p>
        </div>

        <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <div key={s.step} className="relative">
              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div className="absolute left-6 top-6 hidden h-px w-full bg-slate-200 lg:block" style={{ left: "3rem", width: "calc(100% - 1rem)" }} />
              )}
              <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-[#1E3A8A] text-base font-bold text-white shadow-sm">
                {s.step}
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Feature Deep Dive ───────────────────────────────────────── */

function FeatureDeep() {
  return (
    <section className="bg-[#F9FAFB] py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-20">

        {/* Verify my vote */}
        <div className="grid gap-10 items-center lg:grid-cols-2">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-[#10B981]">Trust feature</span>
            <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">Voters can verify their own vote</h2>
            <p className="mt-4 text-base text-slate-500 leading-relaxed">
              After submitting a ballot, every voter receives a unique confirmation number. They can visit <strong>/verify</strong> at any time — even weeks later — to confirm their vote is in the system and was counted correctly.
            </p>
            <ul className="mt-6 space-y-3">
              {["Confirmation number stored permanently in the database", "Verify page shows election name, vote timestamp, and voter name", "Works with email invite and open link polls"].map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-sm text-slate-600">
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-[#10B981]" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#10B981]/15">
                <svg className="h-5 w-5 text-[#10B981]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Vote Verified</p>
                <p className="text-xs text-slate-500">Your vote was recorded in our system.</p>
              </div>
            </div>
            <dl className="space-y-2 text-sm border-t border-slate-100 pt-4">
              {[["Election", "Student Union President 2026"], ["Voter", "Jane Okonkwo"], ["Voted at", "Mar 28, 2026 · 2:14 PM"], ["Status", "active"]].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <dt className="text-slate-500">{k}</dt>
                  <dd className="font-medium text-slate-800">{v}</dd>
                </div>
              ))}
              <div className="flex justify-between">
                <dt className="text-slate-500">Confirmation #</dt>
                <dd className="font-mono text-xs text-slate-700">5-12-M8K2-3XPQ</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Analytics */}
        <div className="grid gap-10 items-center lg:grid-cols-2">
          <div className="order-2 lg:order-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">Turnout Analytics</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[["248", "Total Votes"], ["82%", "Turnout Rate"], ["54", "Pending"], ["Jane O.", "Leading"]].map(([v, l]) => (
                <div key={l} className="rounded-lg bg-slate-50 border border-slate-100 p-3">
                  <p className="text-lg font-bold text-[#1E3A8A] truncate">{v}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{l}</p>
                </div>
              ))}
            </div>
            {/* Fake bar chart */}
            <div className="mt-5 space-y-2.5">
              {[["Jane Okonkwo", 65, true], ["Kwame Asante", 22, false], ["Fatima Diallo", 13, false]].map(([name, pct, winner]) => (
                <div key={name as string}>
                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span className="font-medium">{name as string}{winner ? " 🏆" : ""}</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100">
                    <div className="h-2 rounded-full" style={{ width: `${pct}%`, backgroundColor: winner ? "#10B981" : "#93C5FD" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <span className="text-sm font-semibold uppercase tracking-wider text-[#3B82F6]">Analytics</span>
            <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">Real-time turnout dashboard</h2>
            <p className="mt-4 text-base text-slate-500 leading-relaxed">
              Monitor participation as it happens. The analytics page shows a live turnout ring, cumulative vote chart, hourly vote breakdown, and per-candidate results — all in one view.
            </p>
            <ul className="mt-6 space-y-3">
              {["Cumulative votes over time area chart", "New votes per hour bar chart", "Turnout % ring with voted vs pending breakdown", "Winner highlighted automatically in emerald"].map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-sm text-slate-600">
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-[#3B82F6]" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* WhatsApp */}
        <div className="grid gap-10 items-center lg:grid-cols-2">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-[#10B981]">Accessibility</span>
            <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">Vote directly from WhatsApp</h2>
            <p className="mt-4 text-base text-slate-500 leading-relaxed">
              Voters in markets where WhatsApp is the primary communication channel can cast their ballot without opening a browser. They simply message the PowerPicker number with their code and selection.
            </p>
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 space-y-3 text-sm">
              <ChatBubble from="system" text="Welcome to PowerPicker! 🗳️ Enter your voting code (XXXX-XXXX) to access your ballot." />
              <ChatBubble from="user" text="AB3K-9PTR" />
              <ChatBubble from="system" text={"✅ Code verified!\n\n*Student Union President 2026*\n\n1. Jane Okonkwo\n2. Kwame Asante\n3. Fatima Diallo\n\nReply with the number of your choice."} />
              <ChatBubble from="user" text="1" />
              <ChatBubble from="system" text={"🎉 Vote recorded!\n\nYou voted for: *Jane Okonkwo*\nConfirmation: `5-12-M8K2-3XPQ`"} />
            </div>
          </div>
          <div>
            <ul className="space-y-4">
              {[
                ["No app or browser required", "Voters message a WhatsApp number — nothing to install or navigate."],
                ["Full vote security", "Codes are validated, double-vote protection is enforced, and a confirmation receipt is returned."],
                ["Powered by Meta Cloud API", "Connect your WhatsApp Business number via three environment variables — no complex integration."],
              ].map(([title, desc]) => (
                <li key={title as string} className="rounded-xl border border-slate-200 bg-white p-5">
                  <p className="text-sm font-semibold text-slate-900">{title as string}</p>
                  <p className="mt-1 text-sm text-slate-500">{desc as string}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </section>
  );
}

function ChatBubble({ from, text }: { from: "system" | "user"; text: string }) {
  return (
    <div className={`flex ${from === "user" ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[80%] rounded-xl px-3 py-2 text-xs leading-relaxed whitespace-pre-line ${
        from === "user" ? "bg-[#DCF8C6] text-slate-800" : "bg-slate-100 text-slate-700"
      }`}>
        {text}
      </div>
    </div>
  );
}

/* ── Use Cases ───────────────────────────────────────────────── */

const USE_CASES = [
  { icon: "🎓", title: "Schools & Universities", description: "Student government elections, class rep votes, faculty committee elections — with invite-only codes so only enrolled students can vote." },
  { icon: "🏛️", title: "AGMs & Board Elections", description: "Elect directors and committee members with legally robust voting — quorum enforcement, PDF minutes, and full vote verification." },
  { icon: "⛪", title: "Religious Organisations", description: "Pastor elections, deacon appointments, congregational votes — with anonymous ballots and a trusted confirmation receipt for every member." },
  { icon: "🏘️", title: "Community Groups", description: "Resident associations, neighbourhood committees, co-operatives — open link polls or email invite depending on your membership setup." },
  { icon: "⚽", title: "Sports Clubs & Teams", description: "Elect captains, vote on fixtures, or poll members about kits and events — simple open link polls with instant results." },
  { icon: "💼", title: "Workplaces & Non-Profits", description: "Gather anonymous staff feedback, run board elections, or decide team priorities — with analytics and PDF export for governance records." },
];

function UseCases() {
  return (
    <section id="use-cases" className="border-t border-slate-200 bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-[#3B82F6]">Use cases</span>
          <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">Built for every kind of election</h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-slate-500">Templates are pre-configured for the most common scenarios — or start from blank and customise everything.</p>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {USE_CASES.map((u) => (
            <div key={u.title} className="rounded-xl border border-slate-200 bg-[#F9FAFB] p-6 hover:border-[#1E3A8A]/30 transition-colors">
              <span className="text-3xl">{u.icon}</span>
              <h3 className="mt-3 text-base font-semibold text-slate-900">{u.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{u.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── FAQ ─────────────────────────────────────────────────────── */

const FAQS = [
  { q: "Is PowerPicker free?", a: "Yes — PowerPicker is free to use. Create elections, invite participants, and view results at no cost." },
  { q: "How do voters access the ballot?", a: "Two modes: open link (anyone with the URL can vote) or invite-only (each voter gets a unique XXXX-XXXX code). Codes prevent duplicates and unauthorised votes." },
  { q: "Can voters remain anonymous?", a: "Yes. Votes are recorded without linking back to the voter's identity. Even the organiser cannot see who voted for what — only the totals." },
  { q: "What is the vote verification feature?", a: "After voting, each participant receives a unique confirmation number. They can visit /verify to check their vote was recorded at any time — building trust in the result." },
  { q: "How does the quorum feature work?", a: "Set a minimum vote count when creating an election. Once that many unique ballots are cast, the poll automatically closes — useful for constitutions that require a quorum to be valid." },
  { q: "Can I add candidate photos and bios?", a: "Yes. Each option on the ballot can have a candidate photo, position title, party name, and a campaign bio. These are displayed on the voter's ballot card." },
  { q: "How does WhatsApp voting work?", a: "Connect a WhatsApp Business number (via Meta Cloud API) and voters can cast their ballot by messaging their code. The bot guides them through the ballot and returns a confirmation." },
  { q: "What languages are supported?", a: "The voter-facing ballot and verification page support English, French, and Kiswahili. The language is auto-detected from the browser and can be changed with one click." },
  { q: "Do voters need an account?", a: "No. Only the organiser needs a PowerPicker account. Voters access the ballot through a link or WhatsApp — no registration required." },
  { q: "Can I export the results?", a: "Yes. Download a formatted PDF report from any poll detail page once votes have been cast. The PDF includes a turnout summary, candidate bar chart, and confirmation details." },
];

function Faq() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section id="faq" className="bg-[#F9FAFB] py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-[#3B82F6]">FAQ</span>
          <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">Frequently asked questions</h2>
        </div>
        <dl className="mt-10 space-y-3">
          {FAQS.map((f, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
              >
                <span className="text-sm font-semibold text-slate-900">{f.q}</span>
                <svg className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open === i ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              {open === i && (
                <dd className="px-5 pb-4 text-sm leading-relaxed text-slate-500 border-t border-slate-100 pt-3">
                  {f.a}
                </dd>
              )}
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/* ── CTA Banner ──────────────────────────────────────────────── */

function CtaBanner() {
  return (
    <section className="bg-[#1E3A8A] py-16 sm:py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
        <h2 className="text-3xl font-bold text-white sm:text-4xl">Ready to run your first election?</h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-blue-200">
          Create an election in under two minutes. No credit card, no setup — just a fair, trusted vote your group can believe in.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/signup"
            className="w-full rounded-lg bg-[#3B82F6] px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-400 sm:w-auto">
            Create a Vote — It&apos;s Free
          </Link>
          <Link href="/verify"
            className="w-full rounded-lg border border-white/30 px-8 py-3.5 text-sm font-semibold text-white hover:bg-white/10 sm:w-auto">
            Verify a vote receipt
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── Footer ──────────────────────────────────────────────────── */

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#3B82F6]">
                <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
                </svg>
              </div>
              <span className="text-base font-bold text-white">PowerPicker</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed">Trusted, transparent voting for every organisation. Built for Africa and the world.</p>
          </div>

          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-300">Product</h5>
            <ul className="mt-3 space-y-2 text-sm">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">How it works</a></li>
              <li><Link href="/verify" className="hover:text-white transition-colors">Verify a vote</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-300">Account</h5>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/signup" className="hover:text-white transition-colors">Sign up</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Log in</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-300">Legal</h5>
            <ul className="mt-3 space-y-2 text-sm">
              <li><a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-800 pt-6 flex flex-col items-center justify-between gap-3 sm:flex-row text-xs">
          <span>&copy; {new Date().getFullYear()} PowerPicker. All rights reserved.</span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" /> All systems operational
          </span>
        </div>
      </div>
    </footer>
  );
}
