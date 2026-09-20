import type { MetadataRoute } from "next";
import { mainNav } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { portfolioService } from "@/lib/services/portfolio-service";
import { absoluteUrl } from "@/lib/utils";

/**
 * Generated from the same navigation config the header renders, so a new page
 * cannot be added to the site and forgotten in the sitemap.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await portfolioService.getProjects();
  const now = new Date();

  const pages: MetadataRoute.Sitemap = mainNav.map((item) => ({
    url: absoluteUrl(item.href, siteConfig.url),
    lastModified: now,
    changeFrequency: item.href === "/" ? "weekly" : "monthly",
    priority: item.href === "/" ? 1 : 0.8,
  }));

  const projectPages: MetadataRoute.Sitemap = projects.map((project) => ({
    url: absoluteUrl(`/projects/${project.slug}`, siteConfig.url),
    lastModified: project.updatedAt ? new Date(project.updatedAt) : now,
    changeFrequency: "monthly",
    priority: project.featured ? 0.7 : 0.5,
  }));

  return [...pages, ...projectPages];
}
