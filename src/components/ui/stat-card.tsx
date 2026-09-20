import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  /** Short qualifier under the value, e.g. "past 12 months". */
  hint?: string;
  icon?: LucideIcon;
  className?: string;
};

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-surface p-4",
        "transition-colors duration-base ease-standard hover:border-primary/30",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-2xs uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </p>
        {Icon ? (
          <Icon aria-hidden className="size-4 shrink-0 text-muted-foreground" />
        ) : null}
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-foreground">
        {value}
      </p>
      {hint ? (
        <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
