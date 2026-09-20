import type { Experience } from "@/lib/types";

/** PLACEHOLDER CONTENT — replace with your real history. */
export const experiences: readonly Experience[] = [
  {
    id: "exp-utm-grad",
    title: "Graduate Researcher",
    company: "Universiti Teknologi Malaysia",
    companyUrl: "https://www.utm.my",
    location: "Johor, Malaysia",
    kind: "education",
    description:
      "Graduate study in software engineering, focused on data-intensive web systems and the operational side of keeping them correct.",
    achievements: [
      "Built the data pipeline and query layer behind a research group's shared analysis tooling",
      "Introduced schema migrations and CI checks to a codebase that previously deployed by hand",
    ],
    technologies: ["python", "postgresql", "docker"],
    startDate: "2025-09-01",
    current: true,
    sortOrder: 100,
  },
  {
    id: "exp-freelance",
    title: "Full-Stack Engineer",
    company: "Independent",
    location: "Remote",
    kind: "work",
    description:
      "Contract work building and maintaining production web applications for small teams — typically owning the stack end to end, from schema to deployment.",
    achievements: [
      "Delivered four production Next.js applications, each with its own CI pipeline and staged rollout",
      "Cut one client's page load from 4.1s to 1.2s by moving data fetching server-side and fixing an N+1 in the listing query",
      "Set up automated Postgres backups and a tested restore procedure for clients who had neither",
    ],
    technologies: [
      "typescript",
      "nextjs",
      "react",
      "postgresql",
      "nginx",
      "pm2",
    ],
    startDate: "2024-01-01",
    current: true,
    sortOrder: 90,
  },
  {
    id: "exp-intern",
    title: "Software Engineering Intern",
    company: "Regional Technology Firm",
    location: "Kuala Lumpur, Malaysia",
    kind: "work",
    description:
      "Worked on an internal operations platform used by the logistics team, shipping features against a live Postgres database and a legacy PHP service.",
    achievements: [
      "Replaced a nightly CSV export with a typed REST endpoint, removing a recurring class of import failures",
      "Added integration tests to the reporting module, catching three date-boundary bugs before release",
    ],
    technologies: ["javascript", "react", "postgresql", "docker"],
    startDate: "2023-06-01",
    endDate: "2023-12-01",
    current: false,
    sortOrder: 80,
  },
  {
    id: "exp-utm-undergrad",
    title: "BSc Computer Science",
    company: "Universiti Teknologi Malaysia",
    companyUrl: "https://www.utm.my",
    location: "Johor, Malaysia",
    kind: "education",
    description:
      "Undergraduate degree in computer science. Final-year project was a distributed file-integrity checker built on content-addressed storage.",
    technologies: ["java", "python", "sql"],
    startDate: "2021-09-01",
    endDate: "2025-06-01",
    current: false,
    sortOrder: 70,
  },
] as const;
