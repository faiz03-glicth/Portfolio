import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { notConfigured, requestJson } from "@/lib/integrations/http";

/**
 * The shared transport for every external provider.
 *
 * Two things are being protected here, and both are security-relevant:
 *
 *   1. An upstream response body must never reach a caller. These APIs echo
 *      request detail in errors, and that detail ends up on a page.
 *   2. A failure must arrive as a `Result`, never as a thrown exception, or
 *      one provider outage takes down the whole render.
 */

const PROVIDER = "TestProvider";
const URL_WITH_SECRET = "https://api.example.com/v1/thing?access_token=SECRET";

let fetchMock: ReturnType<typeof vi.fn>;
let errorSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
  // Failures are logged on purpose; keep the test output readable.
  errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  };
}

describe("requestJson", () => {
  it("returns parsed data on success", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: 1, name: "ok" }));

    const result = await requestJson<{ id: number; name: string }>(
      PROVIDER,
      "https://api.example.com/v1/thing",
    );

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toEqual({ id: 1, name: "ok" });
  });

  it.each([
    [401, "unauthorized"],
    [403, "unauthorized"],
    [404, "not_found"],
    [429, "rate_limited"],
    [500, "upstream_error"],
    [503, "upstream_error"],
  ])("maps HTTP %i to %s", async (status, code) => {
    fetchMock.mockResolvedValue(jsonResponse({ message: "nope" }, status));

    const result = await requestJson(PROVIDER, "https://api.example.com/x");

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe(code);
  });

  it("never returns the upstream response body to the caller", async () => {
    const leak = "internal detail: token abc123 rejected for user 42";
    fetchMock.mockResolvedValue(jsonResponse({ error: leak }, 500));

    const result = await requestJson(PROVIDER, "https://api.example.com/x");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).not.toContain(leak);
      expect(result.error.message).not.toContain("abc123");
      expect(result.error.message).toContain(PROVIDER);
    }
  });

  it("does not log the query string, which can carry a token", async () => {
    fetchMock.mockResolvedValue(jsonResponse({}, 500));

    await requestJson(PROVIDER, URL_WITH_SECRET);

    const logged = errorSpy.mock.calls.flat().join(" ");
    expect(logged).not.toContain("SECRET");
    expect(logged).not.toContain("access_token");
    // The path is still logged, so the failure is diagnosable.
    expect(logged).toContain("/v1/thing");
  });

  it("returns a Result instead of throwing when the network fails", async () => {
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));

    const result = await requestJson(PROVIDER, "https://api.example.com/x");

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("network_error");
  });

  it("distinguishes a timeout from a generic transport failure", async () => {
    const timeout = new Error("timed out");
    timeout.name = "TimeoutError";
    fetchMock.mockRejectedValue(timeout);

    const result = await requestJson(PROVIDER, "https://api.example.com/x");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("network_error");
      expect(result.error.message).toContain("too long");
    }
  });

  it("passes an abort signal so a slow provider cannot hang a render", async () => {
    fetchMock.mockResolvedValue(jsonResponse({}));

    await requestJson(PROVIDER, "https://api.example.com/x");

    const init = fetchMock.mock.calls[0]?.[1];
    expect(init?.signal).toBeInstanceOf(AbortSignal);
  });

  it("forwards the caching window to fetch", async () => {
    fetchMock.mockResolvedValue(jsonResponse({}));

    await requestJson(PROVIDER, "https://api.example.com/x", {
      next: { revalidate: 1800, tags: ["github"] },
    });

    expect(fetchMock.mock.calls[0]?.[1]?.next).toEqual({
      revalidate: 1800,
      tags: ["github"],
    });
  });

  it("never caches a request marked no-store, and sends no next options", async () => {
    // Token exchanges must not be served from a cache.
    fetchMock.mockResolvedValue(jsonResponse({}));

    await requestJson(PROVIDER, "https://api.example.com/token", {
      noStore: true,
      next: { revalidate: 3600 },
    });

    const init = fetchMock.mock.calls[0]?.[1];
    expect(init?.cache).toBe("no-store");
    expect(init?.next).toBeUndefined();
  });

  it("sends an Accept header that callers can override", async () => {
    fetchMock.mockResolvedValue(jsonResponse({}));

    await requestJson(PROVIDER, "https://api.example.com/x", {
      headers: { Accept: "application/vnd.github+json" },
    });

    expect(fetchMock.mock.calls[0]?.[1]?.headers).toMatchObject({
      Accept: "application/vnd.github+json",
    });
  });
});

describe("notConfigured", () => {
  it("is a failure carrying the not_configured code", () => {
    const result = notConfigured("Spotify");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("not_configured");
      expect(result.error.message).toContain("Spotify");
    }
  });
});
