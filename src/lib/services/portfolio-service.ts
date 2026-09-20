import { unstable_cache } from "next/cache";
import { appConfig } from "@/config/app";
import { experiences as staticExperiences } from "@/data/experience";
import { profile as staticProfile } from "@/data/profile";
import { projects as staticProjects } from "@/data/projects";
import { technologies as staticTechnologies } from "@/data/skills";
import { socialLinks as staticSocialLinks } from "@/data/social";
import {
  experienceRepository,
  profileRepository,
  projectRepository,
  socialLinkRepository,
  technologyRepository,
} from "@/lib/repositories";
import type { Project, Result } from "@/lib/types";

/**
 * The portfolio content service — the only thing pages and sections call.
 *
 * Its whole job is to make "is there a database?" someone else's problem.
 * Every method returns content, never a `Result`, because a page has nothing
 * useful to do with a database error: if Supabase is unconfigured, slow or
 * down, the static modules in `src/data/` are rendered instead and the visitor
 * sees a complete site.
 *
 * That is what keeps the promise made on the `main` branch intact after this
 * one lands — the database is an upgrade, not a dependency.
 */

/**
 * Runs a repository call and falls back to static content on any failure.
 *
 * A missing configuration is expected and silent. A real failure is logged
 * server-side, because a database that is configured but erroring is something
 * worth knowing about even though the page still renders.
 */
async function withFallback<T>(
  label: string,
  load: () => Promise<Result<T>>,
  fallback: T,
): Promise<T> {
  if (!appConfig.features.supabase) return fallback;

  const result = await load();

  if (result.ok) return result.data;

  if (result.error.code !== "not_configured") {
    console.warn(
      `[portfolio-service] ${label} fell back to static content (${result.error.code})`,
    );
  }

  return fallback;
}

/**
 * Wraps a loader in Next's data cache.
 *
 * Supabase queries do not go through `fetch`, so they are invisible to the
 * framework's automatic caching. `unstable_cache` is what gives them a
 * revalidation window and a tag that can be invalidated on demand.
 */
function cached<T>(
  keyParts: string[],
  tag: string,
  load: () => Promise<T>,
): () => Promise<T> {
  return unstable_cache(load, keyParts, {
    revalidate: appConfig.cache.content,
    tags: [CONTENT_TAG, tag],
  });
}

/** Revalidating this tag refreshes every piece of portfolio content. */
export const CONTENT_TAG = "portfolio-content";

export const portfolioService = {
  getProfile: cached(["portfolio", "profile"], "profile", () =>
    withFallback(
      "getProfile",
      () => profileRepository.findActive(),
      staticProfile,
    ),
  ),

  getProjects: cached(["portfolio", "projects"], "projects", () =>
    withFallback(
      "getProjects",
      () => projectRepository.findAll(),
      staticProjects,
    ),
  ),

  getFeaturedProjects: cached(
    ["portfolio", "projects", "featured"],
    "projects",
    () =>
      withFallback(
        "getFeaturedProjects",
        () => projectRepository.findFeatured(),
        staticProjects.filter((project) => project.featured),
      ),
  ),

  getExperiences: cached(["portfolio", "experiences"], "experiences", () =>
    withFallback(
      "getExperiences",
      () => experienceRepository.findAll(),
      [...staticExperiences].sort((a, b) => {
        if (a.sortOrder !== b.sortOrder) return b.sortOrder - a.sortOrder;
        return b.startDate.localeCompare(a.startDate);
      }),
    ),
  ),

  getTechnologies: cached(["portfolio", "technologies"], "technologies", () =>
    withFallback(
      "getTechnologies",
      () => technologyRepository.findAll(),
      staticTechnologies,
    ),
  ),

  getSocialLinks: cached(["portfolio", "social-links"], "social-links", () =>
    withFallback(
      "getSocialLinks",
      () => socialLinkRepository.findVisible(),
      staticSocialLinks,
    ),
  ),

  /**
   * Technology ID to display name, for resolving the IDs stored on projects
   * and experiences. Built from the same cached technology list rather than a
   * second query.
   */
  async getTechnologyNames(): Promise<Record<string, string>> {
    const technologies = await portfolioService.getTechnologies();
    return Object.fromEntries(
      technologies.map((technology) => [technology.id, technology.name]),
    );
  },

  /**
   * Not cached by `unstable_cache`: the key would have to include the slug,
   * and a per-slug cache entry for a page that is already statically
   * pre-rendered buys nothing.
   */
  async getProjectBySlug(slug: string): Promise<Project | undefined> {
    if (!appConfig.features.supabase) {
      return staticProjects.find((project) => project.slug === slug);
    }

    const result = await projectRepository.findBySlug(slug);
    if (result.ok) return result.data;

    if (result.error.code === "not_found") return undefined;

    console.warn(
      `[portfolio-service] getProjectBySlug fell back to static content (${result.error.code})`,
    );
    return staticProjects.find((project) => project.slug === slug);
  },

  /** Slugs for `generateStaticParams`. Falls back to the static set. */
  async getProjectSlugs(): Promise<string[]> {
    const fallback = staticProjects.map((project) => project.slug);
    return withFallback(
      "getProjectSlugs",
      () => projectRepository.findAllSlugs(),
      fallback,
    );
  },
};
