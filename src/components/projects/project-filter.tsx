import Link from "next/link";
import type { Project } from "@/lib/types";
import { cn } from "@/lib/utils";
import { projectTypeLabel } from "./project-status-badge";

/**
 * Type filter for the projects page.
 *
 * Implemented as links against a search param rather than client state: the
 * filter works without JavaScript, each view has a shareable URL, and the page
 * ships no extra client bundle for what is ultimately an array filter.
 */
export function ProjectFilter({
  projects,
  active,
}: {
  projects: readonly Project[];
  /** The currently selected type, or undefined for "All". */
  active?: string;
}) {
  const counts = new Map<string, number>();
  for (const project of projects) {
    counts.set(project.type, (counts.get(project.type) ?? 0) + 1);
  }

  const options = [
    { value: undefined, label: "All", count: projects.length },
    ...[...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([value, count]) => ({
        value,
        label: projectTypeLabel(value),
        count,
      })),
  ];

  return (
    <nav aria-label="Filter projects by type">
      <ul className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = option.value === active;
          return (
            <li key={option.label}>
              <Link
                href={
                  option.value ? `/projects?type=${option.value}` : "/projects"
                }
                scroll={false}
                aria-current={selected ? "true" : undefined}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium",
                  "transition-colors duration-base ease-standard",
                  selected
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border bg-surface text-muted-foreground hover:border-primary/30 hover:text-foreground",
                )}
              >
                {option.label}
                <span className="font-mono tabular-nums opacity-60">
                  {option.count}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
