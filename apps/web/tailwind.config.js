/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      colors: {
        canvas: "#F7F7F5",
        bg: "#FFFFFF",
        surface: "#FFFFFF",
        elevate: "#F3F3F1",
        line: "#E8E8E6",
        ink: "#111111",
        fg: "#111111",
        secondary: "#6B6B6B",
        muted: "#9A9A9A",
        ok: "#15803D",
        crit: "#DC2626",
        warn: "#B45309",
      },
      maxWidth: {
        content: "1120px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(17, 17, 17, 0.04)",
      },
      borderRadius: {
        DEFAULT: "8px",
        sm: "6px",
        md: "10px",
      },
    },
  },
  plugins: [],
};
