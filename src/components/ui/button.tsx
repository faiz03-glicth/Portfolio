import Link from "next/link";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium " +
  "transition-[background-color,border-color,color,box-shadow,transform] duration-base " +
  "ease-standard disabled:pointer-events-none disabled:opacity-50 active:translate-y-px " +
  "[&_svg]:size-4 [&_svg]:shrink-0";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-glow",
  secondary:
    "bg-elevated text-foreground border border-border hover:border-primary/40 hover:bg-elevated/70",
  outline:
    "border border-border bg-transparent text-foreground hover:border-primary/50 hover:bg-surface",
  ghost:
    "bg-transparent text-muted-foreground hover:bg-surface hover:text-foreground",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

function buttonClasses(
  variant: ButtonVariant,
  size: ButtonSize,
  className?: string,
): string {
  return cn(base, variants[variant], sizes[size], className);
}

type ButtonProps = React.ComponentPropsWithoutRef<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses(variant, size, className)}
      {...props}
    />
  );
}

type ButtonLinkProps = React.ComponentPropsWithoutRef<typeof Link> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Adds the usual safety attributes and an accessible suffix. */
  external?: boolean;
};

/**
 * A link that looks like a button. Kept separate from `Button` rather than
 * using an `asChild` prop — an anchor and a button are different elements with
 * different semantics, and blurring that is how keyboard support gets broken.
 */
export function ButtonLink({
  variant = "primary",
  size = "md",
  external = false,
  className,
  children,
  ...props
}: ButtonLinkProps) {
  const externalProps = external
    ? { target: "_blank" as const, rel: "noopener noreferrer" }
    : {};

  return (
    <Link
      className={buttonClasses(variant, size, className)}
      {...externalProps}
      {...props}
    >
      {children}
      {external ? <span className="sr-only"> (opens in a new tab)</span> : null}
    </Link>
  );
}
