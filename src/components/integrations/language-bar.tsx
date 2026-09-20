import { cn } from "@/lib/utils";

/**
 * Language distribution as a single stacked bar plus a legend.
 *
 * Segments are shaded by position through the primary→accent range rather than
 * per-language brand colours, which keeps the component palette-driven and
 * means an unknown language never falls through to an undefined colour.
 */
const segmentStyles = [
  "bg-primary",
  "bg-primary/70",
  "bg-accent/80",
  "bg-accent/55",
  "bg-muted-foreground/40",
] as const;

export function LanguageBar({
  languages,
  className,
}: {
  languages: readonly { name: string; percentage: number }[];
  className?: string;
}) {
  if (languages.length === 0) return null;

  return (
    <div className={cn("space-y-3", className)}>
      <div
        className="flex h-2 w-full overflow-hidden rounded-full bg-muted"
        role="img"
        aria-label={`Language distribution: ${languages
          .map((language) => `${language.name} ${language.percentage} percent`)
          .join(", ")}`}
      >
        {languages.map((language, index) => (
          <span
            key={language.name}
            className={segmentStyles[index % segmentStyles.length]}
            style={{ width: `${language.percentage}%` }}
          />
        ))}
      </div>

      <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
        {languages.map((language, index) => (
          <li
            key={language.name}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
          >
            <span
              aria-hidden
              className={cn(
                "size-2 rounded-full",
                segmentStyles[index % segmentStyles.length],
              )}
            />
            {language.name}
            <span className="font-mono tabular-nums text-muted-foreground/70">
              {language.percentage}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
