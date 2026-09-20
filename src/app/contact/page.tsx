import type { Metadata } from "next";
import { ArrowUpRight, Clock, Mail, MapPin } from "lucide-react";
import { profile as staticProfile } from "@/data/profile";
import { portfolioService } from "@/lib/services/portfolio-service";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/heading";
import { Section } from "@/components/ui/section";
import { SocialLinkItem } from "@/components/ui/social-links";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Contact",
  description: `Get in touch with ${staticProfile.name} — email and social links.`,
  path: "/contact",
});

export default async function ContactPage() {
  const [profile, socialLinks] = await Promise.all([
    portfolioService.getProfile(),
    portfolioService.getSocialLinks(),
  ]);

  const facts = [
    { icon: MapPin, label: "Based in", value: profile.location },
    { icon: Clock, label: "Timezone", value: "GMT+8 (MYT)" },
    { icon: Mail, label: "Response time", value: "Usually within two days" },
  ];

  return (
    <Section size="large" containerWidth="prose">
      <SectionHeading
        as="h1"
        eyebrow="Contact"
        title="Get in touch"
        description="Email is best. Tell me what you are building and where it is stuck — that gets a much better reply than a general introduction."
      />

      <Card className="mt-12 p-6 sm:p-8">
        <p className="font-mono text-2xs uppercase tracking-[0.16em] text-muted-foreground">
          Email
        </p>
        <ButtonLink href={`mailto:${profile.email}`} size="lg" className="mt-3">
          <Mail />
          {profile.email}
          <ArrowUpRight />
        </ButtonLink>

        <div className="mt-8 border-t border-border pt-6">
          <p className="font-mono text-2xs uppercase tracking-[0.16em] text-muted-foreground">
            Elsewhere
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {socialLinks
              .filter((link) => link.platform !== "email")
              .map((link) => (
                <li key={link.id}>
                  <SocialLinkItem
                    link={link}
                    showLabel
                    className="border-border bg-surface"
                  />
                </li>
              ))}
          </ul>
        </div>
      </Card>

      <dl className="mt-8 grid gap-4 sm:grid-cols-3">
        {facts.map((fact) => (
          <div key={fact.label} className="rounded-lg border border-border p-4">
            <dt className="inline-flex items-center gap-1.5 font-mono text-2xs uppercase tracking-[0.14em] text-muted-foreground">
              <fact.icon aria-hidden className="size-3.5" />
              {fact.label}
            </dt>
            <dd className="mt-1.5 text-sm text-foreground">{fact.value}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
