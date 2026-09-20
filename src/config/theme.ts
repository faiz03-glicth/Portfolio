/**
 * Global theme configuration — the single authoritative definition of the
 * visual system.
 *
 * Nothing else in the application is allowed to invent a colour, a radius, a
 * duration or a shadow. Two consumers read this file:
 *
 *   1. `tailwind.config.ts` — turns these tokens into utility class names, so
 *      components write `bg-background` / `text-muted-foreground` rather than
 *      `bg-[#0b0f14]`.
 *   2. `src/styles/theme-css.ts` — serialises the palettes into CSS custom
 *      properties that the root layout injects, giving light/dark switching
 *      without duplicating any value.
 *
 * Colours are stored as bare HSL channels ("222 24% 6%") rather than finished
 * colour strings. That is what lets Tailwind compose them with an alpha
 * modifier: `hsl(var(--color-background) / <alpha-value>)` makes `bg-primary/20`
 * work for every token automatically.
 */

/** A bare HSL channel triplet, e.g. `"222 24% 6%"`. */
export type HslChannels = string;

/** Semantic colour roles. Both palettes must define every key. */
export type ColorTokens = {
  /** Page background. */
  background: HslChannels;
  /** Default text colour on `background`. */
  foreground: HslChannels;

  /** Raised panels: cards, popovers, the navbar when stuck. */
  surface: HslChannels;
  /** Text on `surface`. */
  surfaceForeground: HslChannels;
  /** A second elevation step, for nested panels and hover states. */
  elevated: HslChannels;

  /** Brand colour: primary actions, links, active nav state. */
  primary: HslChannels;
  /** Text placed on top of `primary`. */
  primaryForeground: HslChannels;

  /** Supporting brand colour, used sparingly for gradients and highlights. */
  accent: HslChannels;
  accentForeground: HslChannels;

  /** Low-emphasis backgrounds (badges, skeletons, inert chips). */
  muted: HslChannels;
  /** Secondary text: descriptions, captions, metadata. */
  mutedForeground: HslChannels;

  /** Hairlines, dividers, card outlines. */
  border: HslChannels;
  /** Form control borders, slightly stronger than `border`. */
  input: HslChannels;
  /** Focus ring. Must stay visible in both palettes. */
  ring: HslChannels;

  /** Status colours for empty / error / success / warning states. */
  success: HslChannels;
  warning: HslChannels;
  danger: HslChannels;
  info: HslChannels;
};

/**
 * Dark is the primary palette — the site is designed dark-first and the light
 * palette is derived to match its contrast relationships.
 */
const dark: ColorTokens = {
  background: "222 24% 5%",
  foreground: "210 20% 96%",

  surface: "222 22% 8%",
  surfaceForeground: "210 20% 96%",
  elevated: "220 20% 12%",

  primary: "190 95% 50%",
  primaryForeground: "222 47% 6%",

  accent: "265 85% 68%",
  accentForeground: "222 47% 6%",

  muted: "220 18% 14%",
  mutedForeground: "215 16% 65%",

  border: "220 16% 17%",
  input: "220 16% 22%",
  ring: "190 95% 50%",

  success: "152 62% 48%",
  warning: "38 92% 58%",
  danger: "0 72% 60%",
  info: "212 92% 62%",
};

const light: ColorTokens = {
  background: "0 0% 100%",
  foreground: "222 32% 10%",

  surface: "220 24% 98%",
  surfaceForeground: "222 32% 10%",
  elevated: "220 20% 95%",

  primary: "196 92% 38%",
  primaryForeground: "0 0% 100%",

  accent: "263 70% 52%",
  accentForeground: "0 0% 100%",

  muted: "220 16% 94%",
  mutedForeground: "220 10% 40%",

  border: "220 14% 88%",
  input: "220 14% 82%",
  ring: "196 92% 38%",

  success: "152 60% 34%",
  warning: "32 88% 42%",
  danger: "0 70% 46%",
  info: "212 88% 46%",
};

export const theme = {
  /**
   * Which palette applies when the visitor has expressed no preference.
   * `src/app/layout.tsx` and the no-flash script both read this.
   */
  defaultMode: "dark" as const,

  colors: { light, dark },

  typography: {
    /**
     * Font *variables*, not font names. `next/font` assigns the real families
     * to these CSS variables in the root layout, so swapping a typeface is a
     * one-line change there and nothing here moves.
     */
    fontFamily: {
      heading: "var(--font-sans)",
      body: "var(--font-sans)",
      mono: "var(--font-mono)",
    },
    /** [size, { lineHeight, letterSpacing }] — consumed by Tailwind directly. */
    fontSize: {
      "2xs": ["0.6875rem", { lineHeight: "1rem", letterSpacing: "0.02em" }],
      xs: ["0.75rem", { lineHeight: "1.125rem", letterSpacing: "0.01em" }],
      sm: ["0.875rem", { lineHeight: "1.375rem" }],
      base: ["1rem", { lineHeight: "1.625rem" }],
      lg: ["1.125rem", { lineHeight: "1.75rem" }],
      xl: ["1.25rem", { lineHeight: "1.875rem", letterSpacing: "-0.01em" }],
      "2xl": ["1.5rem", { lineHeight: "2rem", letterSpacing: "-0.015em" }],
      "3xl": ["1.875rem", { lineHeight: "2.25rem", letterSpacing: "-0.02em" }],
      "4xl": [
        "2.375rem",
        { lineHeight: "2.625rem", letterSpacing: "-0.025em" },
      ],
      "5xl": ["3rem", { lineHeight: "3.125rem", letterSpacing: "-0.03em" }],
      "6xl": ["3.75rem", { lineHeight: "3.875rem", letterSpacing: "-0.035em" }],
      "7xl": ["4.5rem", { lineHeight: "4.625rem", letterSpacing: "-0.04em" }],
    },
  },

  radius: {
    none: "0px",
    sm: "0.375rem",
    md: "0.625rem",
    lg: "0.875rem",
    xl: "1.125rem",
    "2xl": "1.5rem",
    full: "9999px",
  },

  /** Rhythm tokens. `section` is the vertical padding every `<Section>` uses. */
  spacing: {
    section: "5rem",
    sectionLg: "7rem",
    container: "1.5rem",
    gutter: "1rem",
  },

  /** Max width of the centred content column. */
  container: {
    maxWidth: "80rem",
  },

  /**
   * Soft, low-contrast shadows. Heavy drop shadows read as dated and fight the
   * dark palette, so elevation is carried mostly by `surface`/`elevated`.
   */
  shadow: {
    sm: "0 1px 2px 0 hsl(220 40% 2% / 0.28)",
    md: "0 4px 12px -2px hsl(220 40% 2% / 0.32)",
    lg: "0 12px 32px -8px hsl(220 40% 2% / 0.40)",
    glow: "0 0 0 1px hsl(var(--color-primary) / 0.28), 0 8px 32px -12px hsl(var(--color-primary) / 0.45)",
  },

  motion: {
    duration: {
      fast: "120ms",
      base: "200ms",
      slow: "380ms",
      slower: "640ms",
    },
    easing: {
      standard: "cubic-bezier(0.4, 0, 0.2, 1)",
      entrance: "cubic-bezier(0.16, 1, 0.3, 1)",
      exit: "cubic-bezier(0.4, 0, 1, 1)",
    },
  },

  /** Named layers so nothing reaches for an arbitrary `z-[9999]`. */
  zIndex: {
    base: "0",
    sticky: "20",
    header: "40",
    overlay: "50",
    modal: "60",
    toast: "70",
  },
} as const;

export type Theme = typeof theme;
export type ThemeMode = keyof typeof theme.colors;
