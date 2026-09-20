import type { MetadataRoute } from "next";
import { appConfig } from "@/config/app";
import { siteConfig } from "@/config/site";
import { absoluteUrl } from "@/lib/utils";

export default function robots(): MetadataRoute.Robots {
  // Non-production environments must never be indexed — a staging copy
  // outranking the real site is a genuinely annoying problem to undo.
  if (!appConfig.isProduction) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: absoluteUrl("/sitemap.xml", siteConfig.url),
    host: siteConfig.url,
  };
}
