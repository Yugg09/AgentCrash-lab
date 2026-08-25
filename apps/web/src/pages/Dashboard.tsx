import { useEffect, useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  Button,
  EmptyState,
  ErrorBanner,
  InlineLink,
  Loading,
  Metric,
  MetricRow,
  PageHeader,
  ProgressBar,
  ReliabilityHero,
  Section,
  SeverityBadge,
  Table,
  Td,
  TextLink,
  Th,
  chartAxis,
  chartGrid,
  chartTooltip,
  tableRowHover,
} from "../components/ui";
import { chartTheme } from "../lib/chart-theme";
import { api, type AgentDetail, type FailureRow, type RegressionResponse, type ReliabilityResponse } from "../lib/api";
import { formatTime, pct, shortId } from "../lib/format";

export function DashboardPage() {
  const [agent, setAgent] = useState<AgentDetail | null>(null);
  const [rel, setRel] = useState<ReliabilityResponse | null>(null);
  const [failures, setFailures] = useState<FailureRow[]>([]);
  const [regression, setRegression] = useState<RegressionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { agents } = await api.agents();
        const first = agents[0];
        if (!first) {
          setLoading(false);
          return;
        }
        const detail = await api.agent(first.id);
        setAgent(detail.agent);
        const versionId = first.versions[0]?.id;
        const [r, f] = await Promise.all([api.reliability(first.id, versionId), api.failures(first.id)]);
        setRel(r);
        setFailures(f.failures);
        if (first.versions.length >= 2) {
          const from = first.versions[0].id;
          const to = first.versions[first.versions.length - 1].id;
          const cmp = await api.regressions(first.id, from, to).catch(() => null);
          setRegression(cmp);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load overview");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const m = rel?.reliability;
  const distTotal = (rel?.failureDistribution ?? []).reduce((s, d) => s + d.count, 0);
  const trend = useMemo(
    () =>
      (rel?.trend ?? []).map((t, i) => ({
        i: i + 1,
        kind: t.kind,
        passRate: t.total ? Math.round((t.passed / t.total) * 1000) / 10 : 0,
      })),
    [rel],
  );
  const prev = rel?.trend && rel.trend.length >= 2 ? rel.trend[rel.trend.length - 2] : null;
  const prevRate = prev && prev.total ? Math.round((prev.passed / prev.total) * 1000) / 10 : null;

  if (loading) return <Loading label="Loading overview…" />;

  return (
    <div>
      <PageHeader
        kicker="Overview"
        title="Dashboard"
        description={
          agent
            ? `${agent.name} — reliability from your latest crash test runs.`
            : "Register an agent and run crash tests to see reliability scores here."
        }
        actions={agent ? <Button to={`/agents/${agent.id}`}>Open agent</Button> : <Button to="/agents">View agents</Button>}
      />
      <ErrorBanner error={error} />

      <ReliabilityHero label="Overall reliability" value={m ? `${m.overall}%` : "—"}>
        {m ? (
          <div>
            {m.passed}/{m.total} tests passed · {m.failed} failed
          </div>
        ) : (
          <div>No completed runs yet</div>
        )}
        {prevRate != null ? <div>Previous run {prevRate}% pass rate</div> : null}
        {m && m.critical > 0 ? (
          <div className="text-error">
            {m.critical} critical {m.critical === 1 ? "failure" : "failures"}
          </div>
        ) : null}
        {regression ? (
          <div>
            {regression.from.version} → {regression.to.version}:{" "}
            {regression.comparison.scoreDelta > 0 ? "+" : ""}
            {regression.comparison.scoreDelta} pts · critical {regression.comparison.oldCritical} →{" "}
            {regression.comparison.newCritical}
          </div>
        ) : null}
      </ReliabilityHero>

      <MetricRow>
        <Metric label="Safety" value={m?.safety ?? "—"} />
        <Metric label="Goal completion" value={m?.goalCompletion ?? "—"} />
        <Metric label="Tool reliability" value={m?.toolReliability ?? "—"} />
        <Metric label="Instruction following" value={m?.instructionFollowing ?? "—"} />
        <Metric label="Recovery" value={m?.recovery ?? "—"} />
      </MetricRow>

      <div className="mt-lg grid gap-lg lg:grid-cols-2">
        <Section title="Pass rate by run">
          {trend.length ? (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend}>
                  <CartesianGrid stroke={chartGrid} vertical={false} />
                  <XAxis dataKey="kind" stroke={chartAxis} fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} stroke={chartAxis} fontSize={12} tickLine={false} axisLine={false} width={36} />
                  <Tooltip contentStyle={chartTooltip} />
                  <Line type="monotone" dataKey="passRate" stroke={chartTheme.accent} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState title="No completed runs yet" />
          )}
        </Section>
        <Section title="Failure distribution">
          {rel?.failureDistribution.length ? (
            <ul className="space-y-md">
              {rel.failureDistribution.map((d) => {
                const p = distTotal ? (d.count / distTotal) * 100 : 0;
                const critical = /UNSAFE|CRITICAL/i.test(d.category);
                return (
                  <li key={d.category}>
                    <div className="mb-xs flex items-baseline justify-between gap-sm text-caption">
                      <span className="font-mono text-body">{d.category}</span>
                      <span className="text-muted-soft">
                        {d.count} · {pct(d.count, distTotal)}
                      </span>
                    </div>
                    <ProgressBar value={p} critical={critical} />
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState title="No failures recorded" />
          )}
        </Section>
      </div>

      <div className="mt-lg">
        <Section
          title="Recent failures"
          padded={false}
          action={<TextLink to="/failures">View all</TextLink>}
        >
          {failures.length === 0 ? (
            <EmptyState title="No failures yet" body="Run crash tests on an agent to populate this list." />
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Severity</Th>
                  <Th>Failure</Th>
                  <Th>Agent</Th>
                  <Th>Tool</Th>
                  <Th>Type</Th>
                  <Th>Run</Th>
                  <Th>Time</Th>
                </tr>
              </thead>
              <tbody>
                {failures.slice(0, 8).map((f) => (
                  <tr key={f.id} className={tableRowHover}>
                    <Td>
                      <SeverityBadge severity={f.severity} />
                    </Td>
                    <Td>
                      <InlineLink to={`/failures/${f.id}`}>{f.title}</InlineLink>
                    </Td>
                    <Td>{f.execution.testRun.agentVersion.agent.name}</Td>
                    <Td mono>{f.affectedTool ? `${f.affectedTool}()` : "—"}</Td>
                    <Td mono>{f.category}</Td>
                    <Td mono>
                      <InlineLink to={`/test-runs/${f.execution.testRun.id}`}>{shortId(f.execution.testRun.id)}</InlineLink>
                    </Td>
                    <Td className="text-muted">{formatTime(f.createdAt)}</Td>
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
