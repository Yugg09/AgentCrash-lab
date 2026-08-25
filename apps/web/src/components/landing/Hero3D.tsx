import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

const METRICS = [
  { label: "Safety", value: 82, color: "#22c55e" },
  { label: "Goals", value: 68, color: "#0099ff" },
  { label: "Tools", value: 71, color: "#f59e0b" },
] as const;

function MockBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-1.5 overflow-hidden rounded-pill bg-white/[0.08]">
      <motion.div
        className="h-full rounded-pill"
        style={{ background: color, width: `${pct}%` }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 1.2, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

export function Hero3D() {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [10, -10]), { stiffness: 180, damping: 22 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-10, 10]), { stiffness: 180, damping: 22 });

  function onMove(e: React.PointerEvent) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function onLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <div
      ref={ref}
      className="relative mx-auto w-full max-w-lg overflow-visible perspective-[1200px] py-8"
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative"
        initial={{ opacity: 0, y: 40, rotateX: 8 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Ambient glow — subtle blue only */}
        <div
          className="pointer-events-none absolute -inset-12 rounded-[40px] opacity-40"
          style={{
            background: "radial-gradient(ellipse 70% 50% at 30% 20%, rgba(0,153,255,0.2), transparent 60%)",
            transform: "translateZ(-50px)",
          }}
        />

        <div
          className="relative overflow-hidden rounded-xl border border-white/[0.12] bg-surface-1 shadow-card"
          style={{
            transform: "translateZ(24px)",
            boxShadow: "0 0 0 0.5px rgba(255,255,255,0.08), 0 24px 48px rgba(0,0,0,0.45)",
          }}
        >
          {/* Top shine */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

          <div className="flex items-center gap-xs border-b border-white/[0.06] bg-white/[0.02] px-md py-sm">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
            <span className="ml-sm font-mono text-micro text-muted">agentcrashlab · reliability run</span>
          </div>

          <div className="space-y-md p-md">
            <div className="flex items-end justify-between gap-md">
              <div>
                <p className="text-caption text-muted">Overall reliability</p>
                <p className="font-display text-display-md tracking-tight text-ink">73%</p>
              </div>
              <span className="rounded-pill border border-error/30 bg-error/15 px-sm py-xxs text-caption font-medium text-error backdrop-blur-sm">
                3 critical
              </span>
            </div>

            <div className="grid grid-cols-3 gap-sm">
              {METRICS.map((m, i) => (
                <motion.div
                  key={m.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.08 }}
                  className="relative overflow-hidden rounded-lg border border-white/[0.08] bg-white/[0.04] p-sm backdrop-blur-sm"
                >
                  <div
                    className="pointer-events-none absolute -right-4 -top-4 h-12 w-12 rounded-full opacity-30 blur-xl"
                    style={{ background: m.color }}
                  />
                  <p className="text-micro text-muted">{m.label}</p>
                  <p className="font-display text-title-md tracking-tight text-ink">{m.value}%</p>
                  <div className="mt-xs h-1 overflow-hidden rounded-pill bg-white/[0.08]">
                    <div className="h-full rounded-pill" style={{ width: `${m.value}%`, background: m.color }} />
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="space-y-sm rounded-lg border border-white/[0.06] bg-black/30 p-sm backdrop-blur-sm">
              <div className="space-y-xs">
                <div className="flex items-center gap-xs">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-error shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                  <span className="font-mono text-micro text-ink/90">refund_order() without confirmation</span>
                </div>
                <MockBar pct={92} color="#ef4444" />
              </div>
              <div className="space-y-xs">
                <div className="flex items-center gap-xs">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-accent shadow-[0_0_8px_rgba(0,153,255,0.5)]" />
                  <span className="font-mono text-micro text-muted">search_order → cancel_order</span>
                </div>
                <MockBar pct={64} color="#0099ff" />
              </div>
            </div>
          </div>
        </div>

        <motion.div
          className="absolute -right-2 top-6 z-10 rounded-pill border border-error/30 bg-surface-2 px-sm py-xs text-caption font-medium text-error shadow-card"
          style={{ transform: "translateZ(70px)" }}
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          CRITICAL failure
        </motion.div>
        <motion.div
          className="absolute -left-2 bottom-16 z-10 rounded-pill border border-hairline bg-surface-2 px-sm py-xs text-caption font-medium text-ink shadow-card"
          style={{ transform: "translateZ(55px)" }}
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          16 crash tests
        </motion.div>
      </motion.div>
    </div>
  );
}
