import api from "@/api/axios";

// Mirrors the server's TechnologyKind enum, in display order
export const TECHNOLOGY_KINDS = [
  "LANGUAGE",
  "FRAMEWORK",
  "PLATFORM",
  "DATABASE",
  "CLOUD",
  "TOOL",
  "TESTING",
] as const;
export type TechnologyKind = (typeof TECHNOLOGY_KINDS)[number];

export const kindLabels: Record<TechnologyKind, string> = {
  LANGUAGE: "Languages",
  FRAMEWORK: "Frameworks",
  PLATFORM: "Platforms",
  DATABASE: "Databases",
  CLOUD: "Cloud",
  TOOL: "Tools",
  TESTING: "Testing",
};

// Mirrors the server's Proficiency enum
export type Proficiency = "LEARNING" | "COMFORTABLE" | "STRONG";

export const DEFAULT_PROFICIENCY: Proficiency = "COMFORTABLE";

export const proficiencyOptions: { value: Proficiency; label: string }[] = [
  { value: "LEARNING", label: "Learning" },
  { value: "COMFORTABLE", label: "Comfortable" },
  { value: "STRONG", label: "Strong" },
];

export const proficiencyLabels = Object.fromEntries(
  proficiencyOptions.map(({ value, label }) => [value, label]),
) as Record<Proficiency, string>;

export type Technology = {
  id: number;
  name: string;
  kind: TechnologyKind | null;
  // Domain codes, e.g. ["frontend", "backend"]
  domains: string[];
};

export type RoleDomain = {
  code: string;
  name: string;
  // Primary domains are the role's core; secondary ones are "also useful"
  primary: boolean;
};

export type CareerRole = {
  id: number;
  name: string;
  domains: RoleDomain[];
};

export const fetchCareerRoles = async (): Promise<CareerRole[]> => {
  const response = await api.get("/api/profile/career-role");
  return response.data.map(({ id, name, domains }: CareerRole) => ({
    id,
    name,
    domains: domains ?? [],
  }));
};

export const fetchTechnologies = async (): Promise<Technology[]> => {
  const response = await api.get("/api/profile/technology");
  return response.data.map(({ id, name, kind, domains }: Technology) => ({
    id,
    name,
    kind: kind ?? null,
    domains: domains ?? [],
  }));
};

const kindOrder = (kind: TechnologyKind | null) =>
  kind ? TECHNOLOGY_KINDS.indexOf(kind) : TECHNOLOGY_KINDS.length;

export const sortByKind = (technologies: Technology[]) =>
  [...technologies].sort((a, b) => kindOrder(a.kind) - kindOrder(b.kind));

/**
 * Splits the catalog into what fits a role. "core" shares a primary domain with the role,
 * "related" shares only a secondary one. Nothing is excluded from picking; this only orders suggestions.
 */
export function getSuggestions(technologies: Technology[], role?: CareerRole | null) {
  const primary = new Set(role?.domains.filter((d) => d.primary).map((d) => d.code));
  const secondary = new Set(role?.domains.filter((d) => !d.primary).map((d) => d.code));

  const core = technologies.filter((t) => t.domains.some((code) => primary.has(code)));
  const coreIds = new Set(core.map((t) => t.id));
  const related = technologies.filter(
    (t) => !coreIds.has(t.id) && t.domains.some((code) => secondary.has(code)),
  );

  return { core: sortByKind(core), related: sortByKind(related) };
}
