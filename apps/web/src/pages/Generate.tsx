import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button, ErrorBanner, PageHeader, Section, StatusBadge } from "../components/ui";
import { api, type Scenario } from "../lib/api";

export function GeneratePage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const versionId = params.get("versionId") ?? "";
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [provider, setProvider] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!versionId) return;
    api
      .scenarios(versionId)
      .then((r) => setScenarios(r.scenarios))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, [versionId]);

  async function generate() {
    setBusy(true);
    setError(null);
    try {
      const r = await api.generate(versionId, 12);
      setProvider(r.provider);
      setScenarios((await api.scenarios(versionId)).scenarios);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setBusy(false);
    }
  }

  async function runAll() {
    setBusy(true);
    try {
      const { testRun } = await api.startRun({
        agentVersionId: versionId,
        kind: "crash",
        filter: { excludeHappyPath: true },
      });
      navigate(`/test-runs/${testRun.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start run");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader
        kicker="Generation"
        title="Generate tests"
        description="Gemini returns structured scenarios when available. If quota is exhausted, the local catalog is used so the run still executes."
        actions={
          <>
            <Button disabled={busy || !versionId} onClick={generate}>
              Generate scenarios
            </Button>
            <Button variant="secondary" disabled={busy || !versionId} onClick={runAll}>
              Run crash suite
            </Button>
          </>
        }
      />
      <ErrorBanner error={error} />
      {provider ? <p className="mb-4 font-mono text-[13px] text-muted">provider {provider}</p> : null}
      {!versionId ? <p className="text-[14px] text-secondary">Select an agent version from Tests or Agent detail.</p> : null}
      <Section title={`${scenarios.length} scenarios`}>
        <div className="max-h-[640px] space-y-4 overflow-auto">
          {scenarios.map((s) => (
            <div key={s.id} className="border-b border-line pb-4 last:border-0">
              <div className="mb-2 flex flex-wrap gap-2">
                <StatusBadge status={s.category} />
                <span className="font-mono text-[12px] text-muted">{s.source}</span>
              </div>
              <div className="text-[14px] leading-6">{s.prompt}</div>
              <div className="mt-2 text-[13px] text-secondary">Expected: {s.expectedBehavior}</div>
            </div>
          ))}
        </div>
      </Section>
      <p className="mt-4">
        <Link to="/tests" className="text-[14px] font-medium text-secondary hover:text-ink">
          Open test catalog
        </Link>
      </p>
    </div>
  );
}
