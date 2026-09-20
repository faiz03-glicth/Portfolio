import { cn } from "@/lib/utils";
import { Container } from "./container";

type SectionProps = React.ComponentPropsWithoutRef<"section"> & {
  /** Anchor target for the homepage section rail. */
  id?: string;
  /** `muted` tints the band so adjacent sections separate without a divider. */
  tone?: "default" | "muted";
  size?: "default" | "large" | "compact";
  containerWidth?: "default" | "prose" | "wide";
  /** Set false when the caller needs to manage its own container. */
  contained?: boolean;
};

const sizes = {
  compact: "py-12 sm:py-16",
  default: "py-section",
  large: "py-section-lg",
} as const;

/**
 * The vertical rhythm primitive. Every band on every page is a `<Section>`,
 * which is why section spacing can be changed globally from `theme.ts`.
 */
export function Section({
  tone = "default",
  size = "default",
  containerWidth = "default",
  contained = true,
  className,
  children,
  ...props
}: SectionProps) {
  const content = contained ? (
    <Container width={containerWidth}>{children}</Container>
  ) : (
    children
  );

  return (
    <section
      className={cn(
        "relative scroll-mt-24",
        sizes[size],
        tone === "muted" && "bg-surface/60",
        className,
      )}
      {...props}
    >
      {content}
    </section>
  );
}
