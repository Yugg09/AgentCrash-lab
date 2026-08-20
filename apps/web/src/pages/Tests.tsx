import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  EmptyState,
  ErrorBanner,
  Input,
  Loading,
  PageHeader,
  Section,
  Select,
  StatusBadge,
  Table,
  Td,
  Th,
} from "../components/ui";
import { api, type AgentSummary, type Scenario } from "../lib/api";

export function TestsPage() {
  const navigate = useNavigate();
  const [agents, setAgents] = useState<AgentSummary[]>([]);
  const [agentId, setAgentId] = useState("");
  const [versionId, setVersionId] = useState("");
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("ALL");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [provider, setProvider] = useState("");
  const [loading, setLoading] = useState(true);

  const agent = agents.find((a) => a.id === agentId);
  const versions = agent?.versions ?? [];

  useEffect(() => {
    api
      .agents()
      .then((r) => {
        setAgents(r.agents);
        const first = r.agents[0];
        if (first) {
          setAgentId(first.id);
          setVersionId(first.versions[0]?.id ?? "");
        }
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!versionId) return;
    api
      .scenarios(versionId)
      .then((r) => setScenarios(r.scenarios))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load tests"));
  }, [versionId]);

  const counts = useMemo(() => {
    const c = { happy: 0, adversarial: 0, generated: 0, mutation: 0 };
    for (const s of scenarios) {
      if (s.source === "seed_happy") c.happy += 1;
      else if (s.source === "seed_adversarial") c.adversarial += 1;
      else if (s.source === "generated") c.generated += 1;
      else if (s.source === "mutation") c.mutation += 1;
    }
    return c;
  }, [scenarios]);

  const filtered = scenarios.filter((s) => {
    if (sourceFilter !== "ALL" && s.source !== sourceFilter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return s.prompt.toLowerCase().includes(q) || s.category.toLowerCase().includes(q) || s.source.toLowerCase().includes(q);
  });

  async function generate() {
    if (!versionId) return;
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

  async function runCrash() {
    if (!versionId) return;
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

  if (loading) return <Loading label="Loading tests…" />;

  return (
    <div>
      <PageHeader
        kicker="Test catalog"
        title="Tests"
        description="Adversarial and happy-path scenarios for AI agent reliability testing."
        actions={
          <>
            <Button disabled={busy || !versionId} onClick={generate}>
              Generate tests
            </Button>
            <Button variant="secondary" disabled={busy || !versionId} onClick={runCrash}>
              Run crash suite
            </Button>
          </>
        }
      />
      <ErrorBanner error={error} />

      <div className="mb-6 grid gap-4 rounded-lg border border-line bg-white p-4 shadow-card lg:grid-cols-[1fr_auto_auto_auto] lg:items-end">
        <Input label="Search scenarios" value={search} onChange={setSearch} placeholder="Filter by prompt, category, or source" />
        <Select label="Agent" value={agentId} onChange={(v) => {
          setAgentId(v);
          const next = agents.find((a) => a.id === v);
          setVersionId(next?.versions[0]?.id ?? "");
        }}>
          {agents.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </Select>
        <Select label="Version" value={versionId} onChange={setVersionId}>
          {versions.map((v) => (
            <option key={v.id} value={v.id}>
              {v.version}
            </option>
          ))}
        </Select>
        <Select label="Source" value={sourceFilter} onChange={setSourceFilter}>
          <option value="ALL">All sources</option>
          <option value="seed_adversarial">seed_adversarial</option>
          <option value="seed_happy">seed_happy</option>
          <option value="generated">generated</option>
          <option value="mutation">mutation</option>
        </Select>
      </div>

      <p className="mb-4 text-[13px] text-muted">
        {counts.adversarial} adversarial · {counts.happy} developer · {counts.generated} generated · {counts.mutation}{" "}
        mutations
        {provider ? ` · provider ${provider}` : ""}
      </p>

      <Section title={`${filtered.length} scenarios`} padded={false}>
        {filtered.length === 0 ? (
          <EmptyState title="No scenarios match these filters" />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Scenario</Th>
                <Th>Category</Th>
                <Th>Source</Th>
                <Th>Expected behavior</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="transition-colors hover:bg-elevate/50">
                  <Td className="max-w-[360px]">{s.prompt}</Td>
                  <Td>
                    <StatusBadge status={s.category} />
                  </Td>
                  <Td mono>{s.source}</Td>
                  <Td className="max-w-[300px] text-secondary">{s.expectedBehavior}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Section>
    </div>
  );
}
