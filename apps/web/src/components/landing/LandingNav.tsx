import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../ui";

const links = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#demo", label: "Demo" },
];

export function LandingNav() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 border-b border-hairline-soft bg-canvas/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-content items-center justify-between px-md sm:h-[72px] sm:px-lg">
        <Link to="/dashboard" className="font-display text-title-lg font-bold tracking-tight text-ink">
          AgentCrashLab
        </Link>
        <nav className="hidden items-center gap-xl md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-body-md text-muted transition-colors hover:text-ink">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-xs">
          <Button variant="secondary" to="/dashboard">
            Sign in
          </Button>
          <Button to="/dashboard">Open app</Button>
        </div>
      </div>
    </motion.header>
  );
}
