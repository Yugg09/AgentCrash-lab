import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Button,
  CodeWindow,
  ErrorBanner,
  InlineLink,
  Loading,
  NativeSelect,
  PageHeader,
  Section,
  StatusBadge,
  Table,
  Td,
  Th,
  tableRowHover,
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
            <NativeSelect value={version.id} onChange={setVersionId}>
              {agent.versions.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.version} · {v.configuration.policy}
                </option>
              ))}
            </NativeSelect>
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

      <div className="mb-lg flex flex-wrap items-center gap-sm">
        <Button disabled={busy} onClick={runCrash}>
          Run crash tests
        </Button>
        <Button variant="secondary" disabled={busy} onClick={runDeveloper}>
          Re-run developer suite
        </Button>
        <StatusBadge status={version.configuration.policy ?? "unknown"} />
        <span className="font-mono text-code text-muted">
          {version._count.scenarios} tests · {version._count.testRuns} runs
        </span>
      </div>

      <div className="grid gap-lg lg:grid-cols-2">
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
                  <Td className="text-body">{t.description}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Section>
        <Section title="Safety rules">
          <ol className="list-decimal space-y-sm pl-5 text-body-sm leading-relaxed text-body">
            {version.safetyRules.map((r) => (
              <li key={r.id}>
                <span className="text-ink">{r.rule}</span> <StatusBadge status={r.severity} />
              </li>
            ))}
          </ol>
        </Section>
      </div>

      <div className="mt-lg">
        <Section title="System prompt">
          <CodeWindow>{version.systemPrompt}</CodeWindow>
        </Section>
      </div>

      <div className="mt-lg">
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
                <tr key={run.id} className={tableRowHover}>
                  <Td mono>
                    <InlineLink to={`/test-runs/${run.id}`}>{shortId(run.id)}</InlineLink>
                  </Td>
                  <Td mono>{run.kind}</Td>
                  <Td mono>
                    {run.passed}/{run.totalScenarios}
                  </Td>
                  <Td>
                    <StatusBadge status={run.status} />
                  </Td>
                  <Td className="text-muted">{formatTime(run.startedAt ?? run.createdAt)}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Section>
      </div>
    </div>
  );
}
