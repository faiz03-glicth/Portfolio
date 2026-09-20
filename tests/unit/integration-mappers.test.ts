import { describe, expect, it } from "vitest";
import { toRecentlyPlayed } from "@/lib/integrations/spotify/mapper";
import {
  toCodeActivity as toGitHubActivity,
  toProject as toGitHubProject,
} from "@/lib/integrations/github/mapper";
import {
  toContributionDays,
  toProject as toGitLabProject,
} from "@/lib/integrations/gitlab/mapper";
import type {
  GitHubRepository,
  GitHubUser,
} from "@/lib/integrations/github/types";
import type { GitLabProject } from "@/lib/integrations/gitlab/types";

/**
 * Mapper tests are the highest-value unit tests in this project.
 *
 * Mappers are the boundary where a vendor's shape becomes the application's
 * shape. Everything downstream — every component, every page — assumes that
 * translation is correct, and none of it can detect a bad one. A missing
 * optional field or a wrong sort order here surfaces as a confusing UI bug
 * three layers away.
 */

describe("spotify mapper", () => {
  const item = (overrides: Record<string, unknown> = {}) => ({
    track: {
      id: "track-1",
      name: "Weightless",
      duration_ms: 487_000,
      artists: [{ id: "a1", name: "Marconi Union" }],
      album: {
        id: "al1",
        name: "Weightless",
        images: [
          { url: "https://img/640", height: 640, width: 640 },
          { url: "https://img/300", height: 300, width: 300 },
          { url: "https://img/64", height: 64, width: 64 },
        ],
      },
      external_urls: { spotify: "https://open.spotify.com/track/1" },
      ...overrides,
    },
    played_at: "2026-09-20T10:00:00.000Z",
  });

  it("normalises a track", () => {
    const [track] = toRecentlyPlayed({ items: [item()] });

    expect(track).toMatchObject({
      id: "track-1",
      name: "Weightless",
      artists: ["Marconi Union"],
      album: "Weightless",
      spotifyUrl: "https://open.spotify.com/track/1",
      playedAt: "2026-09-20T10:00:00.000Z",
      durationMs: 487_000,
    });
  });

  it("picks the smallest image at least 160px rather than the original", () => {
    // Art renders at 48px. Fetching the 640px original on every card would
    // waste bandwidth for no visible gain.
    const [track] = toRecentlyPlayed({ items: [item()] });
    expect(track?.albumImage).toBe("https://img/300");
  });

  it("falls back to the largest image when none reaches 160px", () => {
    const [track] = toRecentlyPlayed({
      items: [
        item({
          album: {
            id: "al1",
            name: "Small",
            images: [{ url: "https://img/64", height: 64, width: 64 }],
          },
        }),
      ],
    });

    expect(track?.albumImage).toBe("https://img/64");
  });

  it("tolerates an album with no artwork", () => {
    const [track] = toRecentlyPlayed({
      items: [item({ album: { id: "al1", name: "Bare", images: [] } })],
    });

    expect(track?.albumImage).toBeUndefined();
  });

  it("synthesises an id for a local file, which has none", () => {
    const [track] = toRecentlyPlayed({ items: [item({ id: null })] });
    expect(track?.id).toBe("local-2026-09-20T10:00:00.000Z");
  });

  it("falls back to Spotify's home page rather than rendering a dead link", () => {
    const [track] = toRecentlyPlayed({ items: [item({ external_urls: {} })] });
    expect(track?.spotifyUrl).toBe("https://open.spotify.com");
  });

  it("joins multiple artists in order", () => {
    const [track] = toRecentlyPlayed({
      items: [
        item({
          artists: [
            { id: "a1", name: "Kavinsky" },
            { id: "a2", name: "Lovefoxxx" },
          ],
        }),
      ],
    });

    expect(track?.artists).toEqual(["Kavinsky", "Lovefoxxx"]);
  });

  it("sorts newest first regardless of the order received", () => {
    const older = { ...item(), played_at: "2026-09-19T10:00:00.000Z" };
    const newer = { ...item(), played_at: "2026-09-20T10:00:00.000Z" };

    const tracks = toRecentlyPlayed({ items: [older, newer] });
    expect(tracks[0]?.playedAt).toBe("2026-09-20T10:00:00.000Z");
  });

  it("returns an empty list when items is missing entirely", () => {
    expect(
      toRecentlyPlayed({} as Parameters<typeof toRecentlyPlayed>[0]),
    ).toEqual([]);
  });
});

describe("github mapper", () => {
  const repository = (overrides: Partial<GitHubRepository> = {}) =>
    ({
      id: 1,
      name: "atlas",
      full_name: "user/atlas",
      description: "Observability dashboard",
      html_url: "https://github.com/user/atlas",
      language: "TypeScript",
      topics: ["postgres", "nextjs"],
      stargazers_count: 12,
      forks_count: 3,
      pushed_at: "2026-09-01T00:00:00Z",
      updated_at: "2026-08-01T00:00:00Z",
      fork: false,
      archived: false,
      private: false,
      ...overrides,
    }) satisfies GitHubRepository;

  it("normalises a repository into the shared Project shape", () => {
    const project = toGitHubProject(repository());

    expect(project).toMatchObject({
      id: "github-1",
      title: "atlas",
      description: "Observability dashboard",
      githubUrl: "https://github.com/user/atlas",
      source: "github",
      status: "shipped",
      stars: 12,
      forks: 3,
      primaryLanguage: "TypeScript",
    });
  });

  it("prepends the primary language so there is always one chip", () => {
    expect(toGitHubProject(repository()).technologies).toEqual([
      "TypeScript",
      "postgres",
      "nextjs",
    ]);
  });

  it("marks an archived repository as archived", () => {
    expect(toGitHubProject(repository({ archived: true })).status).toBe(
      "archived",
    );
  });

  it("prefers pushed_at over updated_at for recency", () => {
    // updated_at changes on metadata edits; pushed_at tracks actual work.
    expect(toGitHubProject(repository()).updatedAt).toBe(
      "2026-09-01T00:00:00Z",
    );
  });

  it("falls back to updated_at when a repository has never been pushed", () => {
    expect(toGitHubProject(repository({ pushed_at: null })).updatedAt).toBe(
      "2026-08-01T00:00:00Z",
    );
  });

  it("supplies placeholder copy rather than rendering an empty card", () => {
    expect(toGitHubProject(repository({ description: null })).description).toBe(
      "No description provided.",
    );
  });

  it("never marks a discovered repository as featured", () => {
    // A repository must not be able to promote itself onto the homepage.
    expect(toGitHubProject(repository()).featured).toBe(false);
  });

  const user: GitHubUser = {
    login: "user",
    name: "User",
    html_url: "https://github.com/user",
    public_repos: 41,
    followers: 15,
  };

  it("computes language share from repository counts", () => {
    const activity = toGitHubActivity({
      user,
      repositories: [
        repository({ id: 1, language: "TypeScript" }),
        repository({ id: 2, language: "TypeScript" }),
        repository({ id: 3, language: "Python" }),
        repository({ id: 4, language: null }),
      ],
      contributions: null,
    });

    expect(activity.topLanguages).toEqual([
      { name: "TypeScript", percentage: 67 },
      { name: "Python", percentage: 33 },
    ]);
  });

  it("returns an empty calendar when no token supplied contributions", () => {
    const activity = toGitHubActivity({
      user,
      repositories: [repository()],
      contributions: null,
    });

    expect(activity.contributions).toEqual([]);
    expect(activity.contributionTotal).toBe(0);
  });

  it("flattens the GraphQL contribution calendar", () => {
    const activity = toGitHubActivity({
      user,
      repositories: [],
      contributions: {
        data: {
          user: {
            contributionsCollection: {
              contributionCalendar: {
                totalContributions: 5,
                weeks: [
                  {
                    contributionDays: [
                      { date: "2026-09-01", contributionCount: 2 },
                      { date: "2026-09-02", contributionCount: 3 },
                    ],
                  },
                ],
              },
            },
          },
        },
      },
    });

    expect(activity.contributionTotal).toBe(5);
    expect(activity.contributions).toEqual([
      { date: "2026-09-01", count: 2 },
      { date: "2026-09-02", count: 3 },
    ]);
  });

  it("sums stars across repositories", () => {
    const activity = toGitHubActivity({
      user,
      repositories: [
        repository({ id: 1, stargazers_count: 10 }),
        repository({ id: 2, stargazers_count: 5 }),
      ],
      contributions: null,
    });

    expect(activity.totalStars).toBe(15);
  });
});

describe("gitlab mapper", () => {
  const project = (overrides: Partial<GitLabProject> = {}) =>
    ({
      id: 7,
      name: "signal",
      path: "signal",
      path_with_namespace: "user/signal",
      description: "Job runner",
      web_url: "https://gitlab.com/user/signal",
      topics: ["postgres"],
      star_count: 4,
      forks_count: 1,
      last_activity_at: "2026-09-10T00:00:00Z",
      created_at: "2025-06-01T00:00:00Z",
      archived: false,
      visibility: "public",
      default_branch: "main",
      ...overrides,
    }) satisfies GitLabProject;

  it("produces the same Project shape GitHub does, differing only in source", () => {
    const mapped = toGitLabProject(project());

    expect(mapped).toMatchObject({
      id: "gitlab-7",
      title: "signal",
      gitlabUrl: "https://gitlab.com/user/signal",
      source: "gitlab",
      stars: 4,
      forks: 1,
    });
  });

  it("reads the legacy tag_list when a self-hosted instance omits topics", () => {
    const mapped = toGitLabProject(
      project({ topics: undefined, tag_list: ["legacy", "tags"] }),
    );

    expect(mapped.technologies).toEqual(["legacy", "tags"]);
  });

  it("prefers topics when both keys are present", () => {
    const mapped = toGitLabProject(
      project({ topics: ["modern"], tag_list: ["legacy"] }),
    );

    expect(mapped.technologies).toEqual(["modern"]);
  });
});

describe("gitlab contribution approximation", () => {
  it("counts events onto their calendar day", () => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const key = today.toISOString().slice(0, 10);

    const { days, total } = toContributionDays([
      { id: 1, action_name: "pushed to", created_at: `${key}T09:00:00Z` },
      { id: 2, action_name: "pushed to", created_at: `${key}T11:00:00Z` },
    ]);

    const match = days.find((day) => day.date === key);

    // The window ends on the most recent Sunday, so today is only inside it
    // when today *is* that Sunday. Assert on whichever case applies rather
    // than on the calendar happening to be convenient.
    if (match) {
      expect(match.count).toBe(2);
      expect(total).toBe(2);
    } else {
      expect(total).toBe(0);
    }
  });

  it("emits a complete rectangle, including empty days", () => {
    const { days } = toContributionDays([]);

    expect(days).toHaveLength(371);
    expect(days.every((day) => day.count === 0)).toBe(true);
    // 371 days is exactly 53 weeks, so the grid has no ragged edge.
    expect(days.length % 7).toBe(0);
  });

  it("ends the window on a Sunday so weeks render as clean columns", () => {
    const { days } = toContributionDays([]);
    const first = days[0];
    expect(first).toBeDefined();
    expect(new Date(`${first?.date}T00:00:00Z`).getUTCDay()).toBe(0);
  });

  it("ignores events outside the window instead of throwing", () => {
    const { total } = toContributionDays([
      { id: 1, action_name: "pushed to", created_at: "2001-01-01T00:00:00Z" },
    ]);

    expect(total).toBe(0);
  });
});
