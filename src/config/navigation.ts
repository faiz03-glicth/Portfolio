import type { LucideIcon } from "lucide-react";
import { Briefcase, FolderGit2, Home, Mail, Music, User } from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  /** Shown in the mobile drawer; the desktop bar stays text-only. */
  icon: LucideIcon;
  description: string;
};

/** Primary navigation. Order here is the order rendered everywhere. */
export const mainNav: readonly NavItem[] = [
  {
    label: "Home",
    href: "/",
    icon: Home,
    description: "Overview and highlights",
  },
  {
    label: "About",
    href: "/about",
    icon: User,
    description: "Background and how I work",
  },
  {
    label: "Experience",
    href: "/experience",
    icon: Briefcase,
    description: "Roles and timeline",
  },
  {
    label: "Projects",
    href: "/projects",
    icon: FolderGit2,
    description: "Things I have built",
  },
  {
    label: "Music",
    href: "/music",
    icon: Music,
    description: "What I listen to while building",
  },
  {
    label: "Contact",
    href: "/contact",
    icon: Mail,
    description: "Get in touch",
  },
] as const;

/** In-page anchors for the homepage section rail. */
export const homeSections = [
  { id: "about", label: "About" },
  { id: "stack", label: "Stack" },
  { id: "projects", label: "Projects" },
  { id: "experience", label: "Experience" },
  { id: "code", label: "Code" },
  { id: "music", label: "Music" },
  { id: "contact", label: "Contact" },
] as const;

export const footerNav: readonly {
  heading: string;
  items: readonly NavItem[];
}[] = [
  { heading: "Navigate", items: mainNav.slice(0, 3) },
  { heading: "More", items: mainNav.slice(3) },
] as const;
