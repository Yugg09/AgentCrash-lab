/**
 * Chart colors for Recharts (requires literal values, not CSS vars).
 * Keep in sync with --chart-* tokens in src/styles/tokens.css
 */
export const chartTheme = {
  grid: "#e6dfd8",
  axis: "#8e8b82",
  line: "#141413",
  accent: "#cc785c",
  bar: "#141413",
  barCritical: "#c64545",
  tooltip: {
    background: "#faf9f5",
    border: "#e6dfd8",
    color: "#141413",
  },
} as const;
