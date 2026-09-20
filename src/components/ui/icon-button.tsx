import { cn } from "@/lib/utils";

type IconButtonProps = React.ComponentPropsWithoutRef<"button"> & {
  /** Required: an icon-only control is unusable without an accessible name. */
  label: string;
  size?: "sm" | "md";
};

const sizes = {
  sm: "size-8 [&_svg]:size-4",
  md: "size-10 [&_svg]:size-5",
} as const;

export function IconButton({
  label,
  size = "md",
  className,
  type = "button",
  children,
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex items-center justify-center rounded-md border border-transparent",
        "text-muted-foreground transition-colors duration-base ease-standard",
        "hover:border-border hover:bg-surface hover:text-foreground",
        "disabled:pointer-events-none disabled:opacity-50",
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
