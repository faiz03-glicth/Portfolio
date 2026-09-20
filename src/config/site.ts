/**
 * Site identity and SEO defaults.
 *
 * Deliberately separate from `theme.ts` (how the site *looks*) and `app.ts`
 * (how the site *runs*). This file is only about who the site belongs to and
 * how it describes itself to crawlers and social cards.
 */

function resolveAppUrl(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  return "http://localhost:3000";
}

export const siteConfig = {
  name: "Ahmad Faiz",
  shortName: "Faiz",
  title: "Ahmad Faiz — Software Engineer",
  description:
    "Software engineer building reliable web systems — full-stack applications, data-backed services and the infrastructure that keeps them running.",
  url: resolveAppUrl(),
  locale: "en_MY",
  keywords: [
    "software engineer",
    "full-stack developer",
    "TypeScript",
    "Next.js",
    "React",
    "PostgreSQL",
    "portfolio",
  ],
  author: {
    name: "Ahmad Faiz",
    email: "faiz03@graduate.utm.my",
  },
  /** Handle without the leading `@`; omit to drop Twitter card attribution. */
  twitterHandle: undefined as string | undefined,
} as const;

export type SiteConfig = typeof siteConfig;
