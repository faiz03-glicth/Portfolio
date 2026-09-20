import "server-only";

import { appConfig } from "@/config/app";
import { err, type Result } from "@/lib/types";
import { requestJson } from "../http";
import type {
  GitHubContributionsResponse,
  GitHubRepository,
  GitHubUser,
} from "./types";

/**
 * GitHub transport.
 *
 * A token is **optional** here, which is deliberate. Everything this site
 * shows is public, and the REST endpoints below serve public data
 * unauthenticated. Requiring a personal access token to read public
 * repositories would be asking for more privilege than the feature needs.
 *
 * What a token buys:
 *   - 5,000 requests/hour instead of 60
 *   - the contribution calendar, which only exists in the GraphQL API
 *
 * So: no token means the panel still renders, minus the heatmap.
 */

const REST_BASE = "https://api.github.com";
const GRAPHQL_ENDPOINT = "https://api.github.com/graphql";
const PROVIDER = "GitHub";

/** Pins the response format; without it GitHub may change shapes under us. */
const API_VERSION_HEADERS = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
};

function getUsername(): string | null {
  return process.env.GITHUB_USERNAME?.trim() || null;
}

function getToken(): string | null {
  return process.env.GITHUB_TOKEN?.trim() || null;
}

/** Configured means "we know whose profile to show", not "we have a token". */
export function isGitHubConfigured(): boolean {
  return getUsername() !== null;
}

export function hasGitHubToken(): boolean {
  return getToken() !== null;
}

function headers(): Record<string, string> {
  const token = getToken();
  return {
    ...API_VERSION_HEADERS,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function fetchUser(): Promise<Result<GitHubUser>> {
  const username = getUsername();
  if (!username) {
    return err({
      code: "not_configured",
      message: "GitHub is not configured.",
    });
  }

  return requestJson<GitHubUser>(
    PROVIDER,
    `${REST_BASE}/users/${encodeURIComponent(username)}`,
    {
      headers: headers(),
      next: { revalidate: appConfig.cache.repositories, tags: ["github"] },
    },
  );
}

/**
 * Public repositories, most recently pushed first.
 *
 * Capped at 100 (the API maximum for one page) rather than paginating. A
 * portfolio shows a handful of repositories; walking every page of an account
 * with hundreds would spend rate limit on data that is never rendered.
 */
export async function fetchRepositories(): Promise<Result<GitHubRepository[]>> {
  const username = getUsername();
  if (!username) {
    return err({
      code: "not_configured",
      message: "GitHub is not configured.",
    });
  }

  return requestJson<GitHubRepository[]>(
    PROVIDER,
    `${REST_BASE}/users/${encodeURIComponent(username)}/repos` +
      `?per_page=100&sort=pushed&direction=desc&type=owner`,
    {
      headers: headers(),
      next: { revalidate: appConfig.cache.repositories, tags: ["github"] },
    },
  );
}

const CONTRIBUTIONS_QUERY = `
  query($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
      }
    }
  }
`;

/**
 * The contribution calendar.
 *
 * Returns `null` — not an error — when no token is available, because that is
 * an expected configuration rather than a failure. The caller renders the
 * panel without a heatmap.
 */
export async function fetchContributions(): Promise<
  Result<GitHubContributionsResponse | null>
> {
  const username = getUsername();
  const token = getToken();

  if (!username) {
    return err({
      code: "not_configured",
      message: "GitHub is not configured.",
    });
  }

  if (!token) return { ok: true, data: null };

  const result = await requestJson<GitHubContributionsResponse>(
    PROVIDER,
    GRAPHQL_ENDPOINT,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: CONTRIBUTIONS_QUERY,
        variables: { login: username },
      }),
      next: { revalidate: appConfig.cache.repositories, tags: ["github"] },
    },
  );

  if (!result.ok) return result;

  // GraphQL reports errors in a 200 response body, so a successful status code
  // is not by itself a successful query.
  if (result.data.errors && result.data.errors.length > 0) {
    console.error(
      `[integration:${PROVIDER}] graphql errors`,
      result.data.errors.map((error) => error.message),
    );
    return err({
      code: "upstream_error",
      message: "GitHub could not return contribution data.",
    });
  }

  return result;
}
