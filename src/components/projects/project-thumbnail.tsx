import Image from "next/image";
import type { Project } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Small stable hash, so a project's generated artwork never changes. */
function hash(value: string): number {
  let result = 0;
  for (let index = 0; index < value.length; index += 1) {
    result = (result * 31 + value.charCodeAt(index)) >>> 0;
  }
  return result;
}

/**
 * Project artwork.
 *
 * Renders the supplied image when there is one, and otherwise composes a
 * deterministic gradient-and-grid panel from the project's slug. This avoids
 * shipping placeholder screenshots that would have to be replaced later, and
 * it keeps the card grid visually even while real images are missing.
 *
 * The generated variant draws only from theme tokens — no invented colours.
 */
export function ProjectThumbnail({
  project,
  className,
  priority = false,
}: {
  project: Project;
  className?: string;
  priority?: boolean;
}) {
  const wrapper = cn(
    "relative aspect-[16/9] w-full overflow-hidden rounded-t-xl border-b border-border bg-elevated",
    className,
  );

  if (project.imageUrl) {
    return (
      <div className={wrapper}>
        <Image
          src={project.imageUrl}
          alt={`${project.title} preview`}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-slow ease-standard group-hover/card:scale-[1.03]"
        />
      </div>
    );
  }

  const seed = hash(project.slug);
  const angle = 120 + (seed % 5) * 30;
  const gridSize = 22 + (seed % 4) * 6;
  const monogram = project.title.slice(0, 2).toUpperCase();

  return (
    <div className={wrapper} aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(${angle}deg, hsl(var(--color-primary) / 0.22), hsl(var(--color-accent) / 0.18) 55%, transparent)`,
        }}
      />
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--color-border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--color-border)) 1px, transparent 1px)",
          backgroundSize: `${gridSize}px ${gridSize}px`,
        }}
      />
      <span className="absolute bottom-3 right-4 font-mono text-4xl font-bold tracking-tight text-foreground/10">
        {monogram}
      </span>
    </div>
  );
}
