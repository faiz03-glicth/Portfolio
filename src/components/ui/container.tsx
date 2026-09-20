import { cn } from "@/lib/utils";

type ContainerProps = React.ComponentPropsWithoutRef<"div"> & {
  /** `prose` narrows to a comfortable reading measure for long-form text. */
  width?: "default" | "prose" | "wide";
};

const widths = {
  default: "max-w-container",
  prose: "max-w-3xl",
  wide: "max-w-[90rem]",
} as const;

/** Centres content and owns the horizontal gutter. Nothing else sets page padding. */
export function Container({
  width = "default",
  className,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-gutter sm:px-6 lg:px-8",
        widths[width],
        className,
      )}
      {...props}
    />
  );
}
