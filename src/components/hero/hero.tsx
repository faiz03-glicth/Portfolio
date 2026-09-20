import { ArrowRight, MapPin } from "lucide-react";
import { portfolioService } from "@/lib/services/portfolio-service";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SocialLinkList } from "@/components/ui/social-links";
import { Tag } from "@/components/ui/tag";
import { staggerDelay } from "@/lib/utils";

const availabilityTone = {
  open: "success",
  selective: "warning",
  unavailable: "neutral",
} as const;

/**
 * Above-the-fold content.
 *
 * Reads through `portfolioService`, which resolves to database content when
 * Supabase is configured and to the static modules otherwise. Either way it
 * never waits on an *external* API — whatever else is slow on the page, the
 * hero paints from content the application already owns.
 */
export async function Hero() {
  const [profile, socialLinks, technologies] = await Promise.all([
    portfolioService.getProfile(),
    portfolioService.getSocialLinks(),
    portfolioService.getTechnologies(),
  ]);

  const highlights = technologies.filter((tech) => tech.primary).slice(0, 8);

  return (
    <section className="relative overflow-hidden border-b border-border">
      {/* Decorative backdrop: a soft primary wash plus a faint technical grid. */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-18rem] size-[40rem] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute right-[-10rem] top-[10rem] size-[26rem] rounded-full bg-accent/10 blur-[110px]" />
        <div
          className="absolute inset-0 opacity-[0.22]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--color-border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--color-border)) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage:
              "radial-gradient(ellipse 70% 60% at 50% 0%, black 40%, transparent 100%)",
          }}
        />
      </div>

      <Container className="relative">
        <div className="flex flex-col items-start gap-8 py-20 sm:py-28 lg:py-32">
          <Badge
            tone={availabilityTone[profile.availability.status]}
            dot
            className="stagger animate-fade-in-up"
            style={staggerDelay(0)}
          >
            {profile.availability.label}
          </Badge>

          <div className="max-w-3xl space-y-5">
            <h1
              className="stagger animate-fade-in-up text-4xl font-semibold sm:text-5xl lg:text-7xl"
              style={staggerDelay(1)}
            >
              <span className="block text-muted-foreground">
                {profile.name}
              </span>
              <span className="text-gradient block">{profile.headline}</span>
            </h1>

            <p
              className="stagger max-w-2xl animate-fade-in-up text-lg leading-relaxed text-muted-foreground"
              style={staggerDelay(2)}
            >
              {profile.summary}
            </p>
          </div>

          <div
            className="stagger flex animate-fade-in-up flex-wrap items-center gap-3"
            style={staggerDelay(3)}
          >
            <ButtonLink href="/projects" size="lg">
              View projects
              <ArrowRight />
            </ButtonLink>
            <ButtonLink href="/contact" variant="outline" size="lg">
              Get in touch
            </ButtonLink>
          </div>

          <div
            className="stagger flex animate-fade-in-up flex-wrap items-center gap-x-5 gap-y-3 text-sm text-muted-foreground"
            style={staggerDelay(4)}
          >
            <span className="inline-flex items-center gap-1.5">
              <MapPin aria-hidden className="size-4" />
              {profile.location}
            </span>
            <span aria-hidden className="hidden h-4 w-px bg-border sm:block" />
            <SocialLinkList links={socialLinks} className="-ml-2" />
          </div>

          <ul
            className="stagger flex animate-fade-in-up flex-wrap gap-2 pt-2"
            style={staggerDelay(5)}
          >
            {highlights.map((tech) => (
              <li key={tech.id}>
                <Tag>{tech.name}</Tag>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
