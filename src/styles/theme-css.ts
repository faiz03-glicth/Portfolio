import { theme, type ColorTokens, type ThemeMode } from "@/config/theme";

/**
 * Serialises the palettes in `src/config/theme.ts` into CSS custom properties.
 *
 * Only *colours* become runtime variables, because colours are the one token
 * group that changes after the bundle is built (light ⇄ dark). Radii, motion
 * and type scale are resolved statically by Tailwind at build time, so putting
 * them in CSS too would just be a second copy waiting to drift.
 */

/** `mutedForeground` -> `muted-foreground` */
function toKebabCase(value: string): string {
  return value.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);
}

/** The CSS custom property name for a colour token. */
export function colorVar(token: keyof ColorTokens): string {
  return `--color-${toKebabCase(token)}`;
}

function declarations(tokens: ColorTokens): string {
  return (Object.keys(tokens) as Array<keyof ColorTokens>)
    .map((token) => `${colorVar(token)}: ${tokens[token]};`)
    .join("");
}

function paletteFor(mode: ThemeMode): string {
  return declarations(theme.colors[mode]);
}

/**
 * The full stylesheet injected by the root layout.
 *
 * Selector strategy, in cascade order:
 *   `:root`                                  the default palette
 *   `@media (prefers-color-scheme: dark)`    honour the OS, but only while the
 *                                            visitor has not chosen explicitly
 *   `[data-theme="light"|"dark"]`            an explicit choice always wins
 */
export function buildThemeStylesheet(): string {
  const fallback = theme.defaultMode;
  const other: ThemeMode = fallback === "dark" ? "light" : "dark";

  return [
    `:root{color-scheme:${fallback};${paletteFor(fallback)}}`,
    `@media (prefers-color-scheme:${other}){:root:not([data-theme]){color-scheme:${other};${paletteFor(other)}}}`,
    `:root[data-theme="light"]{color-scheme:light;${paletteFor("light")}}`,
    `:root[data-theme="dark"]{color-scheme:dark;${paletteFor("dark")}}`,
  ].join("");
}
