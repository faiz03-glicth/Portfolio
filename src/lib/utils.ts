import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge conditional class names, letting later Tailwind utilities win over
 * earlier conflicting ones. Every component takes a `className` prop and
 * composes it through this, so callers can always override a default.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** `2024-03-01` -> `Mar 2024`. Returns the input unchanged if unparseable. */
export function formatMonthYear(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

/** `Mar 2024 — Present` for a date range. */
export function formatDateRange(startIso: string, endIso?: string): string {
  const start = formatMonthYear(startIso);
  return endIso
    ? `${start} — ${formatMonthYear(endIso)}`
    : `${start} — Present`;
}

/** The year component, used as the timeline's grouping key. */
export function yearOf(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? iso.slice(0, 4)
    : String(date.getFullYear());
}

/** `2 hours ago`, `3 days ago`. Falls back to an absolute date past a month. */
export function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return iso;

  const seconds = Math.round((Date.now() - then) / 1000);
  if (seconds < 60) return "just now";

  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["minute", 60],
    ["hour", 3600],
    ["day", 86400],
    ["week", 604800],
  ];

  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  for (let index = units.length - 1; index >= 0; index -= 1) {
    const unit = units[index];
    if (!unit) continue;
    const [name, size] = unit;
    if (seconds >= size) {
      return formatter.format(-Math.floor(seconds / size), name);
    }
  }

  return formatter.format(-Math.floor(seconds / 60), "minute");
}

/** `217000` -> `3:37`, for track durations. */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/** `1234` -> `1.2k`. Used for stars, forks and contribution counts. */
export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

/** Absolute URL for a site-relative path, for canonical links and OG tags. */
export function absoluteUrl(path: string, baseUrl: string): string {
  return new URL(path, baseUrl).toString();
}

/** Stable sort helper that does not mutate the input array. */
export function sortBy<T>(
  items: readonly T[],
  selector: (item: T) => number,
): T[] {
  return [...items].sort((a, b) => selector(a) - selector(b));
}

/** Groups items by a derived string key, preserving insertion order. */
export function groupBy<T>(
  items: readonly T[],
  selector: (item: T) => string,
): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const key = selector(item);
    const bucket = groups.get(key);
    if (bucket) bucket.push(item);
    else groups.set(key, [item]);
  }
  return groups;
}

/** Used by staggered entrance animations to space children apart. */
export function staggerDelay(index: number, stepMs = 70): React.CSSProperties {
  return { "--stagger-delay": `${index * stepMs}ms` } as React.CSSProperties;
}
