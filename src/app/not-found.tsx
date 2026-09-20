import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { mainNav } from "@/config/navigation";

export default function NotFound() {
  return (
    <Section size="large" containerWidth="prose" className="text-center">
      <p className="font-mono text-2xs uppercase tracking-[0.18em] text-primary">
        404
      </p>
      <h1 className="mt-4 text-4xl sm:text-5xl">This page does not exist</h1>
      <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
        The link may be out of date, or the page may have moved. Everything else
        is still where you left it.
      </p>

      <div className="mt-8 flex justify-center">
        <ButtonLink href="/">Back to home</ButtonLink>
      </div>

      <nav aria-label="Suggested pages" className="mt-10">
        <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2">
          {mainNav.slice(1).map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="rounded-sm text-sm text-muted-foreground transition-colors duration-base ease-standard hover:text-foreground"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </Section>
  );
}
