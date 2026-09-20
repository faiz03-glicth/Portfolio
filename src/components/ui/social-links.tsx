import { Github, Gitlab, Linkedin, Mail, Music2, Twitter } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { SocialLink, SocialPlatform } from "@/lib/types";
import { cn } from "@/lib/utils";

const platformIcons: Record<SocialPlatform, LucideIcon> = {
  github: Github,
  gitlab: Gitlab,
  linkedin: Linkedin,
  email: Mail,
  spotify: Music2,
  x: Twitter,
};

export function SocialIcon({ platform }: { platform: SocialPlatform }) {
  const Icon = platformIcons[platform];
  return <Icon aria-hidden className="size-4" />;
}

/**
 * A single social link. `mailto:` targets deliberately skip `target="_blank"`,
 * which otherwise leaves an orphaned blank tab behind in most browsers.
 */
export function SocialLinkItem({
  link,
  showLabel = false,
  className,
}: {
  link: SocialLink;
  showLabel?: boolean;
  className?: string;
}) {
  const isMailto = link.url.startsWith("mailto:");

  return (
    <a
      href={link.url}
      {...(isMailto ? {} : { target: "_blank", rel: "noopener noreferrer" })}
      className={cn(
        "inline-flex items-center gap-2 rounded-md border border-transparent px-2 py-1.5",
        "text-sm text-muted-foreground transition-colors duration-base ease-standard",
        "hover:border-border hover:bg-surface hover:text-foreground",
        className,
      )}
    >
      <SocialIcon platform={link.platform} />
      {showLabel ? <span>{link.label}</span> : null}
      <span className="sr-only">
        {showLabel ? "" : link.label}
        {isMailto ? "" : " (opens in a new tab)"}
      </span>
    </a>
  );
}

export function SocialLinkList({
  links,
  showLabels = false,
  className,
}: {
  links: readonly SocialLink[];
  showLabels?: boolean;
  className?: string;
}) {
  return (
    <ul className={cn("flex flex-wrap items-center gap-1", className)}>
      {links.map((link) => (
        <li key={link.id}>
          <SocialLinkItem link={link} showLabel={showLabels} />
        </li>
      ))}
    </ul>
  );
}
