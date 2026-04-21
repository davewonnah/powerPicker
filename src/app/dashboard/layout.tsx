"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getStoredUser, clearAuth, isLoggedIn } from "@/lib/auth";
import type { StoredUser } from "@/lib/auth";

const mainNav = [
  { label: "Overview", href: "/dashboard", icon: HomeIcon },
  { label: "My Polls", href: "/dashboard/votes", icon: BallotIcon },
  { label: "Create Poll", href: "/dashboard/create", icon: PlusCircleIcon },
];

const adminNav = [
  { label: "Users", href: "/dashboard/users", icon: UsersIcon },
];

const bottomNav = [
  { label: "Settings", href: "/dashboard/settings", icon: SettingsIcon },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/login");
      return;
    }
    setUser(getStoredUser());
  }, [router]);

  function handleLogout() {
    clearAuth();
    router.push("/login");
  }

  function isActive(href: string) {
    return href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href);
  }

  const initials = user ? user.username.slice(0, 2).toUpperCase() : "??";

  return (
    <div className="flex min-h-screen bg-[#f0f2f8]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-64 flex-col transition-transform duration-300 lg:sticky lg:top-0 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          background: "linear-gradient(160deg, #0f1e45 0%, #162454 60%, #1a2d63 100%)",
        }}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg shadow-blue-900/40">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
              </svg>
            </div>
            <span className="text-[15px] font-bold text-white tracking-tight">PowerPicker</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-white/40 hover:text-white lg:hidden"
          >
            <CloseIcon />
          </button>
        </div>

        {/* New Poll CTA */}
        <div className="px-4 pb-4 pt-1">
          <Link
            href="/dashboard/create"
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-900/40 transition-all hover:bg-blue-400 hover:shadow-lg hover:shadow-blue-900/30 active:scale-[0.98]"
          >
            <svg className="h-4 w-4 transition-transform group-hover:rotate-90 duration-200" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Poll
          </Link>
        </div>

        {/* Divider */}
        <div className="mx-4 mb-3 border-t border-white/[0.07]" />

        {/* Main nav */}
        <nav className="flex-1 px-3 space-y-0.5">
          <p className="mb-2.5 px-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-white/30">
            Menu
          </p>
          {mainNav.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-white/50 hover:bg-white/[0.06] hover:text-white/80"
                }`}
              >
                {/* Active left accent */}
                {active && (
                  <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-blue-400" />
                )}
                <item.icon active={active} />
                <span>{item.label}</span>
                {active && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-400" />
                )}
              </Link>
            );
          })}

          {/* Admin section – only visible to super_admin */}
          {user?.role === "super_admin" && (
            <>
              <p className="mb-2.5 mt-6 px-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-white/30">
                Admin
              </p>
              {adminNav.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                      active
                        ? "bg-white/10 text-white"
                        : "text-white/50 hover:bg-white/[0.06] hover:text-white/80"
                    }`}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-blue-400" />
                    )}
                    <item.icon active={active} />
                    <span>{item.label}</span>
                    {active && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-400" />
                    )}
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {/* Bottom nav */}
        <div className="px-3 pb-2">
          <div className="border-t border-white/[0.07] pt-3 space-y-0.5">
            {bottomNav.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                    active
                      ? "bg-white/10 text-white"
                      : "text-white/50 hover:bg-white/[0.06] hover:text-white/80"
                  }`}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-blue-400" />
                  )}
                  <item.icon active={active} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* User profile */}
        <div className="mx-3 mb-4 rounded-xl bg-white/[0.06] p-3 border border-white/[0.07]">
          <div className="flex items-center gap-3">
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-xs font-bold text-white shadow-md">
              {initials}
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#162454] bg-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-[13px] font-semibold text-white leading-tight">
                {user?.username ?? "—"}
              </p>
              <p className="truncate text-[11px] text-white/40 leading-tight mt-0.5">
                {user?.email ?? "—"}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/30 transition-colors hover:bg-white/10 hover:text-white/80"
              title="Log out"
            >
              <LogoutIcon />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-slate-200/70 bg-white/80 px-6 backdrop-blur-md">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 lg:hidden"
          >
            <MenuIcon />
          </button>
          <div className="flex-1" />
          <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700">
            <BellIcon />
          </button>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

/* ── Icons ─────────────────────────────────────────────────── */

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg className={`h-[18px] w-[18px] shrink-0 ${active ? "text-blue-400" : "text-current"}`} fill="none" viewBox="0 0 24 24" strokeWidth={active ? 2 : 1.75} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955a1.126 1.126 0 0 1 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  );
}

function BallotIcon({ active }: { active: boolean }) {
  return (
    <svg className={`h-[18px] w-[18px] shrink-0 ${active ? "text-blue-400" : "text-current"}`} fill="none" viewBox="0 0 24 24" strokeWidth={active ? 2 : 1.75} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15a2.25 2.25 0 0 1 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
    </svg>
  );
}

function PlusCircleIcon({ active }: { active: boolean }) {
  return (
    <svg className={`h-[18px] w-[18px] shrink-0 ${active ? "text-blue-400" : "text-current"}`} fill="none" viewBox="0 0 24 24" strokeWidth={active ? 2 : 1.75} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

function UsersIcon({ active }: { active: boolean }) {
  return (
    <svg className={`h-[18px] w-[18px] shrink-0 ${active ? "text-blue-400" : "text-current"}`} fill="none" viewBox="0 0 24 24" strokeWidth={active ? 2 : 1.75} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
    </svg>
  );
}

function SettingsIcon({ active }: { active: boolean }) {
  return (
    <svg className={`h-[18px] w-[18px] shrink-0 ${active ? "text-blue-400" : "text-current"}`} fill="none" viewBox="0 0 24 24" strokeWidth={active ? 2 : 1.75} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
    </svg>
  );
}
