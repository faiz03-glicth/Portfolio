import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PostgrestError } from "@supabase/supabase-js";

/**
 * Repository error handling.
 *
 * PostgREST puts SQL fragments, column names and row contents into `message`,
 * `details` and `hint`. None of that may reach a visitor, so every failure is
 * translated into a fixed code and a message written by us.
 */

const getSupabaseClient = vi.fn();

vi.mock("@/lib/supabase/client", () => ({ getSupabaseClient }));

const { query } = await import("@/lib/repositories/base");

function postgrestError(overrides: Partial<PostgrestError> = {}) {
  return {
    name: "PostgrestError",
    message: 'relation "public.secret_table" does not exist',
    details: "LINE 1: select * from secret_table where email = 'a@b.com'",
    hint: "Perhaps you meant public.profiles",
    code: "42P01",
    ...overrides,
  } as PostgrestError;
}

let errorSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  vi.clearAllMocks();
  getSupabaseClient.mockReturnValue({});
  errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => vi.restoreAllMocks());

describe("when Supabase is not configured", () => {
  it("reports not_configured without running the query", async () => {
    getSupabaseClient.mockReturnValue(null);
    const run = vi.fn();

    const result = await query("test", run);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("not_configured");
    expect(run).not.toHaveBeenCalled();
  });
});

describe("success", () => {
  it("returns the data", async () => {
    const result = await query("test", async () => ({
      data: [{ id: 1 }],
      error: null,
    }));

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toEqual([{ id: 1 }]);
  });

  it("treats a null payload as not found rather than as success", async () => {
    const result = await query("test", async () => ({
      data: null,
      error: null,
    }));

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("not_found");
  });
});

describe("error translation", () => {
  it.each([
    ["PGRST116", "not_found"],
    ["42501", "unauthorized"],
    ["PGRST301", "unauthorized"],
    ["42P01", "upstream_error"],
  ])("maps PostgREST code %s to %s", async (code, expected) => {
    const result = await query("test", async () => ({
      data: null,
      error: postgrestError({ code }),
    }));

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe(expected);
  });

  it("classifies a transport failure as network_error, not upstream_error", async () => {
    // supabase-js catches fetch failures internally and returns them as a
    // PostgrestError with an empty code, so this never reaches the catch
    // block. Without the explicit branch it would be misreported.
    const result = await query("test", async () => ({
      data: null,
      error: postgrestError({ code: "", message: "TypeError: fetch failed" }),
    }));

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("network_error");
  });

  it.each(["ECONNREFUSED", "ENOTFOUND api.supabase.co", "network timeout"])(
    "also treats %s as a transport failure",
    async (message) => {
      const result = await query("test", async () => ({
        data: null,
        error: postgrestError({ code: "", message }),
      }));

      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error.code).toBe("network_error");
    },
  );

  it("never leaks SQL, table names or row contents to the caller", async () => {
    const result = await query("test", async () => ({
      data: null,
      error: postgrestError(),
    }));

    expect(result.ok).toBe(false);
    if (!result.ok) {
      const message = result.error.message;
      expect(message).not.toContain("secret_table");
      expect(message).not.toContain("select *");
      expect(message).not.toContain("a@b.com");
      expect(message).toBe("Content could not be loaded from the database.");
    }
  });

  it("still logs the full error server-side, where detail is useful", async () => {
    await query("profileRepository.findActive", async () => ({
      data: null,
      error: postgrestError(),
    }));

    const logged = errorSpy.mock.calls.flat().join(" ");
    expect(logged).toContain("profileRepository.findActive");
  });

  it("converts a thrown exception into a Result", async () => {
    const result = await query("test", async () => {
      throw new Error("DNS lookup failed");
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("network_error");
      expect(result.error.message).not.toContain("DNS lookup failed");
    }
  });
});
