import "server-only";

import { appConfig } from "@/config/app";
import { err, type Result } from "@/lib/types";
import { requestJson } from "../http";
import type {
  GitLabEvent,
  GitLabLanguages,
  GitLabProject,
  GitLabUser,
} from "./types";

/**
 * GitLab transport.
 *
 * The base URL is configurable because GitLab is commonly self-hosted;
 * hardcoding gitlab.com would make this adapter useless against a private
 * instance for no gain.
 *
 * As with GitHub, a token is optional. Public projects are readable without
 * one. A read-only token (`read_api` scope — not `api`, which grants writes)
 * raises rate limits and exposes the event feed the heatmap is built from.
 */

const DEFAULT_BASE_URL = "https://gitlab.com";
const PROVIDER = "GitLab";

function getBaseUrl(): string {
  const configured = process.env.GITLAB_BASE_URL?.trim();
  return (configured || DEFAULT_BASE_URL).replace(/\/$/, "");
}

function apiBase(): string {
  return `${getBaseUrl()}/api/v4`;
}

function getUsername(): string | null {
  return process.env.GITLAB_USERNAME?.trim() || null;
}

function getToken(): string | null {
  return process.env.GITLAB_TOKEN?.trim() || null;
}

export function isGitLabConfigured(): boolean {
  return getUsername() !== null;
}

export function hasGitLabToken(): boolean {
  return getToken() !== null;
}

function headers(): Record<string, string> {
  const token = getToken();
  // GitLab accepts a PAT via either PRIVATE-TOKEN or Bearer; PRIVATE-TOKEN is
  // the documented header for personal access tokens.
  return token ? { "PRIVATE-TOKEN": token } : {};
}

function cacheOptions() {
  return {
    next: { revalidate: appConfig.cache.repositories, tags: ["gitlab"] },
  };
}

function notConfiguredError(): Result<never> {
  return err({ code: "not_configured", message: "GitLab is not configured." });
}

/**
 * Resolves a username to a user record.
 *
 * GitLab has no "get user by username" endpoint — `/users?username=` returns
 * an array, which is empty for an unknown user rather than 404.
 */
export async function fetchUser(): Promise<Result<GitLabUser>> {
  const username = getUsername();
  if (!username) return notConfiguredError();

  const result = await requestJson<GitLabUser[]>(
    PROVIDER,
    `${apiBase()}/users?username=${encodeURIComponent(username)}`,
    { headers: headers(), ...cacheOptions() },
  );

  if (!result.ok) return result;

  const user = result.data[0];
  if (!user) {
    return err({
      code: "not_found",
      message: "That GitLab user does not exist.",
    });
  }

  return { ok: true, data: user };
}

export async function fetchProjects(
  userId: number,
): Promise<Result<GitLabProject[]>> {
  return requestJson<GitLabProject[]>(
    PROVIDER,
    `${apiBase()}/users/${userId}/projects` +
      `?per_page=100&order_by=last_activity_at&sort=desc&visibility=public`,
    { headers: headers(), ...cacheOptions() },
  );
}

/**
 * The user's event feed, used to approximate a contribution calendar.
 *
 * Returns an empty array rather than an error when unavailable: the feed needs
 * a token and is the one part of the panel that can be missing without making
 * the rest meaningless.
 */
export async function fetchEvents(
  userId: number,
): Promise<Result<GitLabEvent[]>> {
  if (!getToken()) return { ok: true, data: [] };

  const after = new Date();
  after.setUTCFullYear(after.getUTCFullYear() - 1);

  const result = await requestJson<GitLabEvent[]>(
    PROVIDER,
    `${apiBase()}/users/${userId}/events` +
      `?after=${after.toISOString().slice(0, 10)}&per_page=100`,
    { headers: headers(), ...cacheOptions() },
  );

  // A failure here costs the heatmap, not the panel.
  if (!result.ok) return { ok: true, data: [] };
  return result;
}

/**
 * Language breakdown for a single project.
 *
 * GitLab only reports languages per project, not per user, so the service
 * samples the most active project rather than summing across all of them —
 * which would be one request per repository.
 */
export async function fetchProjectLanguages(
  projectId: number,
): Promise<Result<GitLabLanguages>> {
  const result = await requestJson<GitLabLanguages>(
    PROVIDER,
    `${apiBase()}/projects/${projectId}/languages`,
    { headers: headers(), ...cacheOptions() },
  );

  if (!result.ok) return { ok: true, data: {} };
  return result;
}
