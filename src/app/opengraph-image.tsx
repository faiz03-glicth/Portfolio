import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";
import { theme } from "@/config/theme";

export const alt = siteConfig.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Social card, generated at build time rather than shipped as a static PNG —
 * it stays in sync with `site.ts` and `theme.ts` instead of going stale.
 *
 * No custom font is fetched: a network call here would make the build depend
 * on an external service, and the default typeface is perfectly legible at
 * this size.
 */
export default function OpengraphImage() {
  const palette = theme.colors.dark;
  const hsl = (channels: string) => `hsl(${channels})`;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: hsl(palette.background),
        backgroundImage: `radial-gradient(circle at 80% 0%, hsl(${palette.primary} / 0.22), transparent 55%), radial-gradient(circle at 0% 100%, hsl(${palette.accent} / 0.18), transparent 50%)`,
        padding: 72,
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: 999,
            background: hsl(palette.primary),
          }}
        />
        <div
          style={{
            color: hsl(palette.mutedForeground),
            fontSize: 26,
            letterSpacing: 4,
            textTransform: "uppercase",
          }}
        >
          {siteConfig.author.name}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div
          style={{
            color: hsl(palette.foreground),
            fontSize: 76,
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: -2,
          }}
        >
          {siteConfig.title}
        </div>
        <div
          style={{
            color: hsl(palette.mutedForeground),
            fontSize: 30,
            lineHeight: 1.4,
            maxWidth: 900,
          }}
        >
          {siteConfig.description}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          color: hsl(palette.mutedForeground),
          fontSize: 24,
        }}
      >
        <div style={{ display: "flex" }}>
          {siteConfig.url.replace(/^https?:\/\//, "")}
        </div>
        <div style={{ display: "flex", color: hsl(palette.border) }}>|</div>
        <div style={{ display: "flex" }}>TypeScript · Next.js · PostgreSQL</div>
      </div>
    </div>,
    size,
  );
}
