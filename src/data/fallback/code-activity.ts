import type { CodeActivity, ContributionDay } from "@/lib/types";

/**
 * Deterministic placeholder contribution data.
 *
 * On `main` this is what the code-activity section renders. On `integration`
 * it becomes the fallback shown when the provider is unreachable, so the
 * section degrades to something plausible instead of an empty grid.
 *
 * The generator is seeded rather than random: the same values must come out on
 * every render, or server and client markup would disagree.
 */

/** Mulberry32 — small, fast, and stable across runtimes. */
function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const DAYS = 371; // 53 whole weeks, so the grid has no ragged edge.

function generateContributions(seed: number): ContributionDay[] {
  const random = seededRandom(seed);
  const days: ContributionDay[] = [];

  const end = new Date();
  end.setUTCHours(0, 0, 0, 0);
  // Start on a Sunday so each rendered column is a clean week.
  end.setUTCDate(end.getUTCDate() - end.getUTCDay());

  for (let offset = DAYS - 1; offset >= 0; offset -= 1) {
    const date = new Date(end);
    date.setUTCDate(end.getUTCDate() - offset);

    const weekday = date.getUTCDay();
    const isWeekend = weekday === 0 || weekday === 6;

    // Weekday commits cluster; weekends are sparse but not empty.
    const roll = random();
    const idle = isWeekend ? 0.62 : 0.24;

    let count = 0;
    if (roll > idle) {
      const intensity = random();
      if (intensity > 0.94) count = 9 + Math.floor(random() * 7);
      else if (intensity > 0.76) count = 5 + Math.floor(random() * 4);
      else if (intensity > 0.42) count = 2 + Math.floor(random() * 3);
      else count = 1;
    }

    days.push({ date: date.toISOString().slice(0, 10), count });
  }

  return days;
}

function summarise(
  provider: CodeActivity["provider"],
  seed: number,
  base: Omit<CodeActivity, "contributions" | "contributionTotal">,
): CodeActivity {
  const contributions = generateContributions(seed);
  return {
    ...base,
    provider,
    contributions,
    contributionTotal: contributions.reduce((sum, day) => sum + day.count, 0),
  };
}

export const githubActivityFallback: CodeActivity = summarise(
  "github",
  20260920,
  {
    provider: "github",
    username: "faiz03-glicth",
    profileUrl: "https://github.com/faiz03-glicth",
    publicRepos: 27,
    followers: 48,
    totalStars: 214,
    topLanguages: [
      { name: "TypeScript", percentage: 52 },
      { name: "Python", percentage: 21 },
      { name: "SQL", percentage: 12 },
      { name: "Shell", percentage: 8 },
      { name: "Other", percentage: 7 },
    ],
  },
);

export const gitlabActivityFallback: CodeActivity = summarise(
  "gitlab",
  19870415,
  {
    provider: "gitlab",
    username: "faiz03-glicth",
    profileUrl: "https://gitlab.com/faiz03-glicth",
    publicRepos: 11,
    totalStars: 36,
    topLanguages: [
      { name: "TypeScript", percentage: 44 },
      { name: "Python", percentage: 28 },
      { name: "HCL", percentage: 16 },
      { name: "Shell", percentage: 12 },
    ],
  },
);
