import { Section } from "@/components/ui/section";
import { Skeleton } from "@/components/ui/skeleton";

/** Route-level loading fallback, shaped like a typical page header. */
export default function Loading() {
  return (
    <Section size="large" containerWidth="prose">
      <div role="status" aria-busy="true" className="space-y-4">
        <span className="sr-only">Loading page…</span>
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="grid gap-4 pt-8 sm:grid-cols-2">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    </Section>
  );
}
