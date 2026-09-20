import { describe, expect, it } from "vitest";
import {
  toExperience,
  toProfile,
  toProject,
  toSocialLink,
  toTechnology,
} from "@/lib/repositories/mappers";
import type {
  ExperienceRow,
  ProfileRow,
  ProjectWithTechnologiesRow,
  SocialLinkRow,
  TechnologyRow,
} from "@/lib/supabase/database.types";

/**
 * Row-to-domain translation.
 *
 * The contract these enforce: nullable columns become *absent* properties, not
 * `null`. Components use `?.` and `??`, so a leaked `null` would render as
 * empty markup rather than being skipped — a subtle, ugly failure.
 */

const timestamps = {
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-02-01T00:00:00Z",
};

describe("toProfile", () => {
  const row = (overrides: Partial<ProfileRow> = {}): ProfileRow => ({
    id: "p1",
    name: "Ahmad Faiz",
    headline: "Software Engineer",
    summary: "Builds things.",
    bio: ["One.", "Two."],
    avatar_url: null,
    location: "Johor, Malaysia",
    website_url: null,
    email: "a@b.com",
    resume_url: null,
    availability_status: "open",
    availability_label: "Open to opportunities",
    is_active: true,
    ...timestamps,
    ...overrides,
  });

  it("nests availability into the shape the badge expects", () => {
    expect(toProfile(row()).availability).toEqual({
      status: "open",
      label: "Open to opportunities",
    });
  });

  it("turns null columns into undefined, not null", () => {
    const profile = toProfile(row());

    expect(profile.avatarUrl).toBeUndefined();
    expect(profile.websiteUrl).toBeUndefined();
    expect(profile.resumeUrl).toBeUndefined();
  });

  it("preserves a populated optional column", () => {
    expect(toProfile(row({ avatar_url: "/a.png" })).avatarUrl).toBe("/a.png");
  });
});

describe("toProject", () => {
  const row = (
    overrides: Partial<ProjectWithTechnologiesRow> = {},
  ): ProjectWithTechnologiesRow => ({
    id: "prj1",
    slug: "atlas",
    title: "Atlas",
    description: "Observability.",
    overview: [],
    highlights: [],
    image_url: null,
    github_url: "https://github.com/u/atlas",
    gitlab_url: null,
    live_url: null,
    featured: true,
    type: "web-app",
    status: "shipped",
    start_date: "2025-02-01",
    end_date: null,
    primary_language: "TypeScript",
    sort_order: 100,
    project_technologies: [],
    ...timestamps,
    ...overrides,
  });

  it("marks the record as database-sourced", () => {
    expect(toProject(row()).source).toBe("database");
  });

  it("collapses empty arrays to undefined so callers need one check", () => {
    // `default '{}'` means these are never null, always []. Without this,
    // every consumer would need `x && x.length > 0`.
    const project = toProject(row());

    expect(project.overview).toBeUndefined();
    expect(project.highlights).toBeUndefined();
  });

  it("keeps populated arrays", () => {
    const project = toProject(row({ overview: ["Para."] }));
    expect(project.overview).toEqual(["Para."]);
  });

  it("orders embedded technologies by sort_order", () => {
    // PostgREST does not order embedded rows, so without an explicit sort the
    // chips would shuffle between requests.
    const project = toProject(
      row({
        project_technologies: [
          { technology_id: "postgresql", sort_order: 30 },
          { technology_id: "typescript", sort_order: 10 },
          { technology_id: "nextjs", sort_order: 20 },
        ],
      }),
    );

    expect(project.technologies).toEqual([
      "typescript",
      "nextjs",
      "postgresql",
    ]);
  });

  it("tolerates a missing embedded relation", () => {
    const project = toProject(
      row({
        project_technologies:
          undefined as unknown as ProjectWithTechnologiesRow["project_technologies"],
      }),
    );

    expect(project.technologies).toEqual([]);
  });
});

describe("toExperience", () => {
  const row = (overrides: Partial<ExperienceRow> = {}): ExperienceRow => ({
    id: "e1",
    title: "Engineer",
    company: "Independent",
    company_url: null,
    location: null,
    kind: "work",
    description: "Did things.",
    achievements: [],
    technologies: [],
    start_date: "2024-01-01",
    end_date: null,
    is_current: true,
    sort_order: 90,
    ...timestamps,
    ...overrides,
  });

  it("renames is_current to current", () => {
    expect(toExperience(row()).current).toBe(true);
  });

  it("collapses empty achievement and technology arrays", () => {
    const experience = toExperience(row());

    expect(experience.achievements).toBeUndefined();
    expect(experience.technologies).toBeUndefined();
  });

  it("carries sort_order through for the timeline", () => {
    expect(toExperience(row()).sortOrder).toBe(90);
  });
});

describe("toTechnology", () => {
  const row: TechnologyRow = {
    id: "typescript",
    name: "TypeScript",
    category: "languages",
    icon: null,
    is_primary: true,
    sort_order: 10,
    ...timestamps,
  };

  it("renames is_primary to primary", () => {
    expect(toTechnology(row).primary).toBe(true);
  });

  it("drops a null icon", () => {
    expect(toTechnology(row).icon).toBeUndefined();
  });
});

describe("toSocialLink", () => {
  const row: SocialLinkRow = {
    id: "github",
    platform: "github",
    label: "GitHub",
    url: "https://github.com/u",
    handle: null,
    sort_order: 10,
    is_visible: true,
    ...timestamps,
  };

  it("drops a null handle", () => {
    expect(toSocialLink(row).handle).toBeUndefined();
  });

  it("carries the platform through for icon selection", () => {
    expect(toSocialLink(row).platform).toBe("github");
  });
});
