import type {
  ExperienceRow,
  ProfileRow,
  ProjectWithTechnologiesRow,
  SocialLinkRow,
  TechnologyRow,
} from "@/lib/supabase/database.types";
import type {
  Experience,
  Profile,
  Project,
  SocialLink,
  Technology,
} from "@/lib/types";

/**
 * Row → domain model translation.
 *
 * This is the boundary where database naming stops. Everything past here sees
 * `avatarUrl`, not `avatar_url`; `current`, not `is_current`. Keeping the
 * mapping in one file means a column rename is a single edit, and means the
 * UI never has to know which storage shape it happens to be reading.
 *
 * Nullable columns become optional properties rather than `T | null`, so
 * consumers use `?.` and `??` instead of checking for null explicitly.
 */

/** `null` columns become `undefined` so they read as "absent", not "empty". */
function optional(value: string | null): string | undefined {
  return value ?? undefined;
}

export function toProfile(row: ProfileRow): Profile {
  return {
    name: row.name,
    headline: row.headline,
    summary: row.summary,
    bio: row.bio,
    avatarUrl: optional(row.avatar_url),
    location: row.location,
    websiteUrl: optional(row.website_url),
    email: row.email,
    resumeUrl: optional(row.resume_url),
    availability: {
      status: row.availability_status,
      label: row.availability_label,
    },
  };
}

export function toTechnology(row: TechnologyRow): Technology {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    icon: optional(row.icon),
    primary: row.is_primary,
  };
}

export function toProject(row: ProjectWithTechnologiesRow): Project {
  // PostgREST does not order embedded rows, so sort them here rather than
  // letting the chip order shuffle between requests.
  const technologies = [...(row.project_technologies ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((link) => link.technology_id);

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    // Empty arrays from `default '{}'` become undefined, so callers can use a
    // single truthiness check instead of also testing `.length`.
    overview: row.overview.length > 0 ? row.overview : undefined,
    highlights: row.highlights.length > 0 ? row.highlights : undefined,
    imageUrl: optional(row.image_url),
    technologies,
    githubUrl: optional(row.github_url),
    gitlabUrl: optional(row.gitlab_url),
    liveUrl: optional(row.live_url),
    featured: row.featured,
    type: row.type,
    status: row.status,
    startDate: row.start_date,
    endDate: optional(row.end_date),
    source: "database",
    primaryLanguage: optional(row.primary_language),
    updatedAt: row.updated_at,
  };
}

export function toExperience(row: ExperienceRow): Experience {
  return {
    id: row.id,
    title: row.title,
    company: row.company,
    companyUrl: optional(row.company_url),
    location: optional(row.location),
    kind: row.kind,
    description: row.description,
    achievements: row.achievements.length > 0 ? row.achievements : undefined,
    technologies: row.technologies.length > 0 ? row.technologies : undefined,
    startDate: row.start_date,
    endDate: optional(row.end_date),
    current: row.is_current,
    sortOrder: row.sort_order,
  };
}

export function toSocialLink(row: SocialLinkRow): SocialLink {
  return {
    id: row.id,
    platform: row.platform,
    label: row.label,
    url: row.url,
    handle: optional(row.handle),
  };
}
