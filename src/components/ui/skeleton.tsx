import { cn } from "@/lib/utils";

/**
 * Loading placeholder. The shimmer is a child overlay rather than a background
 * animation so it respects `prefers-reduced-motion` via the global rule.
 */
export function Skeleton({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      aria-hidden
      className={cn("relative overflow-hidden rounded-md bg-muted", className)}
      {...props}
    >
      <span className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-foreground/[0.06] to-transparent" />
    </div>
  );
}

/** Repeated skeleton rows, for list-shaped sections. */
export function SkeletonList({
  rows = 3,
  className,
  rowClassName,
}: {
  rows?: number;
  className?: string;
  rowClassName?: string;
}) {
  return (
    <div className={cn("space-y-3", className)} role="status" aria-busy="true">
      <span className="sr-only">Loading…</span>
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} className={cn("h-16 w-full", rowClassName)} />
      ))}
    </div>
  );
}
