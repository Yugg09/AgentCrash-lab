import { motion } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

const chartData = [
  { i: 1, v: 62 },
  { i: 2, v: 58 },
  { i: 3, v: 71 },
  { i: 4, v: 68 },
  { i: 5, v: 73 },
  { i: 6, v: 76 },
];

const cards = [
  {
    step: "01",
    title: "Run crash tests",
    description:
      "We send tricky situations to your agent — like refunding money without asking — and see if it handles them safely.",
    visual: (
      <div className="divide-y divide-hairline rounded-md bg-canvas">
        {[
          { name: "Refund without asking", status: "Failed", tone: "text-error" },
          { name: "Normal refund flow", status: "Passed", tone: "text-success" },
        ].map((row) => (
          <div key={row.name} className="flex items-center justify-between px-sm py-sm">
            <span className="text-body-sm text-ink/90">{row.name}</span>
            <span className={`text-caption font-medium ${row.tone}`}>{row.status}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    step: "02",
    title: "See what happened",
    description: "Every run shows a step-by-step log — which tools the agent called and in what order.",
    visual: (
      <div className="space-y-sm rounded-md bg-canvas p-sm">
        <div className="flex items-center gap-sm text-body-sm">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-2 text-micro text-muted">
            1
          </span>
          <span className="text-ink">Read customer message</span>
        </div>
        <div className="flex items-center gap-sm text-body-sm">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-2 text-micro text-muted">
            2
          </span>
          <span className="text-ink">Called refund tool</span>
        </div>
        <p className="pl-7 font-mono text-micro text-muted">refund_order($120)</p>
      </div>
    ),
  },
  {
    step: "03",
    title: "Read the failure report",
    description: "Each failure explains what should have happened versus what the agent actually did.",
    visual: (
      <div className="space-y-sm rounded-md bg-canvas p-sm">
        <div>
          <p className="text-caption text-muted">Should have done</p>
          <p className="mt-xxs text-body-sm text-ink/90">Ask the user to confirm first</p>
        </div>
        <div className="h-px bg-hairline" />
        <div>
          <p className="text-caption text-muted">Actually did</p>
          <p className="mt-xxs text-body-sm text-ink/90">Refunded $120 with no confirmation</p>
        </div>
      </div>
    ),
  },
  {
    step: "04",
    title: "Get a reliability score",
    description: "One simple number tells you how safe your agent is based on the latest test run.",
    visual: (
      <div className="relative rounded-md bg-canvas py-md">
        <div
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{
            background: "radial-gradient(circle at 50% 40%, rgba(0,153,255,0.25), transparent 65%)",
          }}
        />
        <p className="relative text-center font-display text-display-sm tracking-tight text-ink">73%</p>
        <p className="relative mt-xs text-center text-caption text-muted">12 of 16 tests passed</p>
      </div>
    ),
  },
  {
    step: "05",
    title: "Track improvement",
    description: "Watch your pass rate climb over time as you fix bugs and harden your agent.",
    visual: (
      <div className="rounded-md bg-canvas p-sm">
        <div className="mb-sm flex items-baseline justify-between">
          <span className="text-caption text-muted">Scenarios passed</span>
          <span className="font-display text-title-sm text-ink">12 / 16</span>
        </div>
        <div className="h-16">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="cardFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6a4cf5" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#6a4cf5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke="#0099ff" strokeWidth={1.5} fill="url(#cardFill)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    ),
  },
  {
    step: "06",
    title: "Prove your fix worked",
    description: "Compare two versions side by side to show the patch actually improved results.",
    visual: (
      <div className="space-y-md rounded-md bg-canvas p-sm">
        <div>
          <div className="mb-xxs flex justify-between text-caption text-muted">
            <span>Before fix</span>
            <span className="text-ink">61%</span>
          </div>
          <div className="h-1 overflow-hidden rounded-pill bg-surface-2">
            <div className="h-full w-[61%] rounded-pill bg-white/20" />
          </div>
        </div>
        <div>
          <div className="mb-xxs flex justify-between text-caption">
            <span className="flex items-center gap-xs text-ink">
              After fix
              <span className="rounded-pill bg-accent/15 px-xs py-[1px] text-[10px] font-medium text-accent">
                Improved
              </span>
            </span>
            <span className="text-ink">84%</span>
          </div>
          <div className="h-1 overflow-hidden rounded-pill bg-surface-2">
            <div className="h-full w-[84%] rounded-pill bg-accent/70" />
          </div>
        </div>
      </div>
    ),
  },
];

function PlatformCard({
  step,
  title,
  description,
  visual,
  index,
}: {
  step: string;
  title: string;
  description: string;
  visual: React.ReactNode;
  index: number;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2 }}
      className="flex flex-col rounded-xl border border-hairline bg-surface-1 p-lg transition-colors hover:bg-surface-2"
    >
      <p className="font-display text-display-sm text-muted-soft">{step}</p>
      <h3 className="mt-sm text-headline text-ink">{title}</h3>
      <p className="mt-sm text-body-md leading-relaxed text-body">{description}</p>
      <div className="mt-lg">{visual}</div>
    </motion.article>
  );
}

export function PlatformCards() {
  return (
    <div className="grid gap-lg sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card, i) => (
        <PlatformCard key={card.step} index={i} {...card} />
      ))}
    </div>
  );
}
