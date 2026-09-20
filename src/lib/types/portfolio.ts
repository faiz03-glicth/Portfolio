/**
 * Core portfolio domain models.
 *
 * These are the shapes the UI renders. On `main` they are satisfied by the
 * static modules in `src/data/`; on `database` the same shapes come out of
 * Supabase repositories; on `integration` some are assembled from external
 * providers. The components never change, because the contract never does.
 */

export type Profile = {
  name: string;
  headline: string;
  /** One or two sentences, used in the hero and meta description. */
  summary: string;
  /** Longer prose for the About page. One string per paragraph. */
  bio: readonly string[];
  /** Optional; `Avatar` falls back to initials when absent. */
  avatarUrl?: string;
  location: string;
  websiteUrl?: string;
  email: string;
  /** Shown as a status pill in the hero. */
  availability: {
    status: "open" | "selective" | "unavailable";
    label: string;
  };
  resumeUrl?: string;
};

export type TechnologyCategory =
  | "languages"
  | "frameworks"
  | "backend"
  | "database"
  | "devops"
  | "cloud"
  | "tools"
  | "other";

export type Technology = {
  id: string;
  name: string;
  category: TechnologyCategory;
  /** Optional icon slug; falls back to the first letter of `name`. */
  icon?: string;
  /** Marks the handful of technologies worth surfacing on the homepage. */
  primary?: boolean;
};

export type ProjectStatus = "shipped" | "in-progress" | "archived" | "concept";

export type ProjectType =
  "web-app" | "api" | "library" | "tool" | "data" | "mobile";

/** Where a project record came from. `integration` populates the API sources. */
export type ProjectSource = "static" | "database" | "github" | "gitlab";

export type Project = {
  id: string;
  slug: string;
  title: string;
  /** One line, used on cards. */
  description: string;
  /** Full prose for the detail page. One string per paragraph. */
  overview?: readonly string[];
  /** Notable outcomes or decisions, rendered as a list on the detail page. */
  highlights?: readonly string[];
  imageUrl?: string;
  technologies: readonly string[];
  githubUrl?: string;
  gitlabUrl?: string;
  liveUrl?: string;
  featured: boolean;
  type: ProjectType;
  status: ProjectStatus;
  /** ISO date strings. `endDate` absent means ongoing. */
  startDate: string;
  endDate?: string;
  source: ProjectSource;
  /** Populated only for repository-backed projects. */
  stars?: number;
  forks?: number;
  primaryLanguage?: string;
  updatedAt?: string;
};

export type Experience = {
  id: string;
  title: string;
  company: string;
  companyUrl?: string;
  location?: string;
  /** Distinguishes employment from education and side work in the timeline. */
  kind: "work" | "education" | "project" | "volunteer";
  description: string;
  achievements?: readonly string[];
  technologies?: readonly string[];
  startDate: string;
  endDate?: string;
  current: boolean;
  sortOrder: number;
};

export type SocialPlatform =
  "github" | "gitlab" | "linkedin" | "email" | "spotify" | "x";

export type SocialLink = {
  id: string;
  platform: SocialPlatform;
  label: string;
  url: string;
  /** Handle shown alongside the label, e.g. `@faiz03-glicth`. */
  handle?: string;
};
