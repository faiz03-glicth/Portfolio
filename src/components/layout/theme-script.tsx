import { theme } from "@/config/theme";

export const THEME_STORAGE_KEY = "portfolio-theme";

/**
 * Resolves and applies the theme before first paint.
 *
 * This has to be a blocking inline script in `<head>`. Anything running after
 * hydration is too late — the visitor would see a flash of the wrong palette.
 *
 * It always writes an explicit `data-theme`, never leaving the attribute off,
 * because Tailwind's `dark:` variant is bound to `[data-theme="dark"]`. If the
 * attribute were absent while the OS preference supplied a dark palette, the
 * colours and the `dark:` utilities would disagree.
 *
 * The media query in `theme-css.ts` remains as the no-JavaScript fallback:
 * without this script, `:root:not([data-theme])` still follows the OS.
 */
export function ThemeScript() {
  const fallback = theme.defaultMode;
  const other = fallback === "dark" ? "light" : "dark";

  const script = `
(function(){
  var d = document.documentElement;
  var mode = ${JSON.stringify(fallback)};
  try {
    var stored = localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
    if (stored === "light" || stored === "dark") {
      mode = stored;
    } else if (window.matchMedia("(prefers-color-scheme: ${other})").matches) {
      mode = ${JSON.stringify(other)};
    }
  } catch (e) {}
  d.setAttribute("data-theme", mode);
})();`.trim();

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
