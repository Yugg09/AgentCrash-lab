import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  EmptyState,
  Loading,
  Metric,
  MetricRow,
  PageHeader,
  Section,
  chartAxis,
  chartGrid,
  chartTooltip,
} from "../components/ui";
import { api, type ReliabilityResponse } from "../lib/api";
import { pct } from "../lib/format";

export function AnalyticsPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const [data, setData] = useState<ReliabilityResponse | null>(null);

  useEffect(() => {
    if (!id) return;
    api
      .reliability(id, params.get("versionId") ?? undefined)
      .then(setData)
      .catch(() => undefined);
  }, [id, params]);

  const m = data?.reliability;
  const distTotal = (data?.failureDistribution ?? []).reduce((s, d) => s + d.count, 0);
  const trend = useMemo(
    () =>
      (data?.trend ?? []).map((t, i) => ({
        i: i + 1,
        kind: t.kind,
        rate: t.total ? Math.round((t.passed / t.total) * 1000) / 10 : 0,
      })),
    [data],
  );

  if (!data) return <Loading label="Loading analytics…" />;

  return (
    <div>
      <PageHeader
        kicker="Analytics"
        title="Reliability"
        description="Weighted prototype: 30% safety, 25% goal, 20% tools, 15% instruction following, 10% recovery."
      />
      <MetricRow>
        <Metric label="Overall" value={m ? `${m.overall}%` : "—"} />
        <Metric label="Safety" value={m?.safety ?? "—"} />
        <Metric label="Passed" value={m ? `${m.passed}/${m.total}` : "—"} />
        <Metric label="Failed" value={m?.failed ?? "—"} tone={m && m.failed ? "crit" : undefined} />
        <Metric label="Critical" value={m?.critical ?? "—"} tone={m && m.critical ? "crit" : "ok"} />
      </MetricRow>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Section title="Pass rate by run">
          {trend.length ? (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend}>
                  <CartesianGrid stroke={chartGrid} vertical={false} />
                  <XAxis dataKey="kind" stroke={chartAxis} fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} stroke={chartAxis} fontSize={12} tickLine={false} axisLine={false} width={36} />
                  <Tooltip contentStyle={chartTooltip} />
                  <Line type="monotone" dataKey="rate" stroke="#111111" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState title="No runs" />
          )}
        </Section>
        <Section title="Failure categories">
          {(data.failureDistribution ?? []).length ? (
            <ul className="space-y-4">
              {data.failureDistribution.map((d) => (
                <li key={d.category}>
                  <div className="mb-2 flex justify-between font-mono text-[13px] text-secondary">
                    <span>{d.category}</span>
                    <span className="text-muted">
                      {d.count} · {pct(d.count, distTotal)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-elevate">
                    <div
                      className={`h-full rounded-full ${/UNSAFE/i.test(d.category) ? "bg-crit" : "bg-ink/70"}`}
                      style={{ width: `${distTotal ? (d.count / distTotal) * 100 : 0}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No failure categories" />
          )}
        </Section>
      </div>
    </div>
  );
}
