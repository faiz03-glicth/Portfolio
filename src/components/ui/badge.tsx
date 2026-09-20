import { cn } from "@/lib/utils";

export type BadgeTone =
  "neutral" | "primary" | "accent" | "success" | "warning" | "danger";

const tones: Record<BadgeTone, string> = {
  neutral: "border-border bg-muted text-muted-foreground",
  primary: "border-primary/30 bg-primary/10 text-primary",
  accent: "border-accent/30 bg-accent/10 text-accent",
  success: "border-success/30 bg-success/10 text-success",
  warning: "border-warning/30 bg-warning/10 text-warning",
  danger: "border-danger/30 bg-danger/10 text-danger",
};

type BadgeProps = React.ComponentPropsWithoutRef<"span"> & {
  tone?: BadgeTone;
  /** Renders a small filled dot before the label — used for status badges. */
  dot?: boolean;
};

export function Badge({
  tone = "neutral",
  dot = false,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5",
        "text-xs font-medium leading-5",
        tones[tone],
        className,
      )}
      {...props}
    >
      {dot ? (
        <span aria-hidden className="size-1.5 rounded-full bg-current" />
      ) : null}
      {children}
    </span>
  );
}
