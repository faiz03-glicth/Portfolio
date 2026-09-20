import { technologyName } from "@/data/skills";
import { cn } from "@/lib/utils";
import { Tag } from "./tag";

type TechnologyBadgeProps = {
  /** A technology ID from `src/data/skills.ts`, or a raw display name. */
  id: string;
  className?: string;
};

/**
 * Resolves a technology ID to its display name in one place, so no caller
 * needs to know whether it is holding an ID or a label.
 */
export function TechnologyBadge({ id, className }: TechnologyBadgeProps) {
  return <Tag className={className}>{technologyName(id)}</Tag>;
}

type TechnologyListProps = {
  ids: readonly string[];
  /** Caps the visible chips and appends a "+N" overflow marker. */
  limit?: number;
  className?: string;
};

export function TechnologyList({ ids, limit, className }: TechnologyListProps) {
  const visible = limit ? ids.slice(0, limit) : ids;
  const overflow = limit ? Math.max(0, ids.length - limit) : 0;

  return (
    <ul className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {visible.map((id) => (
        <li key={id}>
          <TechnologyBadge id={id} />
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
