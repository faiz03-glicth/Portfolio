import { cn } from "@/lib/utils";

/**
 * A monospace chip for machine-ish values: technology names, languages,
 * branch names. Distinct from `Badge`, which carries semantic status colour.
 */
export function Tag({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"span">) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border border-border bg-muted/60",
        "px-2 py-0.5 font-mono text-2xs font-medium text-muted-foreground",
        "transition-colors duration-base ease-standard",
        className,
      )}
      {...props}
    />
  );
}
