import { useEffect, useState } from "react";
import { DetailRow, PageHeader, Section } from "../components/ui";
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
        {error ? <p className="text-body-sm text-error">{error}</p> : null}
        {health ? (
          <dl className="grid gap-md sm:grid-cols-2">
            <div className="rounded-lg border border-hairline bg-surface-soft p-md">
              <DetailRow k="Status" v={health.ok ? "ok" : "degraded"} />
            </div>
            <div className="rounded-lg border border-hairline bg-surface-soft p-md">
              <DetailRow k="LLM provider" v={health.llm.activeProvider} mono />
            </div>
            <div className="rounded-lg border border-hairline bg-surface-soft p-md">
              <DetailRow k="Gemini configured" v={health.llm.geminiConfigured ? "yes" : "no"} />
            </div>
            <div className="rounded-lg border border-hairline bg-surface-soft p-md">
              <DetailRow k="Using fallback" v={health.llm.usedFallback ? "yes" : "no"} />
            </div>
          </dl>
        ) : (
          <p className="text-body-sm text-body">Checking…</p>
        )}
      </Section>
      <p className="mt-lg text-caption text-muted">Sandbox tools only. No real refunds, email, or host commands.</p>
    </div>
  );
}
