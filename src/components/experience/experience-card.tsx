import { ExternalLink } from "lucide-react";
import type { Experience } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { TechnologyList } from "@/components/ui/technology-badge";
import { formatDateRange } from "@/lib/utils";

/** One entry in the timeline. Presentation only — the timeline owns ordering. */
export function ExperienceCard({ experience }: { experience: Experience }) {
  return (
    <article className="rounded-xl border border-border bg-surface p-5 transition-colors duration-base ease-standard hover:border-primary/30">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="text-base font-semibold">{experience.title}</h3>
        {experience.current ? (
          <Badge tone="success" dot>
            Current
          </Badge>
        ) : null}
      </div>

      <p className="mt-1 text-sm text-muted-foreground">
        {experience.companyUrl ? (
          <a
            href={experience.companyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-sm font-medium text-foreground transition-colors duration-base ease-standard hover:text-primary"
          >
            {experience.company}
            <ExternalLink aria-hidden className="size-3" />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        ) : (
          <span className="font-medium text-foreground">
            {experience.company}
          </span>
        )}
        {experience.location ? ` · ${experience.location}` : null}
      </p>

      <p className="mt-1 font-mono text-2xs uppercase tracking-[0.14em] text-muted-foreground">
        {formatDateRange(experience.startDate, experience.endDate)}
      </p>

      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {experience.description}
      </p>

      {experience.achievements && experience.achievements.length > 0 ? (
        <ul className="mt-3 space-y-1.5">
          {experience.achievements.map((achievement) => (
            <li
              key={achievement}
              className="relative pl-4 text-sm leading-relaxed text-muted-foreground before:absolute before:left-0 before:top-[0.6em] before:size-1.5 before:rounded-full before:bg-primary/60 before:content-['']"
            >
              {achievement}
            </li>
          ))}
        </ul>
      ) : null}

      {experience.technologies && experience.technologies.length > 0 ? (
        <TechnologyList ids={experience.technologies} className="mt-4" />
      ) : null}
    </article>
  );
}
