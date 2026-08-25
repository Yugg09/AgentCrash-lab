import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Timeline } from "../components/Timeline";
import { DarkSection, Loading, PageHeader, Section, StatusBadge, TextLink } from "../components/ui";
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
              <TextLink to={`/failures/${ex.failure.id}`} className="text-error">
                Open Failure DNA
              </TextLink>
            ) : null}
          </>
        }
      />
      <p className="mb-lg font-mono text-code text-muted">
        {ex.scenario.category} · {ex.scenario.source} · {formatDuration(undefined, undefined, ex.durationMs)}
      </p>
      <div className="grid gap-lg lg:grid-cols-2">
        <DarkSection title="Timeline">
          <Timeline events={ex.executionTrace} highlightUnsafe />
        </DarkSection>
        <Section title="Agent response">
          <p className="text-body-sm leading-relaxed text-body">{ex.finalResponse}</p>
          {ex.evaluation ? (
            <p className="mt-md font-mono text-code text-muted">
              overall {ex.evaluation.overallScore} · safety {ex.evaluation.safetyScore} · llm{" "}
              {ex.evaluation.llmUsed ? "yes" : "no"}
            </p>
          ) : null}
        </Section>
      </div>
    </div>
  );
}
