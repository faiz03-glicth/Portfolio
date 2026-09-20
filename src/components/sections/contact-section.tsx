import { ArrowUpRight, Mail } from "lucide-react";
import { portfolioService } from "@/lib/services/portfolio-service";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/heading";
import { Section } from "@/components/ui/section";
import { SocialLinkList } from "@/components/ui/social-links";

export async function ContactSection() {
  const [profile, socialLinks] = await Promise.all([
    portfolioService.getProfile(),
    portfolioService.getSocialLinks(),
  ]);

  return (
    <Section id="contact" tone="muted">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-surface px-6 py-12 sm:px-12 sm:py-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 60% 80% at 100% 0%, hsl(var(--color-primary) / 0.12), transparent 70%)",
          }}
        />

        <div className="relative">
          <SectionHeading
            align="center"
            eyebrow="Contact"
            title="Let us build something"
            description={`${profile.availability.label}. The fastest way to reach me is email — I read everything and reply to anything specific.`}
          />

          <div className="mt-8 flex flex-col items-center gap-5">
            <ButtonLink href={`mailto:${profile.email}`} size="lg">
              <Mail />
              {profile.email}
              <ArrowUpRight />
            </ButtonLink>

            <SocialLinkList
              links={socialLinks}
              showLabels
              className="justify-center"
            />
          </div>
        </div>
      </div>
    </Section>
  );
}
