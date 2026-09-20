import type { Metadata } from "next";
import { Hero } from "@/components/hero/hero";
import { AboutSection } from "@/components/sections/about-section";
import { CodeSection } from "@/components/sections/code-section";
import { ContactSection } from "@/components/sections/contact-section";
import { ExperienceSection } from "@/components/sections/experience-section";
import { FeaturedProjectsSection } from "@/components/sections/featured-projects-section";
import { MusicSection } from "@/components/sections/music-section";
import { StackSection } from "@/components/sections/stack-section";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata();

/**
 * The homepage composes sections and nothing else — no fetching, no
 * transforming, no layout arithmetic. Each section owns its own data and its
 * own states, which is what keeps this file readable as a table of contents.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <AboutSection />
      <StackSection />
      <FeaturedProjectsSection />
      <ExperienceSection />
      <CodeSection />
      <MusicSection />
      <ContactSection />
    </>
  );
}
