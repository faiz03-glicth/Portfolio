import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * GET /api/spotify/recently-played
 *
 * This route is the one place integration data is exposed over HTTP, so it is
 * the one place a credential or an upstream error body could escape. Both are
 * asserted against explicitly.
 */

const spotifyMock = {
  isConfigured: vi.fn(),
  getRecentlyPlayed: vi.fn(),
};

vi.mock("@/lib/integrations/spotify", () => ({ spotifyService: spotifyMock }));

const { GET } = await import("@/app/api/spotify/recently-played/route");

function request(url = "http://localhost:3000/api/spotify/recently-played") {
  return new Request(url);
}

const track = {
  id: "t1",
  name: "Weightless",
  artists: ["Marconi Union"],
  album: "Weightless",
  spotifyUrl: "https://open.spotify.com/track/1",
  playedAt: "2026-09-20T10:00:00.000Z",
};

beforeEach(() => {
  vi.clearAllMocks();
  spotifyMock.isConfigured.mockReturnValue(true);
});

describe("when Spotify is not configured", () => {
  it("responds 503 without calling the service", async () => {
    spotifyMock.isConfigured.mockReturnValue(false);

    const response = await GET(request());

    expect(response.status).toBe(503);
    expect(spotifyMock.getRecentlyPlayed).not.toHaveBeenCalled();
  });
});

describe("on success", () => {
  beforeEach(() => {
    spotifyMock.getRecentlyPlayed.mockResolvedValue({
      ok: true,
      data: [track],
    });
  });

  it("returns normalised tracks", async () => {
    const response = await GET(request());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.tracks).toEqual([track]);
  });

  it("sets a cache header matching the configured window", async () => {
    const response = await GET(request());
    const header = response.headers.get("Cache-Control") ?? "";

    expect(header).toContain("s-maxage=60");
    expect(header).toContain("stale-while-revalidate");
  });

  it("defaults the limit when none is given", async () => {
    await GET(request());
    expect(spotifyMock.getRecentlyPlayed).toHaveBeenCalledWith(10);
  });

  it.each([
    ["?limit=25", 25],
    ["?limit=1", 1],
    // Spotify caps this endpoint at 50; anything higher is clamped rather
    // than forwarded and rejected upstream.
    ["?limit=999", 50],
    ["?limit=0", 1],
    ["?limit=-5", 1],
    ["?limit=abc", 10],
    ["?limit=", 10],
  ])("clamps %s to %i", async (query, expected) => {
    await GET(
      request(`http://localhost:3000/api/spotify/recently-played${query}`),
    );
    expect(spotifyMock.getRecentlyPlayed).toHaveBeenCalledWith(expected);
  });
});

describe("on failure", () => {
  it.each([
    ["rate_limited", 429],
    ["unauthorized", 502],
    ["network_error", 504],
    ["upstream_error", 502],
    ["not_configured", 503],
  ])("maps %s to HTTP %i", async (code, status) => {
    spotifyMock.getRecentlyPlayed.mockResolvedValue({
      ok: false,
      error: { code, message: "Spotify is unavailable." },
    });

    const response = await GET(request());

    expect(response.status).toBe(status);
  });

  it("falls back to 502 for an unrecognised error code", async () => {
    spotifyMock.getRecentlyPlayed.mockResolvedValue({
      ok: false,
      error: { code: "something_new", message: "Spotify is unavailable." },
    });

    expect((await GET(request())).status).toBe(502);
  });

  it("never echoes an upstream body or a credential", async () => {
    // The service already sanitises, but the route is the last gate before
    // bytes leave the server — assert it here too.
    spotifyMock.getRecentlyPlayed.mockResolvedValue({
      ok: false,
      error: {
        code: "unauthorized",
        message: "Spotify rejected the request credentials.",
      },
    });

    const body = await (await GET(request())).text();

    expect(body).not.toMatch(/refresh_token|client_secret|Bearer |Basic /i);
    expect(body).toContain("Spotify rejected the request credentials.");
  });
});
