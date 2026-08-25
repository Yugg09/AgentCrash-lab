/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)"],
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      fontSize: {
        "display-xl": [
          "var(--text-display-xl-size)",
          { lineHeight: "var(--text-display-xl-leading)", letterSpacing: "var(--text-display-xl-tracking)", fontWeight: "400" },
        ],
        "display-lg": [
          "var(--text-display-lg-size)",
          { lineHeight: "var(--text-display-lg-leading)", letterSpacing: "var(--text-display-lg-tracking)", fontWeight: "400" },
        ],
        "display-md": [
          "var(--text-display-md-size)",
          { lineHeight: "var(--text-display-md-leading)", letterSpacing: "var(--text-display-md-tracking)", fontWeight: "400" },
        ],
        "display-sm": [
          "var(--text-display-sm-size)",
          { lineHeight: "var(--text-display-sm-leading)", letterSpacing: "var(--text-display-sm-tracking)", fontWeight: "400" },
        ],
        "title-lg": ["var(--text-title-lg-size)", { lineHeight: "var(--text-title-lg-leading)", fontWeight: "500" }],
        "title-md": ["var(--text-title-md-size)", { lineHeight: "var(--text-title-md-leading)", fontWeight: "500" }],
        "title-sm": ["var(--text-title-sm-size)", { lineHeight: "var(--text-title-sm-leading)", fontWeight: "500" }],
        "body-md": ["var(--text-body-md-size)", { lineHeight: "var(--text-body-md-leading)", fontWeight: "400" }],
        "body-sm": ["var(--text-body-sm-size)", { lineHeight: "var(--text-body-sm-leading)", fontWeight: "400" }],
        caption: ["var(--text-caption-size)", { lineHeight: "var(--text-caption-leading)", fontWeight: "500" }],
        "caption-uppercase": [
          "var(--text-caption-uppercase-size)",
          {
            lineHeight: "var(--text-caption-uppercase-leading)",
            letterSpacing: "var(--text-caption-uppercase-tracking)",
            fontWeight: "500",
          },
        ],
        code: ["var(--text-code-size)", { lineHeight: "var(--text-code-leading)", fontWeight: "400" }],
        button: ["var(--text-button-size)", { lineHeight: "var(--text-button-leading)", fontWeight: "500" }],
        nav: ["var(--text-nav-size)", { lineHeight: "var(--text-nav-leading)", fontWeight: "500" }],
      },
      colors: {
        /* Brand */
        primary: {
          DEFAULT: "var(--color-primary)",
          active: "var(--color-primary-active)",
          disabled: "var(--color-primary-disabled)",
        },
        "accent-teal": "var(--color-accent-teal)",
        "accent-amber": "var(--color-accent-amber)",

        /* Surfaces */
        canvas: "var(--color-canvas)",
        "surface-soft": "var(--color-surface-soft)",
        "surface-card": "var(--color-surface-card)",
        "surface-cream-strong": "var(--color-surface-cream-strong)",
        "surface-dark": "var(--color-surface-dark)",
        "surface-dark-elevated": "var(--color-surface-dark-elevated)",
        "surface-dark-soft": "var(--color-surface-dark-soft)",

        /* Text */
        ink: "var(--color-ink)",
        body: {
          DEFAULT: "var(--color-body)",
          strong: "var(--color-body-strong)",
        },
        muted: {
          DEFAULT: "var(--color-muted)",
          soft: "var(--color-muted-soft)",
        },
        "on-primary": "var(--color-on-primary)",
        "on-dark": {
          DEFAULT: "var(--color-on-dark)",
          soft: "var(--color-on-dark-soft)",
        },

        /* Borders */
        hairline: {
          DEFAULT: "var(--color-hairline)",
          soft: "var(--color-hairline-soft)",
        },

        /* Semantic */
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        error: "var(--color-error)",

        /* Legacy aliases — pages/components not yet migrated */
        bg: "var(--color-canvas)",
        surface: "var(--color-surface-card)",
        elevate: "var(--color-surface-soft)",
        line: "var(--color-hairline)",
        fg: "var(--color-ink)",
        secondary: "var(--color-muted)",
        ok: "var(--color-success)",
        crit: "var(--color-error)",
        warn: "var(--color-warning)",
      },
      spacing: {
        xxs: "var(--spacing-xxs)",
        xs: "var(--spacing-xs)",
        sm: "var(--spacing-sm)",
        md: "var(--spacing-md)",
        lg: "var(--spacing-lg)",
        xl: "var(--spacing-xl)",
        xxl: "var(--spacing-xxl)",
        section: "var(--spacing-section)",
      },
      borderRadius: {
        xs: "var(--radius-xs)",
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        pill: "var(--radius-pill)",
        DEFAULT: "var(--radius-md)",
      },
      boxShadow: {
        hover: "var(--shadow-hover)",
        card: "var(--shadow-card)",
      },
      maxWidth: {
        content: "1200px",
      },
    },
  },
  plugins: [],
};
