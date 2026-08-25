import { Link } from "react-router-dom";

export function LandingFooter() {
  return (
    <footer className="border-t border-hairline-soft px-md py-xxl sm:px-lg">
      <div className="mx-auto flex max-w-content flex-col gap-lg sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-title-sm tracking-tight text-ink">AgentCrashLab</p>
          <p className="mt-xs text-caption text-muted">Sandbox tools only · No real refunds or email</p>
        </div>
        <div className="flex flex-wrap gap-lg text-caption text-muted">
          <Link to="/dashboard" className="hover:text-accent">
            Open app
          </Link>
          <a href="https://github.com/Yugg09/AgentCrash-lab" target="_blank" rel="noreferrer" className="hover:text-accent">
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
