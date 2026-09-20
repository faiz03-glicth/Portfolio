import type { Technology, TechnologyCategory } from "@/lib/types";

/** Display order and labels for the grouped stack section. */
export const technologyCategories: readonly {
  id: TechnologyCategory;
  label: string;
  description: string;
}[] = [
  {
    id: "languages",
    label: "Languages",
    description: "What I write day to day",
  },
  {
    id: "frameworks",
    label: "Frameworks",
    description: "Application and UI layer",
  },
  {
    id: "backend",
    label: "Backend",
    description: "Services, APIs and runtime",
  },
  { id: "database", label: "Database", description: "Storage and query layer" },
  { id: "devops", label: "DevOps", description: "Build, ship and run" },
  { id: "cloud", label: "Cloud", description: "Where it runs" },
  { id: "tools", label: "Tools", description: "Everything else in the loop" },
] as const;

/** PLACEHOLDER CONTENT — edit freely. `primary` surfaces it on the homepage. */
export const technologies: readonly Technology[] = [
  {
    id: "typescript",
    name: "TypeScript",
    category: "languages",
    primary: true,
  },
  { id: "javascript", name: "JavaScript", category: "languages" },
  { id: "python", name: "Python", category: "languages", primary: true },
  { id: "sql", name: "SQL", category: "languages", primary: true },
  { id: "java", name: "Java", category: "languages" },
  { id: "bash", name: "Bash", category: "languages" },

  { id: "nextjs", name: "Next.js", category: "frameworks", primary: true },
  { id: "react", name: "React", category: "frameworks", primary: true },
  {
    id: "tailwind",
    name: "Tailwind CSS",
    category: "frameworks",
    primary: true,
  },
  { id: "express", name: "Express", category: "frameworks" },
  { id: "fastapi", name: "FastAPI", category: "frameworks" },

  { id: "nodejs", name: "Node.js", category: "backend", primary: true },
  { id: "rest", name: "REST APIs", category: "backend" },
  { id: "graphql", name: "GraphQL", category: "backend" },
  { id: "zod", name: "Zod", category: "backend" },

  { id: "postgresql", name: "PostgreSQL", category: "database", primary: true },
  { id: "supabase", name: "Supabase", category: "database", primary: true },
  { id: "redis", name: "Redis", category: "database" },
  { id: "prisma", name: "Prisma", category: "database" },

  { id: "docker", name: "Docker", category: "devops", primary: true },
  { id: "gitlab-ci", name: "GitLab CI/CD", category: "devops", primary: true },
  { id: "github-actions", name: "GitHub Actions", category: "devops" },
  { id: "nginx", name: "Nginx", category: "devops" },
  { id: "pm2", name: "PM2", category: "devops" },

  { id: "hostinger", name: "Hostinger VPS", category: "cloud" },
  { id: "vercel", name: "Vercel", category: "cloud" },
  { id: "aws", name: "AWS", category: "cloud" },
  { id: "cloudflare", name: "Cloudflare", category: "cloud" },

  { id: "git", name: "Git", category: "tools", primary: true },
  { id: "playwright", name: "Playwright", category: "tools" },
  { id: "vitest", name: "Vitest", category: "tools" },
  { id: "figma", name: "Figma", category: "tools" },
  { id: "linux", name: "Linux", category: "tools" },
] as const;

/** Resolves display names for the string IDs stored on projects. */
export function technologyName(id: string): string {
  return technologies.find((tech) => tech.id === id)?.name ?? id;
}
