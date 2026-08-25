import { useEffect, useState } from "react";
import { EmptyState, ErrorBanner, InlineLink, Loading, PageHeader, Section, StatusBadge, Table, Td, Th, tableRowHover } from "../components/ui";
import { api, type AgentSummary, type TestRun } from "../lib/api";
import { formatDuration, formatTime, shortId } from "../lib/format";

export function RunsPage() {
  const [runs, setRuns] = useState<TestRun[]>([]);
  const [agents, setAgents] = useState<AgentSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.testRuns(), api.agents()])
      .then(([r, a]) => {
        setRuns(r.testRuns);
        setAgents(a.agents);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load runs"))
      .finally(() => setLoading(false));
  }, []);

  const nameById = new Map(agents.map((a) => [a.id, a.name]));

  if (loading) return <Loading label="Loading runs…" />;

  return (
    <div>
      <PageHeader
        kicker="Execution"
        title="Runs"
        description="Queued and completed evaluation jobs. Open a run for per-scenario execution detail."
      />
      <ErrorBanner error={error} />
      <Section title={`${runs.length} recent runs`} padded={false}>
        {runs.length === 0 ? (
          <EmptyState title="No runs yet" body="Start a crash suite from an agent or the Tests page." />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Run ID</Th>
                <Th>Agent</Th>
                <Th>Version</Th>
                <Th>Kind</Th>
                <Th>Tests</Th>
                <Th>Passed</Th>
                <Th>Failed</Th>
                <Th>Duration</Th>
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
                  <Td>{nameById.get(run.agentVersion?.agentId ?? "") ?? "—"}</Td>
                  <Td mono>{run.agentVersion?.version ?? "—"}</Td>
                  <Td mono>{run.kind}</Td>
                  <Td mono>{run.totalScenarios}</Td>
                  <Td mono className="text-success">
                    {run.passed}
                  </Td>
                  <Td mono className={run.failed ? "text-error" : ""}>
                    {run.failed}
                  </Td>
                  <Td mono>{formatDuration(run.startedAt, run.completedAt)}</Td>
                  <Td>
                    <StatusBadge status={run.status} />
                  </Td>
                  <Td className="text-muted">{formatTime(run.startedAt ?? run.createdAt)}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Section>
    </div>
  );
}
