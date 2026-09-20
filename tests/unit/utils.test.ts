import { describe, expect, it } from "vitest";
import {
  formatCompactNumber,
  formatDateRange,
  formatDuration,
  formatMonthYear,
  groupBy,
  sortBy,
  yearOf,
  absoluteUrl,
  cn,
} from "@/lib/utils";

describe("cn", () => {
  it("lets a later utility win over an earlier conflicting one", () => {
    // This is the whole reason tailwind-merge is here: without it both classes
    // survive and the winner depends on stylesheet order.
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("drops falsy values so conditional props do not emit 'false'", () => {
    expect(cn("a", false && "b", undefined, null, "c")).toBe("a c");
  });
});

describe("formatMonthYear", () => {
  it("formats an ISO date", () => {
    expect(formatMonthYear("2024-03-01")).toBe("Mar 2024");
  });

  it("returns the input unchanged when it is not a date", () => {
    // Better to render something odd than to render "Invalid Date".
    expect(formatMonthYear("not-a-date")).toBe("not-a-date");
  });
});

describe("formatDateRange", () => {
  it("marks an open-ended range as Present", () => {
    expect(formatDateRange("2024-01-01")).toBe("Jan 2024 — Present");
  });

  it("formats a closed range", () => {
    expect(formatDateRange("2024-01-01", "2024-06-01")).toBe(
      "Jan 2024 — Jun 2024",
    );
  });
});

describe("yearOf", () => {
  it("extracts the year", () => {
    expect(yearOf("2025-11-30")).toBe("2025");
  });

  it("falls back to the leading four characters when unparseable", () => {
    expect(yearOf("2019-bad-date")).toBe("2019");
  });
});

describe("formatDuration", () => {
  it("pads seconds to two digits", () => {
    expect(formatDuration(65_000)).toBe("1:05");
  });

  it("handles durations under a minute", () => {
    expect(formatDuration(9_000)).toBe("0:09");
  });

  it("handles zero", () => {
    expect(formatDuration(0)).toBe("0:00");
  });
});

describe("formatCompactNumber", () => {
  it("leaves small numbers alone", () => {
    expect(formatCompactNumber(42)).toBe("42");
  });

  it("compacts thousands", () => {
    expect(formatCompactNumber(1_234)).toBe("1.2K");
  });
});

describe("absoluteUrl", () => {
  it("resolves a site-relative path against the base", () => {
    expect(absoluteUrl("/about", "https://example.com")).toBe(
      "https://example.com/about",
    );
  });

  it("does not double a slash when the base has a trailing one", () => {
    expect(absoluteUrl("/about", "https://example.com/")).toBe(
      "https://example.com/about",
    );
  });
});

describe("sortBy", () => {
  it("does not mutate the input", () => {
    const input = [{ n: 3 }, { n: 1 }, { n: 2 }];
    const sorted = sortBy(input, (item) => item.n);

    expect(sorted.map((item) => item.n)).toEqual([1, 2, 3]);
    expect(input.map((item) => item.n)).toEqual([3, 1, 2]);
  });
});

describe("groupBy", () => {
  it("preserves insertion order of both groups and members", () => {
    const grouped = groupBy(
      ["apple", "avocado", "banana", "blueberry", "cherry"],
      (word) => word[0] ?? "",
    );

    expect([...grouped.keys()]).toEqual(["a", "b", "c"]);
    expect(grouped.get("a")).toEqual(["apple", "avocado"]);
  });

  it("returns an empty map for an empty input", () => {
    expect(groupBy([], () => "x").size).toBe(0);
  });
});
