import { useMemo, useState } from "react";
import { Check, Plus, Search, Sparkles, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "@/api/axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Skills } from "@/pages/Onboarding";

const SUGGESTED = "suggested";
const ALL = "all";

const categoryLabels: Record<string, string> = {
  frontend: "Frontend",
  backend: "Backend",
  database: "Database",
  testing: "Testing",
  mobile: "Mobile",
  devops: "DevOps",
  cloud: "Cloud",
};

// Which technology categories fit each target role (matched on the role's name)
function getSuggestedCategories(roleName?: string): string[] {
  const role = roleName?.toLowerCase() ?? "";
  if (role.includes("full")) return ["frontend", "backend", "database"];
  if (role.includes("front")) return ["frontend"];
  if (role.includes("back")) return ["backend", "database"];
  if (role.includes("devops") || role.includes("cloud")) return ["devops", "cloud"];
  if (role.includes("qa") || role.includes("test")) return ["testing"];
  if (role.includes("mobile")) return ["mobile"];
  return [];
}

const fetchSkills = async (): Promise<Skills[]> => {
  const response = await api.get("/api/profile/technology");
  return response.data.map(({ id, name, category }: Skills) => ({ id, name, category }));
};

function OnboardingSkills({
  skills,
  setSkills,
  showValidationError,
  targetRoleName,
}: {
  skills: Skills[];
  setSkills: React.Dispatch<React.SetStateAction<Skills[]>>;
  showValidationError: boolean;
  targetRoleName?: string;
}) {
  const suggestedCategories = useMemo(
    () => getSuggestedCategories(targetRoleName),
    [targetRoleName],
  );
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState(suggestedCategories.length > 0 ? SUGGESTED : ALL);

  const { data: allSkills = [], isPending } = useQuery({
    queryKey: ["skills"],
    queryFn: fetchSkills,
  });

  const categories = useMemo(
    () => [...new Set(allSkills.map((skill) => skill.category).filter(Boolean))] as string[],
    [allSkills],
  );

  const visibleSkills = useMemo(() => {
    const q = query.trim().toLowerCase();
    // Searching looks through everything, regardless of the selected filter
    if (q) return allSkills.filter((skill) => skill.name.toLowerCase().includes(q));
    if (filter === SUGGESTED)
      return allSkills.filter((skill) => suggestedCategories.includes(skill.category ?? ""));
    if (filter === ALL) return allSkills;
    return allSkills.filter((skill) => skill.category === filter);
  }, [query, filter, allSkills, suggestedCategories]);

  const selectedIds = new Set(skills.map((skill) => skill.id));

  const toggle = (skill: Skills) => {
    setSkills((prev) =>
      prev.some((s) => s.id === skill.id)
        ? prev.filter((s) => s.id !== skill.id)
        : [...prev, skill],
    );
  };

  const filters = [
    ...(suggestedCategories.length > 0 ? [{ id: SUGGESTED, label: "Suggested" }] : []),
    { id: ALL, label: "All" },
    ...categories.map((category) => ({
      id: category,
      label: categoryLabels[category] ?? category,
    })),
  ];

  return (
    <div className="space-y-6">
      {/* Selected tray */}
      <div
        className={cn(
          "rounded-[8px] border border-dashed p-3.5 transition-colors",
          skills.length > 0 && "border-solid bg-muted/30",
          showValidationError && skills.length === 0 && "border-destructive/50",
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium">
            {skills.length > 0 ? `${skills.length} selected` : "No skills selected yet"}
          </p>
          {skills.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={() => setSkills([])}
            >
              Clear all
            </Button>
          )}
        </div>
        {skills.length > 0 ? (
          <ul className="mt-2.5 flex flex-wrap gap-1.5">
            {skills.map((skill) => (
              <li key={skill.id}>
                <button
                  type="button"
                  onClick={() => toggle(skill)}
                  className="inline-flex h-7 items-center gap-1 rounded-full bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/85"
                  aria-label={`Remove ${skill.name}`}
                >
                  {skill.name}
                  <X className="size-3" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p
            className={cn(
              "mt-1 text-xs text-muted-foreground",
              showValidationError && "text-destructive",
            )}
            role={showValidationError ? "alert" : undefined}
          >
            {showValidationError
              ? "Select at least one skill to continue."
              : "Pick at least one. Your practice questions will focus on these."}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search technologies (e.g. React, SQL, Docker)"
            aria-label="Search technologies"
            className="h-10 pl-9"
          />
        </div>

        {!query && (
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by category">
            {filters.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={filter === item.id}
                onClick={() => setFilter(item.id)}
                className={cn(
                  "inline-flex h-7 items-center gap-1 rounded-md px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                  filter === item.id && "bg-muted text-foreground ring-1 ring-border",
                )}
              >
                {item.id === SUGGESTED && <Sparkles className="size-3 text-(--preparo-teal)" aria-hidden="true" />}
                {item.label}
              </button>
            ))}
          </div>
        )}

        {filter === SUGGESTED && !query && targetRoleName && (
          <p className="text-xs text-muted-foreground">
            Common for a <span className="font-medium text-foreground">{targetRoleName}</span>
          </p>
        )}
      </div>

      {isPending ? (
        <div className="flex flex-wrap gap-2" aria-hidden="true">
          {Array.from({ length: 12 }, (_, i) => (
            <div key={i} className="h-9 w-24 animate-pulse rounded-full bg-muted" />
          ))}
        </div>
      ) : visibleSkills.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {visibleSkills.map((skill) => {
            const isSelected = selectedIds.has(skill.id);
            return (
              <li key={skill.id}>
                <button
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => toggle(skill)}
                  className={cn(
                    "inline-flex h-9 items-center gap-1.5 rounded-full border bg-card px-3.5 text-sm transition-colors outline-none hover:border-primary/40 hover:bg-muted/30 focus-visible:ring-2 focus-visible:ring-ring/40",
                    isSelected &&
                      "border-primary bg-primary/6 text-primary hover:border-primary hover:bg-primary/10",
                  )}
                >
                  {isSelected ? (
                    <Check className="size-3.5" aria-hidden="true" />
                  ) : (
                    <Plus className="size-3.5 text-muted-foreground" aria-hidden="true" />
                  )}
                  {skill.name}
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="rounded-[8px] bg-muted/40 px-4 py-6 text-center text-sm text-muted-foreground">
          No technologies match &ldquo;{query}&rdquo;.
        </p>
      )}
    </div>
  );
}

export default OnboardingSkills;
