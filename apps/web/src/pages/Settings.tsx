import { useEffect, useState } from "react";
import { PageHeader, Section } from "../components/ui";
import { api } from "../lib/api";

export function SettingsPage() {
  const [health, setHealth] = useState<{
    ok: boolean;
    llm: { activeProvider: string; geminiConfigured: boolean; usedFallback: boolean };
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .health()
      .then(setHealth)
      .catch((e) => setError(e instanceof Error ? e.message : "Health check failed"));
  }, []);

  return (
    <div>
      <PageHeader
        kicker="System"
        title="Settings"
        description="Runtime status from the API health endpoint. Secrets are never shown here."
      />
      <Section title="API health">
        {error ? <p className="text-[14px] text-crit">{error}</p> : null}
        {health ? (
          <dl className="grid gap-4 sm:grid-cols-2">
            <Item k="Status" v={health.ok ? "ok" : "degraded"} />
            <Item k="LLM provider" v={health.llm.activeProvider} mono />
            <Item k="Gemini configured" v={health.llm.geminiConfigured ? "yes" : "no"} />
            <Item k="Using fallback" v={health.llm.usedFallback ? "yes" : "no"} />
          </dl>
        ) : (
          <p className="text-[14px] text-secondary">Checking…</p>
        )}
      </Section>
      <p className="mt-6 text-[13px] text-muted">Sandbox tools only. No real refunds, email, or host commands.</p>
    </div>
  );
}

function Item({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="rounded-lg border border-line bg-elevate p-4">
      <dt className="text-[12px] font-medium text-muted">{k}</dt>
      <dd className={`mt-1 text-[14px] ${mono ? "font-mono text-secondary" : "font-medium text-ink"}`}>{v}</dd>
    </div>
  );
}
