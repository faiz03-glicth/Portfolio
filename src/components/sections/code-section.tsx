import { Github, Gitlab } from "lucide-react";
import {
  githubActivityFallback,
  gitlabActivityFallback,
} from "@/data/fallback/code-activity";
import { githubService } from "@/lib/integrations/github";
import { gitlabService } from "@/lib/integrations/gitlab";
import type { AsyncStatus, CodeActivity, Result } from "@/lib/types";
import { SectionHeading } from "@/components/ui/heading";
import { Section } from "@/components/ui/section";
import { CodeActivityPanel } from "@/components/integrations/code-activity-panel";
import { IntegrationCard } from "@/components/integrations/integration-card";

/**
 * GitHub and GitLab activity.
 *
 * Each panel is resolved independently, so one forge being unreachable leaves
 * the other — and the rest of the page — untouched. That isolation is the
 * whole reason the two are not fetched together and rendered from one result.
 *
 * Three distinct outcomes, kept distinct on purpose:
 *
 *   not configured  representative sample data, labelled as such
 *   configured, ok  live data
 *   configured, bad an unavailable state
 *
 * The last case does **not** quietly swap in the sample data. Once a provider
 * is configured, the visitor is being shown real numbers; substituting invented
 * ones on failure would misrepresent them as real.
 */

type PanelState =
  | { kind: "sample"; activity: CodeActivity }
  | { kind: "live"; activity: CodeActivity }
  | { kind: "unavailable" };

async function resolvePanel(
  configured: boolean,
  load: () => Promise<Result<CodeActivity>>,
  sample: CodeActivity,
): Promise<PanelState> {
  if (!configured) return { kind: "sample", activity: sample };

  const result = await load();
  if (result.ok) return { kind: "live", activity: result.data };

  return { kind: "unavailable" };
}

export async function CodeSection() {
  const [github, gitlab] = await Promise.all([
    resolvePanel(
      githubService.isConfigured(),
      () => githubService.getActivity(),
      githubActivityFallback,
    ),
    resolvePanel(
      gitlabService.isConfigured(),
      () => gitlabService.getActivity(),
      gitlabActivityFallback,
    ),
  ]);

  const anyLive = github.kind === "live" || gitlab.kind === "live";

  return (
    <Section id="code" tone="muted">
      <SectionHeading
        eyebrow="Activity"
        title="Where the commits go"
        description={
          anyLive
            ? "Pulled from GitHub and GitLab, cached and refreshed periodically."
            : "Representative activity across both forges. Connect the integrations to show live data."
        }
      />

      <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ActivityPanel state={github} label="GitHub" icon={Github} />
        <ActivityPanel state={gitlab} label="GitLab" icon={Gitlab} />
      </div>
    </Section>
  );
}

function ActivityPanel({
  state,
  label,
  icon,
}: {
  state: PanelState;
  label: string;
  icon: typeof Github;
}) {
  if (state.kind === "unavailable") {
    return (
      <IntegrationCard
        title={label}
        subtitle="Public activity"
        icon={icon}
        status={"error" satisfies AsyncStatus}
        errorTitle={`${label} unavailable`}
        errorDescription={`${label} could not be reached right now. Everything else on this page is unaffected.`}
      >
        {null}
      </IntegrationCard>
    );
  }

  // A calendar needs a token on both forges. Without one it comes back empty,
  // and an all-grey grid would read as a year of no work rather than as
  // missing data — so the heatmap is omitted instead.
  const hasCalendar = state.activity.contributions.length > 0;

  return (
    <CodeActivityPanel activity={state.activity} showHeatmap={hasCalendar} />
  );
}
