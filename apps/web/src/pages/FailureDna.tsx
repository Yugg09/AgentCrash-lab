import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Timeline } from "../components/Timeline";
import {
  Button,
  CodeWindow,
  DarkSection,
  DetailRow,
  ErrorBanner,
  Loading,
  Mono,
  PageHeader,
  Section,
  SeverityBadge,
  TextLink,
} from "../components/ui";
import { api, type FailureDetail } from "../lib/api";
import { shortId } from "../lib/format";

export function FailureDnaPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [failure, setFailure] = useState<FailureDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    api
      .failure(id)
      .then((r) => setFailure(r.failure))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, [id]);

  async function explore() {
    if (!id) return;
    setBusy(true);
    try {
      const r = await api.mutate(id);
      navigate(`/test-runs/${r.testRun.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Mutation failed");
    } finally {
      setBusy(false);
    }
  }

  if (!failure) return <Loading label="Loading failure…" />;

  const agent = failure.execution.testRun?.agentVersion.agent;
  const version = failure.execution.testRun?.agentVersion.version;
  const evaln = failure.execution.evaluation;

  return (
    <div>
      <PageHeader
        kicker="Failure DNA"
        title={failure.title}
        description={
          <span className="inline-flex flex-wrap items-center gap-xs">
            <SeverityBadge severity={failure.severity} />
            <Mono>{failure.category}</Mono>
            {failure.affectedTool ? <Mono>{failure.affectedTool}()</Mono> : null}
            {version ? <Mono>{version}</Mono> : null}
          </span>
        }
        actions={
          <Button disabled={busy} onClick={explore}>
            Explore failure
          </Button>
        }
      />
      <ErrorBanner error={error} />

      <div className="grid gap-lg lg:grid-cols-2">
        <Section title="Incident">
          <dl className="space-y-md">
            <DetailRow k="Agent" v={agent?.name ?? "—"} />
            <DetailRow k="Version" v={version ?? "—"} mono />
            <DetailRow k="Scenario" v={failure.execution.scenario.prompt} />
            <DetailRow k="Expected" v={failure.expectedBehavior} />
            <DetailRow k="Observed" v={failure.observedBehavior} />
            <DetailRow
              k="Reproducibility"
              v={failure.reproducibility == null ? "Run Explore Failure to measure" : `${failure.reproducibility}%`}
            />
            <DetailRow k="Remediation" v={failure.remediation} />
          </dl>
        </Section>
        <Section title="Evaluation">
          {evaln ? (
            <dl className="space-y-md">
              <DetailRow k="Passed" v={String(evaln.passed)} />
              <DetailRow k="Overall" v={String(evaln.overallScore)} mono />
              <DetailRow k="Safety" v={String(evaln.safetyScore)} mono />
              <DetailRow k="Goal" v={String(evaln.goalScore)} mono />
              <DetailRow k="Tools" v={String(evaln.toolScore)} mono />
              <DetailRow k="Instruction" v={String(evaln.instructionScore)} mono />
              <DetailRow k="Recovery" v={String(evaln.recoveryScore)} mono />
              <DetailRow k="Reason" v={evaln.reasoning} />
              <DetailRow k="LLM used" v={evaln.llmUsed ? "yes" : "no"} />
            </dl>
          ) : (
            <p className="text-body-sm text-body">No evaluation attached.</p>
          )}
        </Section>
      </div>

      <div className="mt-lg grid gap-lg lg:grid-cols-2">
        <DarkSection title="Execution trace">
          <Timeline events={failure.execution.executionTrace} highlightUnsafe />
          <TextLink to={`/executions/${failure.execution.id}`} className="mt-md inline-block">
            Open full execution
          </TextLink>
        </DarkSection>
        <DarkSection title="Evidence">
          <div className="mb-md font-mono text-code text-on-dark-soft">
            run {failure.execution.testRun?.id ? shortId(failure.execution.testRun.id) : "—"} · execution{" "}
            {shortId(failure.execution.id)}
          </div>
          <CodeWindow>{JSON.stringify(failure.evidence, null, 2)}</CodeWindow>
        </DarkSection>
      </div>
    </div>
  );
}
