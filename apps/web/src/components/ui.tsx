import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { chartTheme } from "../lib/chart-theme";

export function PageHeader({
  kicker,
  title,
  description,
  actions,
}: {
  kicker?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-lg flex flex-wrap items-start justify-between gap-lg">
      <div className="min-w-0 max-w-2xl">
        {kicker ? <p className="mb-xs text-caption-uppercase uppercase text-muted">{kicker}</p> : null}
        <h1 className="font-display text-display-md text-ink sm:text-display-md">{title}</h1>
        {description ? <div className="mt-sm text-body-md text-body">{description}</div> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-xs">{actions}</div> : null}
    </header>
  );
}

export function Button({
  children,
  onClick,
  disabled,
  variant = "primary",
  type = "button",
  to,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
  type?: "button" | "submit";
  to?: string;
}) {
  const cls =
    variant === "primary"
      ? "bg-primary text-on-primary hover:bg-primary-active disabled:bg-primary-disabled disabled:text-muted"
      : variant === "danger"
        ? "border border-error/25 bg-canvas text-error hover:bg-surface-soft"
        : "border border-hairline bg-canvas text-ink hover:bg-surface-soft";
  const shared = `inline-flex h-10 items-center rounded-md px-5 text-button transition-colors disabled:cursor-not-allowed ${cls}`;
  if (to) {
    return (
      <Link to={to} className={shared} aria-disabled={disabled}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} className={shared} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "ok" | "warn" | "crit";
}) {
  const map = {
    neutral: "border-hairline bg-surface-card text-body",
    ok: "border-success/25 bg-surface-soft text-success",
    warn: "border-warning/25 bg-surface-soft text-warning",
    crit: "border-error/25 bg-surface-soft text-error",
  };
  return (
    <span className={`inline-flex h-5 items-center rounded-pill border px-sm text-caption leading-none ${map[tone]}`}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const key = status.toUpperCase();
  const tone =
    key === "COMPLETED" || key === "LOW" || key === "PASSED" || key === "STRICT" || key === "PATCHED"
      ? "ok"
      : key === "RUNNING" || key === "QUEUED" || key === "MEDIUM" || key === "HIGH"
        ? "warn"
        : key === "FAILED" || key === "CRITICAL" || key === "VULNERABLE"
          ? "crit"
          : "neutral";
  return <Badge tone={tone}>{status.replaceAll("_", " ")}</Badge>;
}

export function SeverityBadge({ severity }: { severity: string }) {
  const key = severity.toUpperCase();
  const tone = key === "CRITICAL" ? "crit" : key === "HIGH" || key === "MEDIUM" ? "warn" : "neutral";
  return <Badge tone={tone}>{severity}</Badge>;
}

export function Mono({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`font-mono text-code text-muted ${className}`}>{children}</span>;
}

export function Section({
  title,
  action,
  children,
  padded = true,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  padded?: boolean;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-hairline bg-surface-card">
      <header className="flex min-h-12 items-center justify-between border-b border-hairline px-md py-sm">
        <h2 className="font-display text-title-sm text-ink">{title}</h2>
        {action}
      </header>
      <div className={padded ? "p-md" : ""}>{children}</div>
    </section>
  );
}

export function Metric({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: "ok" | "crit" | "warn";
}) {
  const color =
    tone === "ok" ? "text-success" : tone === "crit" ? "text-error" : tone === "warn" ? "text-warning" : "text-ink";
  return (
    <div className="rounded-lg border border-hairline bg-surface-card p-md">
      <div className="text-caption text-muted">{label}</div>
      <div className={`mt-xs font-display text-display-sm tabular-nums leading-none ${color}`}>{value}</div>
      {hint ? <div className="mt-xs text-caption text-muted-soft">{hint}</div> : null}
    </div>
  );
}

export function MetricRow({ children }: { children: ReactNode }) {
  return <div className="grid gap-sm sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">{children}</div>;
}

export function Select({
  value,
  onChange,
  children,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  label?: string;
}) {
  return (
    <label className="inline-flex items-center gap-xs text-caption text-muted">
      {label}
      <select
        className="h-10 rounded-md border border-hairline bg-canvas px-sm text-body-sm text-ink"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {children}
      </select>
    </label>
  );
}

export function Input({
  value,
  onChange,
  placeholder,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}) {
  return (
    <label className="block text-caption text-muted">
      {label}
      <input
        className="mt-xs h-10 w-full rounded-md border border-hairline bg-canvas px-sm text-body-sm text-ink placeholder:text-muted-soft"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

export function ErrorBanner({ error }: { error: string | null }) {
  if (!error) return null;
  return (
    <div role="alert" className="mb-lg rounded-lg border border-error/25 bg-surface-soft px-md py-sm text-body-sm text-error">
      {error}
    </div>
  );
}

export function EmptyState({ title, body }: { title: string; body?: string }) {
  return (
    <div className="px-md py-xxl text-center">
      <div className="text-title-sm text-ink">{title}</div>
      {body ? <p className="mx-auto mt-xs max-w-md text-body-sm text-body">{body}</p> : null}
    </div>
  );
}

export function Loading({ label = "Loading…" }: { label?: string }) {
  return <p className="text-body-sm text-muted">{label}</p>;
}

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-left text-body-sm">{children}</table>
    </div>
  );
}

export function Th({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <th
      className={`border-b border-hairline bg-surface-soft/80 px-md py-sm text-left text-caption-uppercase uppercase text-muted ${className}`}
    >
      {children}
    </th>
  );
}

export function Td({ children, className = "", mono = false }: { children: ReactNode; className?: string; mono?: boolean }) {
  return (
    <td
      className={`border-b border-hairline px-md py-sm align-middle ${mono ? "font-mono text-code text-muted" : "text-ink"} ${className}`}
    >
      {children}
    </td>
  );
}

/** @deprecated Use chartTheme from lib/chart-theme.ts */
export const chartTooltip = {
  background: chartTheme.tooltip.background,
  border: `1px solid ${chartTheme.tooltip.border}`,
  borderRadius: 8,
  fontSize: 13,
  color: chartTheme.tooltip.color,
  boxShadow: "var(--shadow-hover)",
};

/** @deprecated Use chartTheme from lib/chart-theme.ts */
export const chartGrid = chartTheme.grid;

/** @deprecated Use chartTheme from lib/chart-theme.ts */
export const chartAxis = chartTheme.axis;

/** @deprecated Use chartTheme from lib/chart-theme.ts */
export const chartLine = chartTheme.line;

export function TextLink({
  to,
  children,
  className = "",
}: {
  to: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link to={to} className={`text-body-sm font-medium text-primary hover:text-primary-active ${className}`}>
      {children}
    </Link>
  );
}

export function InlineLink({
  to,
  children,
  className = "",
}: {
  to: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link to={to} className={`font-medium text-ink hover:text-primary ${className}`}>
      {children}
    </Link>
  );
}

export function CodeWindow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-lg bg-surface-dark ${className}`}>
      <pre className="max-h-96 overflow-x-auto whitespace-pre-wrap bg-surface-dark-soft p-lg font-mono text-code leading-relaxed text-on-dark">
        {children}
      </pre>
    </div>
  );
}

export function FeatureCard({
  children,
  className = "",
  to,
}: {
  children: ReactNode;
  className?: string;
  to?: string;
}) {
  const cls = `block rounded-lg border border-hairline bg-surface-card p-lg transition-colors hover:border-primary/30 ${className}`;
  if (to) return <Link to={to} className={cls}>{children}</Link>;
  return <div className={cls}>{children}</div>;
}

export function FilterBar({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`mb-lg flex flex-wrap gap-md rounded-lg border border-hairline bg-surface-soft p-md ${className}`}>
      {children}
    </div>
  );
}

export function ReliabilityHero({
  label,
  value,
  children,
}: {
  label: string;
  value: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="mb-lg rounded-lg border border-hairline bg-surface-card p-lg sm:p-xl">
      <p className="text-caption-uppercase uppercase text-muted">{label}</p>
      <div className="mt-sm flex flex-wrap items-end gap-xl">
        <div className="font-display text-display-lg tabular-nums leading-none text-ink">{value}</div>
        {children ? <div className="space-y-xs pb-xs text-body-sm text-body">{children}</div> : null}
      </div>
    </div>
  );
}

export function DetailRow({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-caption-uppercase uppercase text-muted">{k}</dt>
      <dd className={`mt-xxs leading-relaxed ${mono ? "font-mono text-code text-muted" : "text-body-sm text-ink"}`}>{v}</dd>
    </div>
  );
}

export function DarkSection({
  title,
  action,
  children,
  padded = true,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  padded?: boolean;
}) {
  return (
    <section className="overflow-hidden rounded-lg bg-surface-dark">
      <header className="flex min-h-12 items-center justify-between border-b border-surface-dark-elevated px-md py-sm">
        <h2 className="font-display text-title-sm text-on-dark">{title}</h2>
        {action}
      </header>
      <div className={padded ? "p-md" : ""}>{children}</div>
    </section>
  );
}

export function NativeSelect({
  value,
  onChange,
  children,
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <select
      className={`h-10 rounded-md border border-hairline bg-canvas px-sm font-mono text-code text-ink ${className}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {children}
    </select>
  );
}

export const tableRowHover = "transition-colors hover:bg-surface-soft/80";

export function ProgressBar({
  value,
  critical = false,
}: {
  value: number;
  critical?: boolean;
}) {
  return (
    <div className="h-2 overflow-hidden rounded-pill bg-surface-soft">
      <div
        className={`h-full rounded-pill ${critical ? "bg-error" : "bg-ink/70"}`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
