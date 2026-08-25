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
      <aside className="hidden w-[240px] shrink-0 flex-col border-r border-hairline bg-canvas md:flex">
        <Sidebar health={health} />
      </aside>

      {open ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button className="absolute inset-0 bg-ink/20" aria-label="Close navigation" onClick={() => setOpen(false)} />
          <aside className="relative z-50 flex h-full w-[240px] flex-col border-r border-hairline bg-canvas shadow-hover">
            <Sidebar health={health} onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-16 items-center justify-between border-b border-hairline bg-canvas px-md md:hidden">
          <button className="text-nav text-ink" onClick={() => setOpen(true)}>
            Menu
          </button>
          <span className="font-display text-title-sm text-ink">AgentCrashLab</span>
          <span className="w-10" />
        </div>
        <main className="flex-1 overflow-x-hidden px-md py-xl sm:px-lg lg:px-xl">
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
      <div className="border-b border-hairline px-lg py-lg">
        <div className="font-display text-title-lg text-ink">AgentCrashLab</div>
        <p className="mt-xxs text-caption text-muted">AI agent reliability infrastructure</p>
      </div>
      <nav className="flex-1 px-sm py-md">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `mb-xxs flex h-10 items-center rounded-md px-sm text-nav transition-colors ${
                isActive
                  ? "border-l-2 border-primary bg-surface-card pl-[calc(var(--spacing-sm)-2px)] text-ink"
                  : "text-muted hover:bg-surface-soft hover:text-ink"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-hairline px-lg py-md">
        <NavLink
          to="/settings"
          onClick={onNavigate}
          className={({ isActive }) => `block text-nav ${isActive ? "text-ink" : "text-muted hover:text-ink"}`}
        >
          Settings
        </NavLink>
        <p className="mt-sm text-caption text-muted-soft">
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
