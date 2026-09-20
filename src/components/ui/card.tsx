import { cn } from "@/lib/utils";

type CardProps = React.ComponentPropsWithoutRef<"div"> & {
  /** `interactive` adds hover affordances for cards that wrap a link. */
  interactive?: boolean;
  /** `outline` drops the fill, for cards sitting on a tinted band. */
  variant?: "solid" | "outline";
};

export function Card({
  interactive = false,
  variant = "solid",
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "relative rounded-xl border border-border",
        variant === "solid" ? "bg-surface" : "bg-transparent",
        interactive &&
          "group/card transition-[border-color,background-color,transform] duration-base " +
            "ease-standard hover:-translate-y-0.5 hover:border-primary/40 hover:bg-elevated",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div className={cn("flex flex-col gap-1.5 p-5", className)} {...props} />
  );
}

export function CardTitle({
  as: Tag = "h3",
  className,
  ...props
}: React.ComponentPropsWithoutRef<"h3"> & { as?: "h2" | "h3" | "h4" }) {
  return <Tag className={cn("text-lg leading-snug", className)} {...props} />;
}

export function CardDescription({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"p">) {
  return (
    <p
      className={cn("text-sm leading-relaxed text-muted-foreground", className)}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return <div className={cn("px-5 pb-5", className)} {...props} />;
}

export function CardFooter({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 border-t border-border px-5 py-4",
        className,
      )}
      {...props}
    />
  );
}
