"use client";

import { useCallback, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { IconButton } from "./icon-button";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Hides the title visually while keeping it as the accessible name. */
  hideTitle?: boolean;
  /** `drawer` slides in from the right; used for the mobile navigation. */
  variant?: "center" | "drawer";
  children: React.ReactNode;
  className?: string;
};

/**
 * Built on the native `<dialog>` element.
 *
 * `showModal()` gives focus trapping, inertness of background content, Escape
 * handling and the top layer for free — all things a hand-rolled portal gets
 * subtly wrong. The only things left to wire up are backdrop clicks and
 * keeping React state in sync with the element's own `close` event.
 */
export function Modal({
  open,
  onClose,
  title,
  hideTitle = false,
  variant = "center",
  children,
  className,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  // The element can close itself (Escape, form method="dialog"), so mirror that
  // back into React rather than letting the two drift apart.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => onClose();
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  // Lock background scroll only while open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const handleBackdropClick = useCallback(
    (event: React.MouseEvent<HTMLDialogElement>) => {
      // A click landing on the dialog element itself is a backdrop click:
      // content lives in an inner wrapper, so it never targets the dialog.
      if (event.target === dialogRef.current) onClose();
    },
    [onClose],
  );

  return (
    <dialog
      ref={dialogRef}
      aria-label={title}
      onClick={handleBackdropClick}
      className={cn(
        "max-h-none max-w-none bg-transparent p-0 text-foreground backdrop:bg-background/80",
        "backdrop:backdrop-blur-sm open:animate-fade-in",
        variant === "center"
          ? "m-auto w-[min(32rem,calc(100vw-2rem))]"
          : "ml-auto mr-0 mt-0 h-dvh w-[min(20rem,85vw)]",
      )}
    >
      <div
        className={cn(
          "flex flex-col border border-border bg-surface shadow-lg",
          variant === "center"
            ? "rounded-xl"
            : "h-full rounded-none border-y-0 border-r-0",
          className,
        )}
      >
        <div
          className={cn(
            "flex items-center justify-between gap-4 p-4",
            !hideTitle && "border-b border-border",
          )}
        >
          <h2 className={cn("text-base font-semibold", hideTitle && "sr-only")}>
            {title}
          </h2>
          <IconButton label="Close" onClick={onClose} className="ml-auto">
            <X />
          </IconButton>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </dialog>
  );
}
