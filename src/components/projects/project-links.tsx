import { ExternalLink, Github, Gitlab } from "lucide-react";
import type { Project } from "@/lib/types";
import { cn } from "@/lib/utils";

const linkStyles =
  "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium " +
  "text-muted-foreground transition-colors duration-base ease-standard " +
  "hover:bg-elevated hover:text-foreground relative z-10";

/**
 * Repository and demo links for a project.
 *
 * `relative z-10` matters: these sit inside a card whose title carries a
 * stretched overlay link, and without it the overlay would swallow the clicks.
 */
export function ProjectLinks({
  project,
  className,
}: {
  project: Project;
  className?: string;
}) {
  const links = [
    { key: "github", href: project.githubUrl, label: "GitHub", Icon: Github },
    { key: "gitlab", href: project.gitlabUrl, label: "GitLab", Icon: Gitlab },
    {
      key: "live",
      href: project.liveUrl,
      label: "Live demo",
      Icon: ExternalLink,
    },
  ].filter((link): link is typeof link & { href: string } =>
    Boolean(link.href),
  );

  if (links.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-1", className)}>
      {links.map(({ key, href, label, Icon }) => (
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={linkStyles}
        >
          <Icon aria-hidden className="size-3.5" />
          {label}
          <span className="sr-only">
            {` for ${project.title} (opens in a new tab)`}
          </span>
        </a>
      ))}
    </div>
  );
}
