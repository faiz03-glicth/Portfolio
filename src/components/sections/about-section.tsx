import { ArrowRight } from "lucide-react";
import { profile } from "@/data/profile";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/heading";
import { Prose } from "@/components/ui/prose";
import { Section } from "@/components/ui/section";

/** Homepage About band — an excerpt, with the full text living on /about. */
export function AboutSection() {
  return (
    <Section id="about" tone="muted">
      <SectionHeading
        eyebrow="About"
        title="Engineering that survives contact with production"
        action={
          <ButtonLink href="/about" variant="ghost" size="sm">
            Read more
            <ArrowRight />
          </ButtonLink>
        }
      />
      <Prose paragraphs={profile.bio.slice(0, 2)} className="mt-8 max-w-3xl" />
    </Section>
  );
}
