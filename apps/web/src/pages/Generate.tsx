import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button, ErrorBanner, PageHeader, Section, StatusBadge, TextLink } from "../components/ui";
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
      {provider ? <p className="mb-md font-mono text-code text-muted">provider {provider}</p> : null}
      {!versionId ? <p className="text-body-sm text-body">Select an agent version from Tests or Agent detail.</p> : null}
      <Section title={`${scenarios.length} scenarios`}>
        <div className="max-h-[640px] space-y-md overflow-auto">
          {scenarios.map((s) => (
            <div key={s.id} className="border-b border-hairline pb-md last:border-0">
              <div className="mb-xs flex flex-wrap gap-xs">
                <StatusBadge status={s.category} />
                <span className="font-mono text-code text-muted">{s.source}</span>
              </div>
              <div className="text-body-sm leading-relaxed text-ink">{s.prompt}</div>
              <div className="mt-xs text-body-sm text-body">Expected: {s.expectedBehavior}</div>
            </div>
          ))}
        </div>
      </Section>
      <p className="mt-md">
        <TextLink to="/tests">Open test catalog</TextLink>
      </p>
    </div>
  );
}
