import { Github, Gitlab } from "lucide-react";
import type { AsyncStatus, CodeActivity } from "@/lib/types";
import { StatCard } from "@/components/ui/stat-card";
import { formatCompactNumber } from "@/lib/utils";
import { ContributionHeatmap } from "./contribution-heatmap";
import { IntegrationCard } from "./integration-card";
import { LanguageBar } from "./language-bar";

const providerMeta = {
  github: { label: "GitHub", icon: Github },
  gitlab: { label: "GitLab", icon: Gitlab },
} as const;

/**
 * Renders normalised `CodeActivity`. It is identical for GitHub and GitLab,
 * which is the point: the provider only survives as a label and an icon, and
 * adding a third forge means adding an adapter, not a component.
 */
export function CodeActivityPanel({
  activity,
  status = "success",
  showHeatmap = true,
}: {
  activity: CodeActivity;
  status?: AsyncStatus;
  showHeatmap?: boolean;
}) {
  const meta = providerMeta[activity.provider];

  return (
    <IntegrationCard
      title={meta.label}
      subtitle={`@${activity.username}`}
      icon={meta.icon}
      href={activity.profileUrl}
      status={status}
      errorDescription={`${meta.label} could not be reached. The rest of the page is unaffected.`}
      loadingRows={4}
    >
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard
            label="Repos"
            value={formatCompactNumber(activity.publicRepos)}
            hint="public"
          />
          <StatCard
            label="Contributions"
            value={formatCompactNumber(activity.contributionTotal)}
            hint="past 12 months"
          />
          <StatCard
            label={
              typeof activity.followers === "number" ? "Followers" : "Stars"
            }
            value={formatCompactNumber(
              activity.followers ?? activity.totalStars ?? 0,
            )}
            hint={
              typeof activity.followers === "number"
                ? "on " + meta.label
                : "earned"
            }
            className="col-span-2 sm:col-span-1"
          />
        </div>

        {showHeatmap ? (
          <ContributionHeatmap days={activity.contributions} />
        ) : null}

        <LanguageBar languages={activity.topLanguages} />
      </div>
    </IntegrationCard>
  );
}
