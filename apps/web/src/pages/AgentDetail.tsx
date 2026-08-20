import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Button,
  ErrorBanner,
  Loading,
  PageHeader,
  Section,
  StatusBadge,
  Table,
  Td,
  Th,
} from "../components/ui";
import { api, type AgentDetail, type TestRun } from "../lib/api";
import { formatTime, shortId } from "../lib/format";

export function AgentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [agent, setAgent] = useState<AgentDetail | null>(null);
  const [runs, setRuns] = useState<TestRun[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [versionId, setVersionId] = useState("");

  async function load() {
    if (!id) return;
    const [{ agent: a }, r] = await Promise.all([api.agent(id), api.testRuns(id)]);
    setAgent(a);
    setRuns(r.testRuns);
    setVersionId((cur) => cur || a.versions[0]?.id || "");
  }

  useEffect(() => {
    load().catch((e) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, [id]);

  const version = agent?.versions.find((v) => v.id === versionId) ?? agent?.versions[0];

  async function runCrash() {
    if (!version) return;
    setBusy(true);
    setError(null);
    try {
      const { testRun } = await api.startRun({
        agentVersionId: version.id,
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

  async function runDeveloper() {
    if (!version) return;
    setBusy(true);
    try {
      const { testRun } = await api.startRun({
        agentVersionId: version.id,
        kind: "developer",
        filter: { sources: ["seed_happy"] },
      });
      navigate(`/test-runs/${testRun.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start run");
    } finally {
      setBusy(false);
    }
  }

  if (!agent || !version) return <Loading label="Loading agent…" />;

  return (
    <div>
      <PageHeader
        kicker="Agent"
        title={agent.name}
        description={agent.description}
        actions={
          <>
            <select
              className="h-9 rounded-lg border border-line bg-white px-3 font-mono text-[13px]"
              value={version.id}
              onChange={(e) => setVersionId(e.target.value)}
            >
              {agent.versions.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.version} · {v.configuration.policy}
                </option>
              ))}
            </select>
            <Button variant="secondary" to={`/agents/${agent.id}/generate?versionId=${version.id}`}>
              Generate tests
            </Button>
            <Button variant="secondary" to={`/agents/${agent.id}/analytics?versionId=${version.id}`}>
              Analytics
            </Button>
            <Button variant="secondary" to={`/agents/${agent.id}/regressions`}>
              Compare versions
            </Button>
          </>
        }
      />
      <ErrorBanner error={error} />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Button disabled={busy} onClick={runCrash}>
          Run crash tests
        </Button>
        <Button variant="secondary" disabled={busy} onClick={runDeveloper}>
          Re-run developer suite
        </Button>
        <StatusBadge status={version.configuration.policy ?? "unknown"} />
        <span className="font-mono text-[13px] text-muted">
          {version._count.scenarios} tests · {version._count.testRuns} runs
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Tools" padded={false}>
          <Table>
            <thead>
              <tr>
                <Th>Name</Th>
                <Th>Risk</Th>
                <Th>Description</Th>
              </tr>
            </thead>
            <tbody>
              {version.tools.map((t) => (
                <tr key={t.id}>
                  <Td mono>{t.name}()</Td>
                  <Td>
                    <StatusBadge status={t.riskLevel} />
                  </Td>
                  <Td className="text-secondary">{t.description}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Section>
        <Section title="Safety rules">
          <ol className="list-decimal space-y-3 pl-5 text-[14px] leading-6 text-secondary">
            {version.safetyRules.map((r) => (
              <li key={r.id}>
                <span className="text-ink">{r.rule}</span> <StatusBadge status={r.severity} />
              </li>
            ))}
          </ol>
        </Section>
      </div>

      <div className="mt-6">
        <Section title="System prompt">
          <pre className="whitespace-pre-wrap rounded-lg bg-elevate p-4 font-mono text-[13px] leading-6 text-secondary">
            {version.systemPrompt}
          </pre>
        </Section>
      </div>

      <div className="mt-6">
        <Section title="Recent runs" padded={false}>
          <Table>
            <thead>
              <tr>
                <Th>Run</Th>
                <Th>Kind</Th>
                <Th>Result</Th>
                <Th>Status</Th>
                <Th>Started</Th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => (
                <tr key={run.id} className="transition-colors hover:bg-elevate/50">
                  <Td mono>
                    <Link to={`/test-runs/${run.id}`} className="font-medium hover:underline">
                      {shortId(run.id)}
                    </Link>
                  </Td>
                  <Td mono>{run.kind}</Td>
                  <Td mono>
                    {run.passed}/{run.totalScenarios}
                  </Td>
                  <Td>
                    <StatusBadge status={run.status} />
                  </Td>
                  <Td className="text-secondary">{formatTime(run.startedAt ?? run.createdAt)}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Section>
      </div>
    </div>
  );
}
