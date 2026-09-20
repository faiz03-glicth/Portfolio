"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Section } from "@/components/ui/section";

/**
 * Route-level error boundary.
 *
 * Shows a fixed, safe message — never `error.message`, which can carry
 * upstream detail. The digest is surfaced instead so a report can be matched
 * against server logs without exposing anything.
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // The server has already logged the full error; this is the client record.
    console.error("Route error", error.digest ?? error.name);
  }, [error]);

  return (
    <Section size="large" containerWidth="prose" className="text-center">
      <p className="font-mono text-2xs uppercase tracking-[0.18em] text-warning">
        Error
      </p>
      <h1 className="mt-4 text-3xl sm:text-4xl">Something went wrong</h1>
      <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
        This page failed to render. Trying again often resolves it — if not, the
        rest of the site is unaffected.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <ButtonLink href="/" variant="outline">
          Back to home
        </ButtonLink>
      </div>

      {error.digest ? (
        <p className="mt-8 font-mono text-2xs text-muted-foreground">
          Reference: {error.digest}
        </p>
      ) : null}
    </Section>
  );
}
