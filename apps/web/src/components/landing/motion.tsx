import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      custom={delay}
      variants={fadeUp}
    >
      {children}
    </motion.div>
  );
}

export function FeatureCard({
  title,
  description,
  index = 0,
}: {
  title: string;
  description: string;
  index?: number;
}) {
  return (
    <motion.div
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={fadeUp}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="rounded-xl border border-hairline bg-surface-1 p-lg transition-colors hover:border-white/[0.08] hover:bg-surface-2"
    >
      <h3 className="text-headline text-ink">{title}</h3>
      <p className="mt-sm text-body-md text-body">{description}</p>
    </motion.div>
  );
}

export function Marquee() {
  const items = [
    "Crash test suites",
    "Failure DNA",
    "Execution traces",
    "Version regression",
    "Hybrid evaluation",
    "Sandbox agents",
    "Adversarial scenarios",
    "Tool misuse detection",
  ];

  return (
    <div className="overflow-hidden border-y border-hairline-soft py-md">
      <motion.div
        className="flex gap-xl whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
      >
        {[...items, ...items].map((item, i) => (
          <span key={`${item}-${i}`} className="font-display text-title-md tracking-tight text-muted">
            {item}
            <span className="mx-lg text-hairline">·</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}
