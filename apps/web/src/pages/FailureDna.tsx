import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Timeline } from "../components/Timeline";
import { Button, ErrorBanner, Loading, Mono, PageHeader, Section, SeverityBadge } from "../components/ui";
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
          <span className="inline-flex flex-wrap items-center gap-2">
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

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Incident">
          <dl className="space-y-4 text-[14px]">
            <Row k="Agent" v={agent?.name ?? "—"} />
            <Row k="Version" v={version ?? "—"} mono />
            <Row k="Scenario" v={failure.execution.scenario.prompt} />
            <Row k="Expected" v={failure.expectedBehavior} />
            <Row k="Observed" v={failure.observedBehavior} />
            <Row
              k="Reproducibility"
              v={failure.reproducibility == null ? "Run Explore Failure to measure" : `${failure.reproducibility}%`}
            />
            <Row k="Remediation" v={failure.remediation} />
          </dl>
        </Section>
        <Section title="Evaluation">
          {evaln ? (
            <dl className="space-y-4 text-[14px]">
              <Row k="Passed" v={String(evaln.passed)} />
              <Row k="Overall" v={String(evaln.overallScore)} mono />
              <Row k="Safety" v={String(evaln.safetyScore)} mono />
              <Row k="Goal" v={String(evaln.goalScore)} mono />
              <Row k="Tools" v={String(evaln.toolScore)} mono />
              <Row k="Instruction" v={String(evaln.instructionScore)} mono />
              <Row k="Recovery" v={String(evaln.recoveryScore)} mono />
              <Row k="Reason" v={evaln.reasoning} />
              <Row k="LLM used" v={evaln.llmUsed ? "yes" : "no"} />
            </dl>
          ) : (
            <p className="text-[14px] text-secondary">No evaluation attached.</p>
          )}
        </Section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Section title="Execution trace">
          <Timeline events={failure.execution.executionTrace} highlightUnsafe />
          <Link
            to={`/executions/${failure.execution.id}`}
            className="mt-3 inline-block text-[13px] font-medium text-secondary hover:text-ink"
          >
            Open full execution
          </Link>
        </Section>
        <Section title="Evidence">
          <div className="mb-3 font-mono text-[13px] text-muted">
            run {failure.execution.testRun?.id ? shortId(failure.execution.testRun.id) : "—"} · execution{" "}
            {shortId(failure.execution.id)}
          </div>
          <pre className="max-h-80 overflow-auto rounded-lg bg-elevate p-4 font-mono text-[12px] leading-5 text-secondary">
            {JSON.stringify(failure.evidence, null, 2)}
          </pre>
        </Section>
      </div>
    </div>
  );
}

function Row({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-[12px] font-medium text-muted">{k}</dt>
      <dd className={`mt-1 leading-6 ${mono ? "font-mono text-[13px] text-secondary" : "text-ink"}`}>{v}</dd>
    </div>
  );
}
