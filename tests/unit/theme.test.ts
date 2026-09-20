import { describe, expect, it } from "vitest";
import { theme, type ColorTokens } from "@/config/theme";
import { buildThemeStylesheet, colorVar } from "@/styles/theme-css";

/**
 * These tests guard the single-source-of-truth rule.
 *
 * `theme.ts` feeds both Tailwind and the runtime CSS variables, so a token
 * added to one palette but not the other, or a variable name that stops
 * matching what Tailwind expects, breaks colours silently at runtime. Here it
 * breaks the build instead.
 */
describe("theme palettes", () => {
  it("defines the same token set in light and dark", () => {
    const dark = Object.keys(theme.colors.dark).sort();
    const light = Object.keys(theme.colors.light).sort();
    expect(light).toEqual(dark);
  });

  it("stores colours as bare HSL channels, not finished colour strings", () => {
    // Tailwind composes these as `hsl(var(--x) / <alpha-value>)`. A literal
    // hex or an `hsl(...)` wrapper would break every opacity modifier.
    const pattern = /^\d{1,3} \d{1,3}(\.\d+)?% \d{1,3}(\.\d+)?%$/;

    for (const mode of ["light", "dark"] as const) {
      for (const [token, value] of Object.entries(theme.colors[mode])) {
        expect(value, `${mode}.${token}`).toMatch(pattern);
      }
    }
  });

  it("uses a mode that actually exists as the default", () => {
    expect(theme.colors).toHaveProperty(theme.defaultMode);
  });
});

describe("colorVar", () => {
  it("converts camelCase tokens to kebab-case variable names", () => {
    expect(colorVar("mutedForeground")).toBe("--color-muted-foreground");
    expect(colorVar("background")).toBe("--color-background");
  });
});

describe("buildThemeStylesheet", () => {
  const css = buildThemeStylesheet();

  it("emits every token for both explicit themes", () => {
    for (const token of Object.keys(
      theme.colors.dark,
    ) as (keyof ColorTokens)[]) {
      expect(css).toContain(colorVar(token));
    }
  });

  it("declares explicit overrides for both modes", () => {
    expect(css).toContain('[data-theme="light"]');
    expect(css).toContain('[data-theme="dark"]');
  });

  it("scopes the OS-preference query so an explicit choice still wins", () => {
    // Without :not([data-theme]) the media query would override a visitor's
    // explicit selection.
    expect(css).toContain(":root:not([data-theme])");
  });

  it("sets color-scheme so form controls and scrollbars match", () => {
    expect(css).toContain("color-scheme");
  });
});
