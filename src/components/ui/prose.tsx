import { cn } from "@/lib/utils";

/**
 * Renders an array of paragraphs with consistent measure and rhythm. Used for
 * bios and project overviews so long-form text never needs bespoke styling.
 */
export function Prose({
  paragraphs,
  className,
}: {
  paragraphs: readonly string[];
  className?: string;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      {paragraphs.map((paragraph, index) => (
        <p
          key={index}
          className="text-base leading-[1.75] text-muted-foreground"
        >
          {paragraph}
        </p>
      ))}
    </div>
  );
}
