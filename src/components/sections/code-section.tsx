import { appConfig } from "@/config/app";
import {
  githubActivityFallback,
  gitlabActivityFallback,
} from "@/data/fallback/code-activity";
import { SectionHeading } from "@/components/ui/heading";
import { Section } from "@/components/ui/section";
import { CodeActivityPanel } from "@/components/integrations/code-activity-panel";

/**
 * GitHub and GitLab activity.
 *
 * On `main` both panels render static fallback data. The `integration` branch
 * swaps the source for live adapter calls behind `appConfig.features.*` —
 * `CodeActivityPanel` itself does not change, because it consumes the
 * normalised `CodeActivity` model either way.
 */
export function CodeSection() {
  const usingLiveData = appConfig.features.github || appConfig.features.gitlab;

  return (
    <Section id="code" tone="muted">
      <SectionHeading
        eyebrow="Activity"
        title="Where the commits go"
        description={
          usingLiveData
            ? "Pulled from GitHub and GitLab, cached and refreshed periodically."
            : "Representative activity across both forges. Live data is wired up on the integration branch."
        }
      />

      <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <CodeActivityPanel activity={githubActivityFallback} />
        <CodeActivityPanel
          activity={gitlabActivityFallback}
          showHeatmap={false}
        />
      </div>
    </Section>
  );
}
