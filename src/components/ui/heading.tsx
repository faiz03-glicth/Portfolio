import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  /** Small uppercase label above the title. */
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Rendered on the right on wide viewports — usually a "view all" link. */
  action?: React.ReactNode;
  align?: "start" | "center";
  /** Heading level. Defaults to h2, since h1 belongs to the page hero. */
  as?: "h1" | "h2" | "h3";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = "start",
  as: Tag = "h2",
  className,
}: SectionHeadingProps) {
  const centered = align === "center";

  return (
    <div
      className={cn(
        "flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between",
        centered && "sm:flex-col sm:items-center",
        className,
      )}
    >
      <div className={cn("max-w-2xl", centered && "text-center")}>
        {eyebrow ? (
          <p
            className={cn(
              "mb-3 flex items-center gap-2 font-mono text-2xs font-medium uppercase tracking-[0.18em] text-primary",
              centered && "justify-center",
            )}
          >
            <span aria-hidden className="h-px w-6 bg-primary/50" />
            {eyebrow}
          </p>
        ) : null}

        <Tag
          className={cn(
            Tag === "h1"
              ? "text-4xl sm:text-5xl lg:text-6xl"
              : "text-2xl sm:text-3xl",
          )}
        >
          {title}
        </Tag>

        {description ? (
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>

      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
