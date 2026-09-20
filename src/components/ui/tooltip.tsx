"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";

type TooltipProps = {
  content: string;
  children: React.ReactNode;
  side?: "top" | "bottom";
  className?: string;
};

/**
 * Minimal CSS-positioned tooltip.
 *
 * Opens on hover *and* focus, and is wired up with `aria-describedby` so it is
 * announced rather than being a purely visual affordance. Deliberately not a
 * dependency — a portalled, collision-aware tooltip is not worth the bundle
 * cost for the handful of places this is used.
 */
export function Tooltip({
  content,
  children,
  side = "top",
  className,
}: TooltipProps) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <span
      className={cn("relative inline-flex", className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocusCapture={() => setOpen(true)}
      onBlurCapture={() => setOpen(false)}
    >
      <span aria-describedby={open ? id : undefined} className="inline-flex">
        {children}
      </span>

      <span
        id={id}
        role="tooltip"
        hidden={!open}
        className={cn(
          "pointer-events-none absolute left-1/2 z-overlay -translate-x-1/2 whitespace-nowrap",
          "rounded-md border border-border bg-elevated px-2 py-1 text-xs text-foreground shadow-md",
          side === "top" ? "bottom-[calc(100%+6px)]" : "top-[calc(100%+6px)]",
        )}
      >
        {content}
      </span>
    </span>
  );
}
