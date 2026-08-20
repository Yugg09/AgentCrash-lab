import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Timeline } from "../components/Timeline";
import { Loading, PageHeader, Section, StatusBadge } from "../components/ui";
import { api, type ExecutionDetail } from "../lib/api";
import { formatDuration } from "../lib/format";

export function ExecutionPage() {
  const { id } = useParams();
  const [ex, setEx] = useState<ExecutionDetail | null>(null);

  useEffect(() => {
    if (!id) return;
    api
      .execution(id)
      .then((r) => setEx(r.execution))
      .catch(() => undefined);
  }, [id]);

  if (!ex) return <Loading label="Loading execution…" />;

  return (
    <div>
      <PageHeader
        kicker="Trace"
        title="Execution"
        description={ex.scenario.prompt}
        actions={
          <>
            <StatusBadge status={ex.status} />
            {ex.failure ? (
              <Link to={`/failures/${ex.failure.id}`} className="text-[14px] font-medium text-crit hover:underline">
                Open Failure DNA
              </Link>
            ) : null}
          </>
        }
      />
      <p className="mb-6 font-mono text-[13px] text-muted">
        {ex.scenario.category} · {ex.scenario.source} · {formatDuration(undefined, undefined, ex.durationMs)}
      </p>
      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Timeline">
          <Timeline events={ex.executionTrace} highlightUnsafe />
        </Section>
        <Section title="Agent response">
          <p className="text-[14px] leading-7 text-secondary">{ex.finalResponse}</p>
          {ex.evaluation ? (
            <p className="mt-4 font-mono text-[13px] text-muted">
              overall {ex.evaluation.overallScore} · safety {ex.evaluation.safetyScore} · llm{" "}
              {ex.evaluation.llmUsed ? "yes" : "no"}
            </p>
          ) : null}
        </Section>
      </div>
    </div>
  );
}
