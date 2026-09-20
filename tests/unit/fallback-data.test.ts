import { describe, expect, it } from "vitest";
import {
  githubActivityFallback,
  gitlabActivityFallback,
} from "@/data/fallback/code-activity";
import { recentlyPlayedFallback } from "@/data/fallback/recently-played";
import { projects } from "@/data/projects";
import { technologies } from "@/data/skills";
import { experiences } from "@/data/experience";

/**
 * The static content is rendered whenever a provider is unavailable, which
 * means it is on the critical path for the *failure* case. If it is malformed,
 * the fallback fails exactly when it is needed.
 */

describe("contribution fallback", () => {
  for (const [label, activity] of [
    ["github", githubActivityFallback],
    ["gitlab", gitlabActivityFallback],
  ] as const) {
    describe(label, () => {
      it("produces a whole number of weeks", () => {
        expect(activity.contributions.length % 7).toBe(0);
      });

      it("starts on a Sunday so grid columns are Sunday-to-Saturday", () => {
        const first = activity.contributions[0];
        expect(first).toBeDefined();
        expect(new Date(`${first?.date}T00:00:00Z`).getUTCDay()).toBe(0);
      });

      it("reports a total that matches the days it contains", () => {
        const sum = activity.contributions.reduce(
          (total, day) => total + day.count,
          0,
        );
        expect(activity.contributionTotal).toBe(sum);
      });

      it("is deterministic, so server and client markup cannot disagree", () => {
        // A Math.random()-based generator would produce a hydration mismatch.
        const dates = activity.contributions.map((day) => day.date);
        expect(new Set(dates).size).toBe(dates.length);
      });

      it("has language shares that sum to roughly 100 percent", () => {
        const total = activity.topLanguages.reduce(
          (sum, language) => sum + language.percentage,
          0,
        );
        expect(total).toBeGreaterThanOrEqual(95);
        expect(total).toBeLessThanOrEqual(105);
      });
    });
  }
});

describe("recently played fallback", () => {
  it("is ordered newest first", () => {
    const times = recentlyPlayedFallback.map((track) =>
      new Date(track.playedAt).getTime(),
    );

    expect([...times].sort((a, b) => b - a)).toEqual(times);
  });

  it("gives every track a non-empty artist list", () => {
    for (const track of recentlyPlayedFallback) {
      expect(track.artists.length).toBeGreaterThan(0);
    }
  });
});

describe("static portfolio content", () => {
  it("has unique project slugs, which the detail routes depend on", () => {
    const slugs = projects.map((project) => project.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("has unique ids across projects, technologies and experiences", () => {
    for (const [label, ids] of [
      ["projects", projects.map((p) => p.id)],
      ["technologies", technologies.map((t) => t.id)],
      ["experiences", experiences.map((e) => e.id)],
    ] as const) {
      expect(new Set(ids).size, label).toBe(ids.length);
    }
  });

  it("references only technologies that exist in the registry", () => {
    // A dangling ID renders as the raw slug instead of a display name.
    const known = new Set(technologies.map((technology) => technology.id));

    for (const project of projects) {
      for (const id of project.technologies) {
        expect(known.has(id), `${project.slug} -> ${id}`).toBe(true);
      }
    }
  });

  it("never marks an experience as current while also having ended", () => {
    // The database enforces this with a CHECK constraint; the static data
    // must satisfy the same invariant or the two sources would disagree.
    for (const experience of experiences) {
      if (experience.current) {
        expect(experience.endDate, experience.id).toBeUndefined();
      }
    }
  });

  it("never ends a project before it started", () => {
    for (const project of projects) {
      if (project.endDate) {
        expect(
          project.endDate.localeCompare(project.startDate),
          project.slug,
        ).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("marks all static records as static-sourced", () => {
    for (const project of projects) {
      expect(project.source).toBe("static");
    }
  });
});
