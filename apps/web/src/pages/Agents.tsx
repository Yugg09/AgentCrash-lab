import { useEffect, useState } from "react";
import { EmptyState, ErrorBanner, FeatureCard, Loading, PageHeader, StatusBadge } from "../components/ui";
import { api, type AgentDetail, type ReliabilityResponse, type TestRun } from "../lib/api";
import { formatTime } from "../lib/format";

interface AgentRow {
  agent: AgentDetail;
  reliability: ReliabilityResponse | null;
  lastRun: TestRun | null;
}

export function AgentsPage() {
  const [rows, setRows] = useState<AgentRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { agents } = await api.agents();
        const detailed = await Promise.all(
          agents.map(async (agent) => {
            const [detail, reliability, runs] = await Promise.all([
              api.agent(agent.id),
              api.reliability(agent.id, agent.versions[0]?.id).catch(() => null),
              api.testRuns(agent.id).catch(() => ({ testRuns: [] as TestRun[] })),
            ]);
            return { agent: detail.agent, reliability, lastRun: runs.testRuns[0] ?? null };
          }),
        );
        setRows(detailed);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load agents");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Loading label="Loading agents…" />;

  return (
    <div>
      <PageHeader
        kicker="Registry"
        title="Agents"
        description="Registered agents, versions, and reliability from the latest completed runs."
      />
      <ErrorBanner error={error} />
      {rows.length === 0 ? (
        <EmptyState title="No agents" body="Seed the demo agent or create one via the API." />
      ) : (
        <div className="space-y-md">
          {rows.map(({ agent, reliability, lastRun }) => (
            <FeatureCard key={agent.id} to={`/agents/${agent.id}`}>
              <div className="flex flex-wrap items-start justify-between gap-md">
                <div>
                  <div className="font-display text-title-md text-ink">{agent.name}</div>
                  <p className="mt-xs max-w-2xl text-body-sm leading-relaxed text-body">{agent.description}</p>
                </div>
                <div className="text-right">
                  <div className="font-display text-display-sm tabular-nums leading-none text-ink">
                    {reliability?.reliability ? `${reliability.reliability.overall}%` : "—"}
                  </div>
                  <div className="mt-xxs text-caption text-muted">reliability</div>
                </div>
              </div>
              <div className="mt-md flex flex-wrap gap-xs">
                {agent.versions.map((v) => (
                  <span
                    key={v.id}
                    className="inline-flex items-center gap-xs rounded-pill border border-hairline bg-surface-2 px-sm py-xxs"
                  >
                    <span className="font-mono text-code">{v.version}</span>
                    <StatusBadge status={v.configuration.policy ?? "unknown"} />
                  </span>
                ))}
              </div>
              <div className="mt-md flex flex-wrap gap-lg text-caption text-muted-soft">
                <span>{agent.versions.length} versions</span>
                {lastRun ? (
                  <span>
                    Last run {lastRun.kind} · {lastRun.status} · {formatTime(lastRun.createdAt)}
                  </span>
                ) : (
                  <span>No runs yet</span>
                )}
                {reliability?.reliability ? (
                  <span>
                    {reliability.reliability.total} tests · {reliability.reliability.critical} critical
                  </span>
                ) : null}
              </div>
            </FeatureCard>
          ))}
        </div>
      )}
    </div>
  );
}
