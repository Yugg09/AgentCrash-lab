import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button, EmptyState, ErrorBanner, Metric, MetricRow, PageHeader, Section, Select } from "../components/ui";
import { api, type AgentDetail, type RegressionResponse } from "../lib/api";

export function RegressionPage() {
  const { id } = useParams();
  const [agent, setAgent] = useState<AgentDetail | null>(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [data, setData] = useState<RegressionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.agent(id).then((r) => {
      setAgent(r.agent);
      setFrom(r.agent.versions[0]?.id ?? "");
      setTo(r.agent.versions.at(-1)?.id ?? "");
    });
  }, [id]);

  async function compare() {
    if (!id) return;
    setError(null);
    try {
      setData(await api.regressions(id, from, to));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Compare failed");
    }
  }

  async function runBoth() {
    if (!from || !to) return;
    setBusy(true);
    setHint("Queuing crash suites on both versions…");
    try {
      await api.startRun({ agentVersionId: from, kind: "crash", filter: { excludeHappyPath: true } });
      await api.startRun({ agentVersionId: to, kind: "crash", filter: { excludeHappyPath: true } });
      setHint("Crash tests queued. Wait until both runs complete, then compare again.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not queue runs");
    } finally {
      setBusy(false);
    }
  }

  const c = data?.comparison;

  return (
    <div>
      <PageHeader
        kicker="Regression"
        title="Version comparison"
        description="Compares the latest completed crash/standard run of each version."
        actions={
          <>
            <Select label="From" value={from} onChange={setFrom}>
              {agent?.versions.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.version}
                </option>
              ))}
            </Select>
            <Select label="To" value={to} onChange={setTo}>
              {agent?.versions.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.version}
                </option>
              ))}
            </Select>
            <Button onClick={compare}>Compare</Button>
            <Button variant="secondary" disabled={busy} onClick={runBoth}>
              Run crash tests on both
            </Button>
          </>
        }
      />
      <ErrorBanner error={error} />
      {hint ? <p className="mb-lg text-body-sm text-body">{hint}</p> : null}

      {c ? (
        <>
          <MetricRow>
            <Metric label={`${data?.from.version} reliability`} value={`${c.oldReliability}%`} />
            <Metric label={`${data?.to.version} reliability`} value={`${c.newReliability}%`} tone="ok" />
            <Metric
              label="Delta"
              value={`${c.scoreDelta > 0 ? "+" : ""}${c.scoreDelta}`}
              tone={c.scoreDelta >= 0 ? "ok" : "crit"}
            />
            <Metric label="Critical" value={`${c.oldCritical} → ${c.newCritical}`} tone={c.newCritical === 0 ? "ok" : "crit"} />
            <Metric label="Fixed / new" value={`${c.fixed.length} / ${c.introduced.length}`} />
          </MetricRow>
          <div className="mt-lg grid gap-lg md:grid-cols-3">
            <Section title={`Fixed (${c.fixed.length})`}>
              <List items={c.fixed} />
            </Section>
            <Section title={`Persistent (${c.persistent.length})`}>
              <List items={c.persistent} />
            </Section>
            <Section title={`Introduced (${c.introduced.length})`}>
              <List items={c.introduced} />
            </Section>
          </div>
        </>
      ) : (
        <EmptyState title="No comparison yet" body="Select two versions and click Compare." />
      )}
    </div>
  );
}

function List({ items }: { items: { title: string; category: string; affectedTool: string | null }[] }) {
  if (!items.length) return <p className="text-body-sm text-body">None</p>;
  return (
    <ul className="space-y-md text-body-sm">
      {items.map((i, idx) => (
        <li key={`${i.title}-${idx}`}>
          <div className="font-medium text-ink">{i.title}</div>
          <div className="mt-xxs font-mono text-code text-muted">
            {i.category}
            {i.affectedTool ? ` · ${i.affectedTool}()` : ""}
          </div>
        </li>
      ))}
    </ul>
  );
}
