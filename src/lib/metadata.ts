import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { absoluteUrl } from "./utils";

/**
 * Builds page metadata from the site config.
 *
 * Every page routes through this so titles, canonicals and social cards stay
 * consistent — and so changing the site name is a one-line edit in `site.ts`.
 */
export function buildMetadata({
  title,
  description = siteConfig.description,
  path = "/",
  noIndex = false,
}: {
  /** Page title without the site suffix; omit for the homepage. */
  title?: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
} = {}): Metadata {
  const resolvedTitle = title
    ? `${title} — ${siteConfig.name}`
    : siteConfig.title;
  const url = absoluteUrl(path, siteConfig.url);

  return {
    title: resolvedTitle,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      title: resolvedTitle,
      description,
      url,
      locale: siteConfig.locale,
      // No `images` here on purpose: `src/app/opengraph-image.tsx` is picked up
      // by Next's file convention and applies to every route. Setting it in
      // both places would emit two conflicting og:image tags.
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description,
      ...(siteConfig.twitterHandle
        ? { creator: `@${siteConfig.twitterHandle}` }
        : {}),
    },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}
