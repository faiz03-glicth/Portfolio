import { technologyName as staticTechnologyName } from "@/data/skills";
import { portfolioService } from "@/lib/services/portfolio-service";
import { cn } from "@/lib/utils";
import { Tag } from "./tag";

/**
 * Technology chips.
 *
 * Projects and experiences store technology *IDs* (`"gitlab-ci"`), not display
 * names. Resolving those IDs is done here, as an async Server Component, so
 * the name lookup does not have to be threaded through every card, grid and
 * section as a prop.
 *
 * The lookup is cached and request-deduplicated by the service, so rendering
 * forty chips on the projects page is still one resolution, not forty.
 *
 * Because these are Server Components they cannot be used inside a Client
 * Component. That is fine for every current caller, and the alternative —
 * prop-drilling a name map through five layers — is worse.
 */

async function resolveName(id: string): Promise<string> {
  const names = await portfolioService.getTechnologyNames();
  // Falls back to the static registry, then to the raw ID. A technology that
  // exists in the database but not in `src/data/skills.ts` still renders.
  return names[id] ?? staticTechnologyName(id);
}

export async function TechnologyBadge({
  id,
  className,
}: {
  /** A technology ID, or a raw display name for one-off values. */
  id: string;
  className?: string;
}) {
  return <Tag className={className}>{await resolveName(id)}</Tag>;
}

export async function TechnologyList({
  ids,
  limit,
  className,
}: {
  ids: readonly string[];
  /** Caps the visible chips and appends a "+N" overflow marker. */
  limit?: number;
  className?: string;
}) {
  const visible = limit ? ids.slice(0, limit) : ids;
  const overflow = limit ? Math.max(0, ids.length - limit) : 0;

  // Resolved once for the whole list rather than per chip.
  const names = await portfolioService.getTechnologyNames();

  return (
    <ul className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {visible.map((id) => (
        <li key={id}>
          <Tag>{names[id] ?? staticTechnologyName(id)}</Tag>
        </li>
      ))}
      {overflow > 0 ? (
        <li>
          <Tag className="border-dashed">{`+${overflow}`}</Tag>
        </li>
      ) : null}
    </ul>
  );
}
