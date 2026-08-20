import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { api } from "../lib/api";

const nav = [
  { to: "/", label: "Overview", end: true },
  { to: "/agents", label: "Agents" },
  { to: "/tests", label: "Tests" },
  { to: "/runs", label: "Runs" },
  { to: "/failures", label: "Failures" },
];

export function AppShell() {
  const [open, setOpen] = useState(false);
  const [health, setHealth] = useState<{ activeProvider: string; geminiConfigured: boolean; usedFallback: boolean } | null>(null);

  useEffect(() => {
    api
      .health()
      .then((h) => setHealth(h.llm))
      .catch(() => setHealth(null));
  }, []);

  return (
    <div className="flex min-h-screen bg-canvas">
      <aside className="hidden w-[240px] shrink-0 flex-col border-r border-line bg-white md:flex">
        <Sidebar health={health} />
      </aside>

      {open ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button className="absolute inset-0 bg-black/20" aria-label="Close navigation" onClick={() => setOpen(false)} />
          <aside className="relative z-50 flex h-full w-[240px] flex-col border-r border-line bg-white shadow-card">
            <Sidebar health={health} onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-14 items-center justify-between border-b border-line bg-white px-4 md:hidden">
          <button className="text-[14px] font-medium text-ink" onClick={() => setOpen(true)}>
            Menu
          </button>
          <span className="text-[15px] font-bold tracking-[-0.02em]">AgentCrashLab</span>
          <span className="w-10" />
        </div>
        <main className="flex-1 overflow-x-hidden px-4 py-8 sm:px-6 lg:px-10">
          <div className="mx-auto w-full max-w-content">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function Sidebar({
  health,
  onNavigate,
}: {
  health: { activeProvider: string; geminiConfigured: boolean; usedFallback: boolean } | null;
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="border-b border-line px-5 py-6">
        <div className="text-[18px] font-bold tracking-[-0.03em] text-ink">AgentCrashLab</div>
        <p className="mt-1 text-[13px] leading-5 text-secondary">AI agent reliability infrastructure</p>
      </div>
      <nav className="flex-1 px-3 py-4">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `mb-1 flex h-10 items-center rounded-lg px-3 text-[14px] font-medium transition-colors ${
                isActive ? "bg-elevate text-ink" : "text-secondary hover:bg-elevate hover:text-ink"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-line px-5 py-4">
        <NavLink
          to="/settings"
          onClick={onNavigate}
          className={({ isActive }) =>
            `block text-[14px] font-medium ${isActive ? "text-ink" : "text-secondary hover:text-ink"}`
          }
        >
          Settings
        </NavLink>
        <p className="mt-3 text-[12px] leading-5 text-muted">
          {health ? (
            <>
              LLM {health.activeProvider}
              {health.usedFallback ? " · fallback active" : ""}
            </>
          ) : (
            "Sandbox tools only"
          )}
        </p>
      </div>
    </>
  );
}
