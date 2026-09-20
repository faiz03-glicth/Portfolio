import { cn } from "@/lib/utils";

/**
 * Presentational timeline scaffolding. It knows about rails, markers and year
 * groups — it knows nothing about experiences. `ExperienceTimeline` supplies
 * the data, which is what keeps this reusable for any chronological list.
 */

export function Timeline({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <ol className={cn("relative space-y-10", className)}>{children}</ol>;
}

export function TimelineYear({ year }: { year: string }) {
  return (
    <li className="relative flex items-center gap-4">
      <span
        aria-hidden
        className="grid size-9 shrink-0 place-items-center rounded-full border border-border bg-background"
      >
        <span className="size-2 rounded-full bg-primary/70" />
      </span>
      <span className="font-mono text-sm font-semibold tracking-[0.14em] text-foreground">
        {year}
      </span>
      <span aria-hidden className="h-px flex-1 bg-border" />
    </li>
  );
}

export function TimelineItem({
  /** Draws the connector down to the next item; omitted on the last entry. */
  connected = true,
  marker,
  children,
}: {
  connected?: boolean;
  marker?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <li className="relative flex gap-4">
      <div className="relative flex flex-col items-center">
        <span
          aria-hidden
          className="grid size-9 shrink-0 place-items-center rounded-full border border-border bg-surface text-muted-foreground"
        >
          {marker}
        </span>
        {connected ? (
          <span
            aria-hidden
            className="mt-2 w-px flex-1 bg-gradient-to-b from-border to-transparent"
          />
        ) : null}
      </div>

      <div className="min-w-0 flex-1 pb-2">{children}</div>
    </li>
  );
}
