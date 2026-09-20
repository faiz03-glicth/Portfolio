import type { ProjectStatus } from "@/lib/types";
import { Badge, type BadgeTone } from "@/components/ui/badge";

const statusMeta: Record<ProjectStatus, { label: string; tone: BadgeTone }> = {
  shipped: { label: "Shipped", tone: "success" },
  "in-progress": { label: "In progress", tone: "primary" },
  archived: { label: "Archived", tone: "neutral" },
  concept: { label: "Concept", tone: "accent" },
};

/** Single mapping from status to label and colour, shared by every surface. */
export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const meta = statusMeta[status];
  return (
    <Badge tone={meta.tone} dot>
      {meta.label}
    </Badge>
  );
}

const typeLabels: Record<string, string> = {
  "web-app": "Web app",
  api: "API",
  library: "Library",
  tool: "Tool",
  data: "Data",
  mobile: "Mobile",
};

export function projectTypeLabel(type: string): string {
  return typeLabels[type] ?? type;
}
