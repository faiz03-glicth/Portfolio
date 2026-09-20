import type { ContributionDay } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Contribution calendar.
 *
 * Intensity is expressed as opacity over the `primary` token rather than a
 * hand-picked colour ramp, so the grid re-tints correctly when the palette
 * changes and stays legible in both light and dark.
 */
const levelStyles = [
  "bg-muted",
  "bg-primary/25",
  "bg-primary/45",
  "bg-primary/70",
  "bg-primary",
] as const;

function levelFor(count: number): number {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 9) return 3;
  return 4;
}

/** Splits a flat, Sunday-aligned day list into week columns. */
function toWeeks(days: readonly ContributionDay[]): ContributionDay[][] {
  const weeks: ContributionDay[][] = [];
  for (let index = 0; index < days.length; index += 7) {
    weeks.push(days.slice(index, index + 7));
  }
  return weeks;
}

export function ContributionHeatmap({
  days,
  className,
}: {
  days: readonly ContributionDay[];
  className?: string;
}) {
  const weeks = toWeeks(days);

  return (
    <div className={cn("min-w-0 space-y-3", className)}>
      {/*
        Horizontally scrollable on narrow screens rather than squashed — a
        heatmap with sub-pixel cells communicates nothing.
      */}
      <div className="-mx-1 overflow-x-auto px-1 pb-1">
        <div
          className="flex min-w-max gap-[3px]"
          role="img"
          aria-label={ariaLabel(days)}
        >
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-[3px]">
              {week.map((day) => (
                <span
                  key={day.date}
                  title={`${day.count} contribution${day.count === 1 ? "" : "s"} on ${day.date}`}
                  className={cn(
                    "size-[10px] rounded-[2px]",
                    levelStyles[levelFor(day.count)],
                  )}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-1.5 text-2xs text-muted-foreground">
        <span>Less</span>
        {levelStyles.map((style, index) => (
          <span
            key={index}
            aria-hidden
            className={cn("size-[10px] rounded-[2px]", style)}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

/** One description for the whole grid — 371 individually labelled cells would flood a screen reader. */
function ariaLabel(days: readonly ContributionDay[]): string {
  const total = days.reduce((sum, day) => sum + day.count, 0);
  const active = days.filter((day) => day.count > 0).length;
  return `Contribution calendar: ${total} contributions across ${active} active days in the past year.`;
}
