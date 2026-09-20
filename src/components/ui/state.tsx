import { AlertTriangle, Inbox, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type StateProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  /** Usually a retry or "view on provider" link. */
  action?: React.ReactNode;
  className?: string;
};

function StateShell({
  title,
  description,
  icon: Icon,
  action,
  tone,
  className,
  role,
}: StateProps & { tone: "muted" | "warning"; role?: React.AriaRole }) {
  return (
    <div
      role={role}
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed",
        "border-border bg-surface/40 px-6 py-10 text-center",
        className,
      )}
    >
      {Icon ? (
        <span
          aria-hidden
          className={cn(
            "flex size-10 items-center justify-center rounded-full",
            tone === "warning"
              ? "bg-warning/10 text-warning"
              : "bg-muted text-muted-foreground",
          )}
        >
          <Icon className="size-5" />
        </span>
      ) : null}

      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description ? (
          <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>

      {action}
    </div>
  );
}

/** Nothing to show, and that is fine. */
export function EmptyState({ icon = Inbox, ...props }: StateProps) {
  return <StateShell tone="muted" icon={icon} {...props} />;
}

/**
 * Something failed. Phrased around what the visitor can still do — never a raw
 * error message, which risks leaking upstream detail.
 */
export function ErrorState({ icon = AlertTriangle, ...props }: StateProps) {
  return <StateShell tone="warning" role="status" icon={icon} {...props} />;
}
