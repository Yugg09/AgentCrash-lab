import type { ReactNode } from "react";
import { Link } from "react-router-dom";

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
    <header className="mb-8 flex flex-wrap items-start justify-between gap-6">
      <div className="min-w-0 max-w-2xl">
        {kicker ? <p className="mb-2 text-[13px] font-medium text-secondary">{kicker}</p> : null}
        <h1 className="text-[32px] font-bold leading-[1.15] tracking-[-0.03em] text-ink sm:text-[36px]">{title}</h1>
        {description ? <div className="mt-3 text-[15px] leading-7 text-secondary">{description}</div> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
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
      ? "bg-ink text-white hover:bg-black"
      : variant === "danger"
        ? "border border-crit/20 bg-white text-crit hover:bg-red-50"
        : "border border-line bg-white text-ink hover:bg-elevate";
  const shared = `inline-flex h-9 items-center rounded-lg px-4 text-[14px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${cls}`;
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
    neutral: "border-line bg-elevate text-secondary",
    ok: "border-emerald-200 bg-emerald-50 text-ok",
    warn: "border-amber-200 bg-amber-50 text-warn",
    crit: "border-red-200 bg-red-50 text-crit",
  };
  return (
    <span className={`inline-flex h-5 items-center rounded-md border px-2 text-[11px] font-medium leading-none ${map[tone]}`}>
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
  return <span className={`font-mono text-[13px] text-secondary ${className}`}>{children}</span>;
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
    <section className="overflow-hidden rounded-lg border border-line bg-surface shadow-card">
      <header className="flex min-h-12 items-center justify-between border-b border-line px-4 py-3">
        <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
        {action}
      </header>
      <div className={padded ? "p-4" : ""}>{children}</div>
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
  const color = tone === "ok" ? "text-ok" : tone === "crit" ? "text-crit" : tone === "warn" ? "text-warn" : "text-ink";
  return (
    <div className="rounded-lg border border-line bg-surface p-4 shadow-card">
      <div className="text-[13px] font-medium text-secondary">{label}</div>
      <div className={`mt-2 text-[28px] font-bold leading-none tracking-[-0.02em] tabular-nums ${color}`}>{value}</div>
      {hint ? <div className="mt-2 text-[13px] text-muted">{hint}</div> : null}
    </div>
  );
}

export function MetricRow({ children }: { children: ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">{children}</div>;
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
    <label className="inline-flex items-center gap-2 text-[13px] font-medium text-secondary">
      {label}
      <select
        className="h-9 rounded-lg border border-line bg-white px-3 text-[14px] text-ink"
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
    <label className="block text-[13px] font-medium text-secondary">
      {label}
      <input
        className="mt-1.5 h-9 w-full rounded-lg border border-line bg-white px-3 text-[14px] text-ink placeholder:text-muted"
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
    <div role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-crit">
      {error}
    </div>
  );
}

export function EmptyState({ title, body }: { title: string; body?: string }) {
  return (
    <div className="px-4 py-12 text-center">
      <div className="text-[15px] font-medium text-ink">{title}</div>
      {body ? <p className="mx-auto mt-2 max-w-md text-[14px] text-secondary">{body}</p> : null}
    </div>
  );
}

export function Loading({ label = "Loading…" }: { label?: string }) {
  return <p className="text-[14px] text-secondary">{label}</p>;
}

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-left text-[14px]">{children}</table>
    </div>
  );
}

export function Th({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <th className={`border-b border-line bg-elevate/60 px-4 py-3 text-left text-[12px] font-semibold text-secondary ${className}`}>
      {children}
    </th>
  );
}

export function Td({ children, className = "", mono = false }: { children: ReactNode; className?: string; mono?: boolean }) {
  return (
    <td className={`border-b border-line px-4 py-3.5 align-middle ${mono ? "font-mono text-[13px] text-secondary" : "text-ink"} ${className}`}>
      {children}
    </td>
  );
}

export const chartTooltip = {
  background: "#FFFFFF",
  border: "1px solid #E8E8E6",
  borderRadius: 8,
  fontSize: 13,
  color: "#111111",
  boxShadow: "0 4px 12px rgba(17,17,17,0.08)",
};

export const chartGrid = "#E8E8E6";
export const chartAxis = "#9A9A9A";
