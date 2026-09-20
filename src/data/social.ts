import type { SocialLink } from "@/lib/types";

/** PLACEHOLDER CONTENT — swap in your own handles. */
export const socialLinks: readonly SocialLink[] = [
  {
    id: "github",
    platform: "github",
    label: "GitHub",
    url: "https://github.com/faiz03-glicth",
    handle: "@faiz03-glicth",
  },
  {
    id: "gitlab",
    platform: "gitlab",
    label: "GitLab",
    url: "https://gitlab.com/faiz03-glicth",
    handle: "@faiz03-glicth",
  },
  {
    id: "linkedin",
    platform: "linkedin",
    label: "LinkedIn",
    url: "https://www.linkedin.com/in/faiz03",
    handle: "in/faiz03",
  },
  {
    id: "email",
    platform: "email",
    label: "Email",
    url: "mailto:faiz03@graduate.utm.my",
    handle: "faiz03@graduate.utm.my",
  },
] as const;
