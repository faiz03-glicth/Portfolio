"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/config/navigation";

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavLink({
  item,
  onNavigate,
  className,
  children,
}: {
  item: NavItem;
  /** Lets the mobile drawer close itself when a link is followed. */
  onNavigate?: () => void;
  className?: string;
  children?: React.ReactNode;
}) {
  const pathname = usePathname();
  const active = isActive(pathname ?? "/", item.href);

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative rounded-md px-3 py-2 text-sm transition-colors duration-base ease-standard",
        active
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground",
        className,
      )}
    >
      {children ?? item.label}
      {active ? (
        <span
          aria-hidden
          className="absolute inset-x-3 -bottom-px h-px bg-gradient-to-r from-transparent via-primary to-transparent"
        />
      ) : null}
    </Link>
  );
}
