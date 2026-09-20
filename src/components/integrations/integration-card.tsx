import { ExternalLink, type LucideIcon } from "lucide-react";
import type { AsyncStatus } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { SkeletonList } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/state";
import { cn } from "@/lib/utils";

type IntegrationCardProps = {
  title: string;
  /** Short qualifier under the title, e.g. "Public activity". */
  subtitle?: string;
  icon: LucideIcon;
  /** Link out to the provider profile. */
  href?: string;
  status: AsyncStatus;
  /** Copy for the non-success states. */
  emptyTitle?: string;
  emptyDescription?: string;
  errorTitle?: string;
  errorDescription?: string;
  loadingRows?: number;
  className?: string;
  children: React.ReactNode;
};

/**
 * The shell every external-provider section renders inside.
 *
 * Centralising the four states here is what makes "one provider outage must
 * not break the page" a property of the system rather than a habit: a section
 * cannot render without declaring which state it is in, and a failed provider
 * degrades to a contained message while the rest of the page is untouched.
 */
export function IntegrationCard({
  title,
  subtitle,
  icon: Icon,
  href,
  status,
  emptyTitle = "Nothing to show",
  emptyDescription,
  errorTitle = "Temporarily unavailable",
  errorDescription = "This section could not load right now. Everything else on the page still works.",
  loadingRows = 3,
  className,
  children,
}: IntegrationCardProps) {
  return (
    // `min-w-0`: grid and flex children default to `min-width: auto`, which
    // lets wide content (the heatmap row) stretch the track instead of
    // letting the inner `overflow-x-auto` scroll.
    <Card className={cn("flex h-full min-w-0 flex-col", className)}>
      <div className="flex items-center gap-3 border-b border-border p-5">
        <span
          aria-hidden
          className="grid size-9 shrink-0 place-items-center rounded-md border border-border bg-elevated text-muted-foreground"
        >
          <Icon className="size-4" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{title}</p>
          {subtitle ? (
            <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>

        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors duration-base ease-standard hover:bg-elevated hover:text-foreground"
          >
            Open
            <ExternalLink aria-hidden className="size-3" />
            <span className="sr-only">{` ${title} (opens in a new tab)`}</span>
          </a>
        ) : null}
      </div>

      <div className="flex-1 p-5">
        {status === "loading" ? <SkeletonList rows={loadingRows} /> : null}
        {status === "error" ? (
          <ErrorState title={errorTitle} description={errorDescription} />
        ) : null}
        {status === "empty" ? (
          <EmptyState title={emptyTitle} description={emptyDescription} />
        ) : null}
        {status === "success" ? children : null}
      </div>
    </Card>
  );
}
