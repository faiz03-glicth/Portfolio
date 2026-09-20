import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Project } from "@/lib/types";

/**
 * The unified project list.
 *
 * This is where the three sources meet, so it is where the interesting bugs
 * live: duplicates when a curated project and a repository describe the same
 * work, and an empty list when one provider is down.
 */

const portfolioMock = {
  getProjects: vi.fn(),
  getFeaturedProjects: vi.fn(),
  getProjectBySlug: vi.fn(),
};

const githubMock = { isConfigured: vi.fn(), getProjects: vi.fn() };
const gitlabMock = { isConfigured: vi.fn(), getProjects: vi.fn() };

vi.mock("@/lib/services/portfolio-service", () => ({
  portfolioService: portfolioMock,
}));
vi.mock("@/lib/integrations/github", () => ({ githubService: githubMock }));
vi.mock("@/lib/integrations/gitlab", () => ({ gitlabService: gitlabMock }));

const { projectService } = await import("@/lib/services/project-service");

function project(overrides: Partial<Project> = {}): Project {
  return {
    id: "p1",
    slug: "atlas",
    title: "Atlas",
    description: "Observability.",
    technologies: [],
    featured: false,
    type: "web-app",
    status: "shipped",
    startDate: "2025-01-01",
    source: "database",
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  portfolioMock.getProjects.mockResolvedValue([]);
  portfolioMock.getFeaturedProjects.mockResolvedValue([]);
  githubMock.isConfigured.mockReturnValue(false);
  gitlabMock.isConfigured.mockReturnValue(false);
});

describe("getProjects", () => {
  it("returns curated projects when no provider is configured", async () => {
    portfolioMock.getProjects.mockResolvedValue([project()]);

    const result = await projectService.getProjects();

    expect(result).toHaveLength(1);
    expect(githubMock.getProjects).not.toHaveBeenCalled();
  });

  it("appends repositories that no curated project covers", async () => {
    portfolioMock.getProjects.mockResolvedValue([project()]);
    githubMock.isConfigured.mockReturnValue(true);
    githubMock.getProjects.mockResolvedValue({
      ok: true,
      data: [
        project({
          id: "gh-2",
          slug: "other",
          title: "Other",
          source: "github",
          githubUrl: "https://github.com/u/other",
        }),
      ],
    });

    const result = await projectService.getProjects();

    expect(result.map((p) => p.title).sort()).toEqual(["Atlas", "Other"]);
  });

  it("drops a repository a curated project already points at", async () => {
    portfolioMock.getProjects.mockResolvedValue([
      project({ githubUrl: "https://github.com/u/atlas" }),
    ]);
    githubMock.isConfigured.mockReturnValue(true);
    githubMock.getProjects.mockResolvedValue({
      ok: true,
      data: [
        project({
          id: "gh-1",
          slug: "atlas",
          title: "atlas",
          source: "github",
          githubUrl: "https://github.com/u/atlas",
        }),
      ],
    });

    const result = await projectService.getProjects();

    expect(result).toHaveLength(1);
    // The curated record wins: it has the write-up.
    expect(result[0]?.source).toBe("database");
  });

  it.each([
    ["a .git suffix", "https://github.com/u/atlas.git"],
    ["a trailing slash", "https://github.com/u/atlas/"],
    ["different casing", "https://github.com/U/Atlas"],
    ["a different scheme", "http://github.com/u/atlas"],
  ])("still matches despite %s", async (_label, curatedUrl) => {
    portfolioMock.getProjects.mockResolvedValue([
      project({ githubUrl: curatedUrl }),
    ]);
    githubMock.isConfigured.mockReturnValue(true);
    githubMock.getProjects.mockResolvedValue({
      ok: true,
      data: [
        project({
          id: "gh-1",
          slug: "atlas",
          source: "github",
          githubUrl: "https://github.com/u/atlas",
        }),
      ],
    });

    expect(await projectService.getProjects()).toHaveLength(1);
  });

  it("does not list the same repository twice when mirrored to both forges", async () => {
    githubMock.isConfigured.mockReturnValue(true);
    gitlabMock.isConfigured.mockReturnValue(true);

    const shared = "https://github.com/u/mirror";
    githubMock.getProjects.mockResolvedValue({
      ok: true,
      data: [
        project({
          id: "gh",
          slug: "mirror",
          source: "github",
          githubUrl: shared,
        }),
      ],
    });
    gitlabMock.getProjects.mockResolvedValue({
      ok: true,
      data: [
        project({
          id: "gl",
          slug: "mirror",
          source: "gitlab",
          githubUrl: shared,
        }),
      ],
    });

    expect(await projectService.getProjects()).toHaveLength(1);
  });

  it("keeps the database list when a provider fails", async () => {
    // The point of the whole design: GitHub being down must not empty a list
    // the database could have filled on its own.
    portfolioMock.getProjects.mockResolvedValue([project()]);
    githubMock.isConfigured.mockReturnValue(true);
    githubMock.getProjects.mockResolvedValue({
      ok: false,
      error: { code: "network_error", message: "unreachable" },
    });

    const result = await projectService.getProjects();

    expect(result).toHaveLength(1);
    expect(result[0]?.title).toBe("Atlas");
  });

  it("still returns the working provider when the other fails", async () => {
    githubMock.isConfigured.mockReturnValue(true);
    gitlabMock.isConfigured.mockReturnValue(true);

    githubMock.getProjects.mockResolvedValue({
      ok: false,
      error: { code: "rate_limited", message: "slow down" },
    });
    gitlabMock.getProjects.mockResolvedValue({
      ok: true,
      data: [
        project({
          id: "gl",
          slug: "signal",
          title: "Signal",
          source: "gitlab",
          gitlabUrl: "https://gitlab.com/u/signal",
        }),
      ],
    });

    const result = await projectService.getProjects();

    expect(result.map((p) => p.title)).toEqual(["Signal"]);
  });

  it("sorts featured first, then most recently updated", async () => {
    portfolioMock.getProjects.mockResolvedValue([
      project({ id: "a", slug: "a", title: "Old", updatedAt: "2024-01-01" }),
      project({ id: "b", slug: "b", title: "New", updatedAt: "2026-01-01" }),
      project({
        id: "c",
        slug: "c",
        title: "Featured",
        featured: true,
        updatedAt: "2020-01-01",
      }),
    ]);

    const result = await projectService.getProjects();

    expect(result.map((p) => p.title)).toEqual(["Featured", "New", "Old"]);
  });

  it("tolerates a malformed repository URL instead of throwing", async () => {
    portfolioMock.getProjects.mockResolvedValue([
      project({ githubUrl: "not a url" }),
    ]);
    githubMock.isConfigured.mockReturnValue(true);
    githubMock.getProjects.mockResolvedValue({
      ok: true,
      data: [
        project({
          id: "gh",
          slug: "x",
          source: "github",
          githubUrl: "also bad",
        }),
      ],
    });

    // Neither URL parses, so neither can be deduplicated — but nothing throws.
    expect(await projectService.getProjects()).toHaveLength(2);
  });
});

describe("getFeaturedProjects", () => {
  it("only ever returns curated projects", async () => {
    // A discovered repository must not be able to promote itself onto the
    // homepage, so the forges are not consulted at all here.
    portfolioMock.getFeaturedProjects.mockResolvedValue([
      project({ featured: true }),
    ]);
    githubMock.isConfigured.mockReturnValue(true);

    const result = await projectService.getFeaturedProjects();

    expect(result).toHaveLength(1);
    expect(githubMock.getProjects).not.toHaveBeenCalled();
  });
});

describe("getProjectBySlug", () => {
  it("delegates to the curated source, since only it has write-ups", async () => {
    portfolioMock.getProjectBySlug.mockResolvedValue(project());

    const result = await projectService.getProjectBySlug("atlas");

    expect(result?.slug).toBe("atlas");
    expect(portfolioMock.getProjectBySlug).toHaveBeenCalledWith("atlas");
  });

  it("returns undefined for an unknown slug", async () => {
    portfolioMock.getProjectBySlug.mockResolvedValue(undefined);
    expect(await projectService.getProjectBySlug("nope")).toBeUndefined();
  });
});
