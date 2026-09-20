import Image from "next/image";
import { cn } from "@/lib/utils";

type AvatarProps = {
  src?: string;
  /** Doubles as the accessible name and the initials fallback source. */
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  priority?: boolean;
};

const sizes = {
  sm: { box: "size-8 text-xs", px: 32 },
  md: { box: "size-12 text-sm", px: 48 },
  lg: { box: "size-20 text-lg", px: 80 },
  xl: { box: "size-32 text-2xl", px: 128 },
} as const;

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function Avatar({
  src,
  name,
  size = "md",
  className,
  priority = false,
}: AvatarProps) {
  const { box, px } = sizes[size];

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden",
        "rounded-full border border-border bg-elevated font-semibold text-muted-foreground",
        box,
        className,
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={name}
          width={px}
          height={px}
          priority={priority}
          className="size-full object-cover"
        />
      ) : (
        <span aria-hidden>{initialsOf(name)}</span>
      )}
      {src ? null : <span className="sr-only">{name}</span>}
    </span>
  );
}
