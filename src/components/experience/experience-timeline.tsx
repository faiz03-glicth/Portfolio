import { Fragment } from "react";
import { Briefcase, GraduationCap, Heart, Wrench } from "lucide-react";
import type { Experience } from "@/lib/types";
import { Timeline, TimelineItem, TimelineYear } from "@/components/ui/timeline";
import { yearOf } from "@/lib/utils";
import { ExperienceCard } from "./experience-card";

const kindIcons = {
  work: Briefcase,
  education: GraduationCap,
  project: Wrench,
  volunteer: Heart,
} as const;

/**
 * Groups experiences into year headings and feeds them to the presentational
 * `Timeline` primitives. All of the "which year does this belong to" logic
 * lives here; the timeline itself stays reusable for any dated list.
 */
export function ExperienceTimeline({
  experiences,
}: {
  experiences: readonly Experience[];
}) {
  let lastYear: string | null = null;

  return (
    <Timeline>
      {experiences.map((experience, index) => {
        const year = yearOf(experience.startDate);
        const showYear = year !== lastYear;
        lastYear = year;

        const Icon = kindIcons[experience.kind];
        const isLast = index === experiences.length - 1;

        return (
          // A Fragment, not a wrapper element: `TimelineYear` and
          // `TimelineItem` are both `<li>` and must sit directly inside the
          // `<ol>`. Wrapping them would nest a list item inside a list item.
          <Fragment key={experience.id}>
            {showYear ? <TimelineYear year={year} /> : null}
            <TimelineItem
              connected={!isLast}
              marker={<Icon aria-hidden className="size-4" />}
            >
              <ExperienceCard experience={experience} />
            </TimelineItem>
          </Fragment>
        );
      })}
    </Timeline>
  );
}
