import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "../components/ui";
import { Hero3D } from "../components/landing/Hero3D";
import { LandingFooter } from "../components/landing/LandingFooter";
import { LandingNav } from "../components/landing/LandingNav";
import { PlatformCards } from "../components/landing/PlatformCards";
import { Marquee, Reveal } from "../components/landing/motion";

const steps = [
  {
    n: "01",
    title: "Register your agent",
    body: "Define tools, safety rules, and system prompts. Ship v1 vulnerable, v2 patched — compare regressions.",
  },
  {
    n: "02",
    title: "Run crash suites",
    body: "Adversarial scenarios hit refund abuse, auth bypass, prompt injection, and tool misuse in a sandbox.",
  },
  {
    n: "03",
    title: "Read Failure DNA",
    body: "Every failure ships expected vs observed behavior, execution trace, severity, and remediation hints.",
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <LandingNav />

      {/* Hero */}
      <section className="mx-auto grid max-w-content items-center gap-xl px-md py-section sm:px-lg lg:grid-cols-2 lg:gap-xxl">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-sm text-caption-uppercase uppercase text-muted"
          >
            AI agent reliability infrastructure
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="font-display text-display-xl tracking-tight text-ink sm:text-display-xxl"
          >
            Break agents
            <br />
            before users do.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-lg max-w-lg text-body-lg text-body"
          >
            Test, evaluate, and harden tool-using AI agents against real-world failures — refunds without confirmation,
            authorization bypasses, and goal drift.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mt-xl flex flex-wrap gap-sm"
          >
            <Button to="/dashboard">Open dashboard</Button>
            <Button variant="secondary" to="/agents">
              View demo agent
            </Button>
          </motion.div>
        </div>
        <Hero3D />
      </section>

      <Marquee />

      {/* Platform cards */}
      <section id="features" className="mx-auto max-w-content px-md py-section sm:px-lg">
        <Reveal>
          <h2 className="max-w-xl font-display text-display-md tracking-tight text-ink">
            How AgentCrashLab works
          </h2>
          <p className="mt-sm max-w-lg text-body-lg text-body">
            Six steps from running your first crash test to proving your agent is safer than before.
          </p>
        </Reveal>
        <div className="mt-xl">
          <PlatformCards />
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-hairline-soft bg-surface-1/30 py-section">
        <div className="mx-auto max-w-content px-md sm:px-lg">
          <Reveal>
            <h2 className="font-display text-display-md tracking-tight text-ink">How it works</h2>
            <p className="mt-sm max-w-lg text-body-lg text-body">Three steps from registered agent to actionable failure report.</p>
          </Reveal>
          <div className="mt-xl grid gap-lg md:grid-cols-3">
            {steps.map((s, i) => (
              <Reveal key={s.n} delay={i}>
                <div className="rounded-xl border border-hairline bg-surface-1 p-lg">
                  <span className="font-display text-display-sm text-muted-soft">{s.n}</span>
                  <h3 className="mt-sm text-headline text-ink">{s.title}</h3>
                  <p className="mt-sm text-body-md text-body">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Demo CTA */}
      <section id="demo" className="mx-auto max-w-content px-md py-section sm:px-lg">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-xl border border-hairline bg-surface-1 p-xl sm:p-xxl"
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              background: "radial-gradient(ellipse 60% 50% at 80% 20%, rgba(0,153,255,0.12), transparent 60%)",
            }}
          />
          <div className="relative z-10 max-w-xl">
            <h2 className="font-display text-display-md tracking-tight text-ink">Try the built-in demo agent</h2>
            <p className="mt-md text-body-lg leading-relaxed text-body">
              We ship a customer-support agent on purpose with bugs. Run the crash tests, open a failed refund scenario,
              try prompt mutations, then compare v1 against the patched v2 to see the score jump.
            </p>
            <div className="mt-xl flex flex-wrap gap-sm">
              <Button to="/agents">Open agents</Button>
              <Link
                to="/dashboard"
                className="inline-flex h-11 items-center rounded-pill px-[15px] text-button text-accent underline-offset-4 hover:underline"
              >
                Go to dashboard
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      <LandingFooter />
    </div>
  );
}
