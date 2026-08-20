import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  EmptyState,
  ErrorBanner,
  Loading,
  PageHeader,
  Section,
  Select,
  SeverityBadge,
  Table,
  Td,
  Th,
} from "../components/ui";
import { api, type FailureRow } from "../lib/api";
import { formatTime, shortId } from "../lib/format";

export function FailuresPage() {
  const [failures, setFailures] = useState<FailureRow[]>([]);
  const [severity, setSeverity] = useState("ALL");
  const [category, setCategory] = useState("ALL");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .failures()
      .then((r) => setFailures(r.failures))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => Array.from(new Set(failures.map((f) => f.category))).sort(), [failures]);
  const filtered = failures.filter((f) => {
    if (severity !== "ALL" && f.severity !== severity) return false;
    if (category !== "ALL" && f.category !== category) return false;
    return true;
  });

  if (loading) return <Loading label="Loading failures…" />;

  return (
    <div>
      <PageHeader
        kicker="Incidents"
        title="Failures"
        description="Classified issues from completed executions. Filters apply to loaded results."
      />
      <ErrorBanner error={error} />
      <div className="mb-6 flex flex-wrap gap-4 rounded-lg border border-line bg-white p-4 shadow-card">
        <Select label="Severity" value={severity} onChange={setSeverity}>
          <option value="ALL">All</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </Select>
        <Select label="Type" value={category} onChange={setCategory}>
          <option value="ALL">All</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <span className="self-end pb-1 text-[13px] text-muted">{filtered.length} shown</span>
      </div>
      <Section title="Detected issues" padded={false}>
        {filtered.length === 0 ? (
          <EmptyState title="No failures match these filters" />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Severity</Th>
                <Th>Failure</Th>
                <Th>Agent</Th>
                <Th>Version</Th>
                <Th>Tool</Th>
                <Th>Type</Th>
                <Th>Run</Th>
                <Th>Time</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f) => (
                <tr key={f.id} className="transition-colors hover:bg-elevate/50">
                  <Td>
                    <SeverityBadge severity={f.severity} />
                  </Td>
                  <Td>
                    <Link to={`/failures/${f.id}`} className="font-medium hover:underline">
                      {f.title}
                    </Link>
                  </Td>
                  <Td>{f.execution.testRun.agentVersion.agent.name}</Td>
                  <Td mono>{f.execution.testRun.agentVersion.version}</Td>
                  <Td mono>{f.affectedTool ? `${f.affectedTool}()` : "—"}</Td>
                  <Td mono>{f.category}</Td>
                  <Td mono>
                    <Link to={`/test-runs/${f.execution.testRun.id}`} className="hover:underline">
                      {shortId(f.execution.testRun.id)}
                    </Link>
                  </Td>
                  <Td className="text-secondary">{formatTime(f.createdAt)}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Section>
    </div>
  );
}
