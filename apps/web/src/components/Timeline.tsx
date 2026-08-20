import type { TraceEvent } from "../lib/api";

export function Timeline({ events, highlightUnsafe }: { events: TraceEvent[]; highlightUnsafe?: boolean }) {
  const items = [
    { label: "Test started", detail: "Scenario received", tool: false, unsafe: false },
    ...events.map((ev) => ({
      label: ev.type === "tool_call" ? `${ev.name ?? "tool"}()` : ev.type.replaceAll("_", " "),
      detail: ev.content ?? (ev.args ? JSON.stringify(ev.args) : ev.result ? JSON.stringify(ev.result) : undefined),
      tool: ev.type === "tool_call",
      unsafe: highlightUnsafe && ev.type === "tool_call" && /refund|cancel/i.test(ev.name ?? ""),
    })),
  ];

  return (
    <ol className="space-y-0">
      {items.map((item, i) => (
        <li key={`${item.label}-${i}`} className="flex gap-4">
          <div className="flex w-4 flex-col items-center">
            <div
              className={`mt-2 h-2.5 w-2.5 rounded-full ${
                item.unsafe ? "bg-crit" : item.tool ? "bg-ink" : "bg-line"
              }`}
            />
            {i < items.length - 1 ? <div className="w-px flex-1 bg-line" /> : null}
          </div>
          <div className="min-w-0 pb-5">
            <div className={`text-[13px] font-medium capitalize ${item.unsafe ? "text-crit" : "text-ink"}`}>
              {item.label}
            </div>
            {item.detail ? (
              <pre className="mt-1.5 max-h-32 overflow-auto whitespace-pre-wrap rounded-md bg-elevate p-2 font-mono text-[12px] text-secondary">
                {item.detail}
              </pre>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
