import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState, ErrorBanner, Loading, PageHeader, StatusBadge } from "../components/ui";
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
        <div className="space-y-4">
          {rows.map(({ agent, reliability, lastRun }) => (
            <Link
              key={agent.id}
              to={`/agents/${agent.id}`}
              className="block rounded-lg border border-line bg-white p-5 shadow-card transition-colors hover:border-ink/20"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-[18px] font-semibold tracking-[-0.02em]">{agent.name}</div>
                  <p className="mt-2 max-w-2xl text-[14px] leading-6 text-secondary">{agent.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-[32px] font-bold leading-none tabular-nums tracking-[-0.03em]">
                    {reliability?.reliability ? `${reliability.reliability.overall}%` : "—"}
                  </div>
                  <div className="mt-1 text-[13px] text-muted">reliability</div>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {agent.versions.map((v) => (
                  <span key={v.id} className="inline-flex items-center gap-2 rounded-lg border border-line bg-elevate px-3 py-1.5">
                    <span className="font-mono text-[13px] font-medium">{v.version}</span>
                    <StatusBadge status={v.configuration.policy ?? "unknown"} />
                  </span>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-5 text-[13px] text-muted">
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
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
