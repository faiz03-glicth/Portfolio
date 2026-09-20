import { technologiesByCategory, technologyCategories } from "@/data/skills";
import { SectionHeading } from "@/components/ui/heading";
import { Section } from "@/components/ui/section";
import { Tag } from "@/components/ui/tag";
import { staggerDelay } from "@/lib/utils";

/**
 * Grouped technology stack.
 *
 * Categories and their order come from `src/data/skills.ts`. Adding a category
 * is a data edit; nothing here needs to change, and no technology carries its
 * own bespoke styling.
 */
export function StackSection() {
  const groups = technologyCategories
    .map((category) => ({
      ...category,
      items: technologiesByCategory(category.id),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <Section id="stack">
      <SectionHeading
        eyebrow="Stack"
        title="Tools I reach for"
        description="Grouped by where they sit in the system rather than by how much I like them."
      />

      <dl className="mt-10 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((group, index) => (
          <div
            key={group.id}
            className="stagger animate-fade-in-up"
            style={staggerDelay(index, 50)}
          >
            <dt className="flex items-baseline gap-2">
              <span className="font-mono text-2xs uppercase tracking-[0.16em] text-primary">
                {group.label}
              </span>
              <span className="text-2xs text-muted-foreground">
                {group.description}
              </span>
            </dt>
            <dd className="mt-3">
              <ul className="flex flex-wrap gap-1.5">
                {group.items.map((tech) => (
                  <li key={tech.id}>
                    <Tag
                      className={
                        tech.primary
                          ? "border-primary/30 bg-primary/10 text-primary"
                          : undefined
                      }
                    >
                      {tech.name}
                    </Tag>
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
