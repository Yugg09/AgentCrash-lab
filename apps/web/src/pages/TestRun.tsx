import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  EmptyState,
  Loading,
  Metric,
  MetricRow,
  PageHeader,
  Section,
  SeverityBadge,
  StatusBadge,
  Table,
  Td,
  Th,
} from "../components/ui";
import { api, type TestRunDetail } from "../lib/api";
import { formatDuration, formatTime, shortId } from "../lib/format";

export function TestRunPage() {
  const { id } = useParams();
  const [run, setRun] = useState<TestRunDetail | null>(null);

  useEffect(() => {
    if (!id) return;
    let timer: number | undefined;
    const tick = async () => {
      const r = await api.testRun(id);
      setRun(r.testRun);
      if (r.testRun.status === "queued" || r.testRun.status === "running") {
        timer = window.setTimeout(tick, 1200);
      }
    };
    tick().catch(() => undefined);
    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [id]);

  if (!run) return <Loading label="Loading run…" />;

  const critical = run.executions.filter((e) => e.failure?.severity === "CRITICAL").length;

  return (
    <div>
      <PageHeader
        kicker="Run"
        title={run.agentVersion.agent.name}
        description={
          <span className="font-mono text-[14px]">
            {run.agentVersion.version} · {run.kind} · {shortId(run.id)}
          </span>
        }
        actions={<StatusBadge status={run.status} />}
      />

      <MetricRow>
        <Metric label="Tests" value={run.totalScenarios} />
        <Metric label="Passed" value={run.passed} tone="ok" />
        <Metric label="Failed" value={run.failed} tone={run.failed ? "crit" : undefined} />
        <Metric label="Critical" value={critical} tone={critical ? "crit" : "ok"} />
        <Metric label="Duration" value={formatDuration(run.startedAt, run.completedAt)} hint={formatTime(run.startedAt ?? run.createdAt)} />
      </MetricRow>

      <div className="mt-6">
        <Section title="Executions" padded={false}>
          {run.executions.length === 0 ? (
            <EmptyState title="No executions" />
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Scenario</Th>
                  <Th>Category</Th>
                  <Th>Status</Th>
                  <Th>Failure</Th>
                  <Th>Score</Th>
                </tr>
              </thead>
              <tbody>
                {run.executions.map((ex) => (
                  <tr key={ex.id} className="transition-colors hover:bg-elevate/50">
                    <Td className="max-w-[420px]">
                      <Link to={`/executions/${ex.id}`} className="font-medium hover:underline">
                        {ex.scenario.prompt}
                      </Link>
                    </Td>
                    <Td mono>{ex.scenario.category}</Td>
                    <Td>
                      <StatusBadge status={ex.status} />
                    </Td>
                    <Td>
                      {ex.failure ? (
                        <Link to={`/failures/${ex.failure.id}`} className="inline-flex items-center gap-2 hover:underline">
                          <SeverityBadge severity={ex.failure.severity} />
                          {ex.failure.title}
                        </Link>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </Td>
                    <Td mono>{ex.evaluation ? ex.evaluation.overallScore : "—"}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Section>
      </div>
    </div>
  );
}
