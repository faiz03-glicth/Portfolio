import type { Config } from "tailwindcss";
import { theme } from "./src/config/theme";

/**
 * Tailwind consumes `src/config/theme.ts` — it does not define anything of its
 * own. Every colour below points at the CSS custom property emitted by
 * `src/styles/theme-css.ts`, using the `<alpha-value>` placeholder so opacity
 * modifiers (`bg-primary/20`, `border-border/60`) work on every token.
 */
const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    container: {
      center: true,
      padding: theme.spacing.container,
      screens: { "2xl": theme.container.maxWidth },
    },
    extend: {
      colors: {
        background: "hsl(var(--color-background) / <alpha-value>)",
        foreground: "hsl(var(--color-foreground) / <alpha-value>)",
        surface: {
          DEFAULT: "hsl(var(--color-surface) / <alpha-value>)",
          foreground: "hsl(var(--color-surface-foreground) / <alpha-value>)",
        },
        elevated: "hsl(var(--color-elevated) / <alpha-value>)",
        primary: {
          DEFAULT: "hsl(var(--color-primary) / <alpha-value>)",
          foreground: "hsl(var(--color-primary-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--color-accent) / <alpha-value>)",
          foreground: "hsl(var(--color-accent-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--color-muted) / <alpha-value>)",
          foreground: "hsl(var(--color-muted-foreground) / <alpha-value>)",
        },
        border: "hsl(var(--color-border) / <alpha-value>)",
        input: "hsl(var(--color-input) / <alpha-value>)",
        ring: "hsl(var(--color-ring) / <alpha-value>)",
        success: "hsl(var(--color-success) / <alpha-value>)",
        warning: "hsl(var(--color-warning) / <alpha-value>)",
        danger: "hsl(var(--color-danger) / <alpha-value>)",
        info: "hsl(var(--color-info) / <alpha-value>)",
      },

      fontFamily: {
        sans: [theme.typography.fontFamily.body, "system-ui", "sans-serif"],
        heading: [
          theme.typography.fontFamily.heading,
          "system-ui",
          "sans-serif",
        ],
        mono: [theme.typography.fontFamily.mono, "ui-monospace", "monospace"],
      },

      // Cast: Tailwind's FontSize tuple type is narrower than a readonly
      // `as const` array, but the shape is identical.
      fontSize: theme.typography.fontSize as unknown as Record<
        string,
        [string, Record<string, string>]
      >,

      borderRadius: theme.radius,

      spacing: {
        section: theme.spacing.section,
        "section-lg": theme.spacing.sectionLg,
        gutter: theme.spacing.gutter,
      },

      maxWidth: {
        container: theme.container.maxWidth,
      },

      boxShadow: theme.shadow,

      transitionDuration: theme.motion.duration,
      transitionTimingFunction: theme.motion.easing,

      zIndex: theme.zIndex,

      keyframes: {
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "pulse-ring": {
          "0%": { opacity: "0.9", transform: "scale(0.85)" },
          "70%, 100%": { opacity: "0", transform: "scale(2.1)" },
        },
      },

      animation: {
        "fade-in-up": `fade-in-up ${theme.motion.duration.slow} ${theme.motion.easing.entrance} both`,
        "fade-in": `fade-in ${theme.motion.duration.slow} ${theme.motion.easing.entrance} both`,
        shimmer: `shimmer 1.6s ${theme.motion.easing.standard} infinite`,
        "pulse-ring": `pulse-ring 2.4s ${theme.motion.easing.standard} infinite`,
      },
    },
  },
  plugins: [],
};

export default config;
