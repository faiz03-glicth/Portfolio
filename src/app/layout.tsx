import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { siteConfig } from "@/config/site";
import { theme } from "@/config/theme";
import { buildThemeStylesheet } from "@/styles/theme-css";
import { buildMetadata } from "@/lib/metadata";
import { ThemeScript } from "@/components/layout/theme-script";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/navigation/navbar";
import "@/styles/globals.css";

/**
 * Typefaces are bound to the CSS variables that `theme.ts` names. Swapping a
 * font is a change here and nowhere else — the theme refers to
 * `var(--font-sans)`, never to "Inter".
 */
const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  ...buildMetadata(),
  title: {
    default: siteConfig.title,
    template: `%s — ${siteConfig.name}`,
  },
  keywords: [...siteConfig.keywords],
  authors: [{ name: siteConfig.author.name }],
  creator: siteConfig.author.name,
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Both entries let the browser tint its chrome to match either palette.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0d12" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // `suppressHydrationWarning`: ThemeScript writes `data-theme` onto this
    // element before React hydrates, which is a deliberate mismatch.
    <html
      lang="en"
      dir="ltr"
      data-theme={theme.defaultMode}
      suppressHydrationWarning
      className={`${sans.variable} ${mono.variable}`}
    >
      <head>
        {/*
          Palettes are serialised from `src/config/theme.ts` at render time and
          inlined, so there is no extra request and no flash of unstyled colour.
        */}
        <style
          id="theme-tokens"
          dangerouslySetInnerHTML={{ __html: buildThemeStylesheet() }}
        />
        <ThemeScript />
      </head>
      <body className="flex min-h-dvh flex-col">
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        <Navbar />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
