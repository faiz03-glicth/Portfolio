import type { Metadata } from "next";
import { MapPin } from "lucide-react";
import { profile } from "@/data/profile";
import { socialLinks } from "@/data/social";
import { technologiesByCategory, technologyCategories } from "@/data/skills";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/heading";
import { Prose } from "@/components/ui/prose";
import { Section } from "@/components/ui/section";
import { SocialLinkList } from "@/components/ui/social-links";
import { Tag } from "@/components/ui/tag";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "About",
  description: profile.summary,
  path: "/about",
});

export default function AboutPage() {
  const groups = technologyCategories
    .map((category) => ({
      ...category,
      items: technologiesByCategory(category.id),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <>
      <Section size="large" containerWidth="prose">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <Avatar
            name={profile.name}
            src={profile.avatarUrl}
            size="xl"
            priority
          />

          <div className="space-y-4">
            <Badge tone="success" dot>
              {profile.availability.label}
            </Badge>
            <h1 className="text-4xl sm:text-5xl">{profile.name}</h1>
            <p className="text-lg text-muted-foreground">{profile.headline}</p>
            <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin aria-hidden className="size-4" />
              {profile.location}
            </p>
            <SocialLinkList links={socialLinks} showLabels className="-ml-2" />
          </div>
        </div>

        <Prose paragraphs={profile.bio} className="mt-12" />

        {profile.resumeUrl ? (
          <div className="mt-10">
            <ButtonLink href={profile.resumeUrl} variant="outline" external>
              Download résumé
            </ButtonLink>
          </div>
        ) : null}
      </Section>

      <Section tone="muted">
        <SectionHeading
          eyebrow="Stack"
          title="Everything I work with"
          description="The full list, grouped by where each piece sits in a system."
        />

        <dl className="mt-10 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <div key={group.id}>
              <dt className="font-mono text-2xs uppercase tracking-[0.16em] text-primary">
                {group.label}
              </dt>
              <dd className="mt-3">
                <ul className="flex flex-wrap gap-1.5">
                  {group.items.map((tech) => (
                    <li key={tech.id}>
                      <Tag>{tech.name}</Tag>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          ))}
        </dl>
      </Section>
    </>
  );
}
