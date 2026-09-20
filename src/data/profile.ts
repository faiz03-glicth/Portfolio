import type { Profile } from "@/lib/types";

/**
 * PLACEHOLDER CONTENT — edit this file to make the site yours.
 * Nothing outside this module hardcodes any of these strings.
 */
export const profile: Profile = {
  name: "Ahmad Faiz",
  headline: "Software Engineer",
  summary:
    "I build web systems that hold up in production — typed end to end, observable, and boring in the ways that matter.",
  bio: [
    "I am a software engineer based in Malaysia, currently completing graduate study at Universiti Teknologi Malaysia. My work sits where product engineering meets infrastructure: designing the data model, building the interface on top of it, and owning the pipeline that ships it.",
    "Most of what I build is full-stack TypeScript — Next.js on the front, PostgreSQL underneath, with a service layer in between that keeps the two from leaking into each other. I care a lot about that middle layer. It is the difference between a codebase you can change in a year and one you rewrite.",
    "Outside of feature work I spend time on the parts people skip: migrations that roll back cleanly, CI that fails for the right reasons, and error states that tell a visitor something useful instead of rendering a blank panel.",
  ],
  location: "Johor, Malaysia",
  websiteUrl: "https://github.com/faiz03-glicth",
  email: "faiz03@graduate.utm.my",
  availability: {
    status: "open",
    label: "Open to opportunities",
  },
  resumeUrl: "/resume.pdf",
};
