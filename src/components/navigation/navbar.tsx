"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Terminal } from "lucide-react";
import { mainNav } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { Container } from "@/components/ui/container";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/utils";
import { MobileNav } from "./mobile-nav";
import { NavLink } from "./nav-link";

/**
 * Sticky site header.
 *
 * The only reason this is a Client Component is the scroll listener that
 * condenses the bar once the page moves. Everything it renders is otherwise
 * static, so the interactive surface stays small.
 */
export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-header border-b transition-[background-color,border-color,backdrop-filter]",
        "duration-base ease-standard",
        scrolled
          ? "border-border bg-background/80 backdrop-blur-md"
          : "border-transparent bg-transparent",
      )}
    >
      <Container>
        <div className="flex h-16 items-center justify-between gap-4">
          <Link
            href="/"
            className="group flex items-center gap-2 rounded-md font-heading text-sm font-semibold tracking-tight"
          >
            <span
              aria-hidden
              className="grid size-8 place-items-center rounded-md border border-border bg-surface text-primary transition-colors duration-base ease-standard group-hover:border-primary/40"
            >
              <Terminal className="size-4" />
            </span>
            <span>{siteConfig.name}</span>
          </Link>

          <nav aria-label="Main" className="hidden md:block">
            <ul className="flex items-center gap-1">
              {mainNav.map((item) => (
                <li key={item.href}>
                  <NavLink item={item} />
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-1">
            <ThemeToggle />
            <MobileNav />
          </div>
        </div>
      </Container>
    </header>
  );
}
