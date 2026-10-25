import { useMemo, useRef, useState } from "react";
import { Check, Plus, Search, Sparkles, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Skills } from "@/pages/Onboarding";
import {
  DEFAULT_PROFICIENCY,
  TECHNOLOGY_KINDS,
  fetchTechnologies,
  getSuggestions,
  kindLabels,
  proficiencyOptions,
  sortByKind,
  type CareerRole,
  type Proficiency,
  type Technology,
} from "./api/catalogApi";

const SUGGESTED = "suggested";
const ALL = "all";

function OnboardingSkills({
  skills,
  setSkills,
  showValidationError,
  targetRole,
}: {
  skills: Skills[];
  setSkills: React.Dispatch<React.SetStateAction<Skills[]>>;
  showValidationError: boolean;
  targetRole?: CareerRole | null;
}) {
  const { data: allTechnologies = [], isPending } = useQuery({
    queryKey: ["technology"],
    queryFn: fetchTechnologies,
  });

  const suggestions = useMemo(
    () => getSuggestions(allTechnologies, targetRole),
    [allTechnologies, targetRole],
  );
  const hasSuggestions = suggestions.core.length + suggestions.related.length > 0;

  const [query, setQuery] = useState("");
  // Start on "Suggested" when the role has any; the catalog loads after mount, so null means "not chosen yet"
  const [chosenFilter, setChosenFilter] = useState<string | null>(null);
  const filter = chosenFilter ?? (hasSuggestions ? SUGGESTED : ALL);

  const kinds = useMemo(
    () => TECHNOLOGY_KINDS.filter((kind) => allTechnologies.some((t) => t.kind === kind)),
    [allTechnologies],
  );

  const filters = [
    ...(hasSuggestions ? [{ id: SUGGESTED, label: "Suggested" }] : []),
    { id: ALL, label: "All" },
    ...kinds.map((kind) => ({ id: kind, label: kindLabels[kind] })),
  ];

  // Searching looks through everything, regardless of the selected filter
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? allTechnologies.filter((t) => t.name.toLowerCase().includes(q)) : null;
  }, [query, allTechnologies]);

  const visibleTechnologies = useMemo(() => {
    if (filter === ALL) return sortByKind(allTechnologies);
    return allTechnologies.filter((t) => t.kind === filter);
  }, [filter, allTechnologies]);

  const selectedIds = new Set(skills.map((skill) => skill.id));

  const toggle = (technology: Technology) => {
    setSkills((prev) =>
      prev.some((s) => s.id === technology.id)
        ? prev.filter((s) => s.id !== technology.id)
        : [...prev, { ...technology, proficiency: DEFAULT_PROFICIENCY }],
    );
  };

  const setProficiency = (id: number, proficiency: Proficiency) => {
    setSkills((prev) => prev.map((s) => (s.id === id ? { ...s, proficiency } : s)));
  };

  const renderTechnologies = (technologies: Technology[]) => (
    <ul className="flex flex-wrap gap-2">
      {technologies.map((technology) => (
        <li key={technology.id}>
          <TechnologyChip
            technology={technology}
            isSelected={selectedIds.has(technology.id)}
            onToggle={toggle}
          />
        </li>
      ))}
    </ul>
  );

  return (
    <div className="space-y-6">
      {/* Selected skills, each with how strong the user is in it */}
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
          <>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Mark how strong you are in each, so we know where you excel.
            </p>
            <ul className="mt-3 divide-y rounded-[6px] border bg-card">
              {skills.map((skill) => (
                <li
                  key={skill.id}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 gap-y-2 px-3 py-2 sm:grid-cols-[minmax(0,1fr)_auto_auto]"
                >
                  <span className="truncate text-sm font-medium">{skill.name}</span>
                  <ProficiencyToggle
                    label={`${skill.name} strength`}
                    value={skill.proficiency}
                    onChange={(value) => setProficiency(skill.id, value)}
                    className="order-3 col-span-2 sm:order-none sm:col-span-1"
                  />
                  <button
                    type="button"
                    onClick={() => toggle(skill)}
                    className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
                    aria-label={`Remove ${skill.name}`}
                  >
                    <X className="size-4" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          </>
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
              : "Pick any you know, even outside your target role. Your practice questions will focus on these."}
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
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter technologies">
            {filters.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={filter === item.id}
                onClick={() => setChosenFilter(item.id)}
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
      </div>

      {isPending ? (
        <div className="flex flex-wrap gap-2" aria-hidden="true">
          {Array.from({ length: 12 }, (_, i) => (
            <div key={i} className="h-9 w-24 animate-pulse rounded-full bg-muted" />
          ))}
        </div>
      ) : searchResults ? (
        searchResults.length > 0 ? (
          renderTechnologies(searchResults)
        ) : (
          <p className="rounded-[8px] bg-muted/40 px-4 py-6 text-center text-sm text-muted-foreground">
            No technologies match &ldquo;{query}&rdquo;.
          </p>
        )
      ) : filter === SUGGESTED ? (
        <div className="space-y-5">
          {suggestions.core.length > 0 && (
            <section className="space-y-2.5">
              <h3 className="text-xs font-medium text-muted-foreground">
                Core for a <span className="text-foreground">{targetRole?.name}</span>
              </h3>
              {renderTechnologies(suggestions.core)}
            </section>
          )}
          {suggestions.related.length > 0 && (
            <section className="space-y-2.5">
              <h3 className="text-xs font-medium text-muted-foreground">Also useful</h3>
              {renderTechnologies(suggestions.related)}
            </section>
          )}
        </div>
      ) : (
        renderTechnologies(visibleTechnologies)
      )}
    </div>
  );
}

function TechnologyChip({
  technology,
  isSelected,
  onToggle,
}: {
  technology: Technology;
  isSelected: boolean;
  onToggle: (technology: Technology) => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={() => onToggle(technology)}
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
      {technology.name}
    </button>
  );
}

// Segmented radio group: arrow keys move between levels, Tab leaves the group
function ProficiencyToggle({
  label,
  value,
  onChange,
  className,
}: {
  label: string;
  value: Proficiency;
  onChange: (value: Proficiency) => void;
  className?: string;
}) {
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const next = (index + step + proficiencyOptions.length) % proficiencyOptions.length;
    onChange(proficiencyOptions[next].value);
    buttonRefs.current[next]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn("flex rounded-md border bg-muted/40 p-0.5", className)}
    >
      {proficiencyOptions.map((option, index) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            ref={(element) => {
              buttonRefs.current[index] = element;
            }}
            type="button"
            role="radio"
            aria-checked={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={cn(
              "h-7 flex-1 rounded-[5px] px-2.5 text-xs font-medium text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40 sm:flex-none",
              isActive && "bg-background text-foreground shadow-sm",
              isActive && option.value === "STRONG" && "bg-primary text-primary-foreground hover:text-primary-foreground",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export default OnboardingSkills;
