/**
 * Chart colors for Recharts (requires literal values, not CSS vars).
 * Keep in sync with --chart-* tokens in src/styles/tokens.css
 */
export const chartTheme = {
  grid: "#262626",
  axis: "#666666",
  line: "#ffffff",
  accent: "#0099ff",
  bar: "#ffffff",
  barCritical: "#ef4444",
  tooltip: {
    background: "#141414",
    border: "#262626",
    color: "#ffffff",
  },
} as const;
