import { useMemo, useState } from "react";
import { Search, Plus, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Skills } from "@/page/Onboarding";
import api from "@/api/axios";
import { useQuery } from "@tanstack/react-query";

function OnboardingSkills({
  skills,
  setSkills,
  showValidationError,
}: {
  skills: Skills[];
  setSkills: React.Dispatch<React.SetStateAction<Skills[]>>;
  showValidationError: boolean;
}) {
  const [query, setQuery] = useState("");

  const fetchSkills = async () => {
    const response = await api.get("/api/profile/technology");
    return response.data.map((skill: Skills) => ({
      id: skill.id,
      name: skill.name,
    }));
  };
  const { data: allSkills } = useQuery({
    queryKey: ["skills"],
    queryFn: fetchSkills,
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allSkills || [];
    return (allSkills || []).filter((s: Skills) =>
      s.name.toLowerCase().includes(q),
    );
  }, [query, allSkills]);

  function toggle(skill: Skills) {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((p) => p !== skill) : [...prev, skill],
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl rounded-md border border-border/70 bg-card/90 p-4 shadow-sm backdrop-blur-sm md:p-6">
      <div className="mb-3">
        <h1 className="text-[16px] font-semibold tracking-tight">
          Add your skills
        </h1>
        <p className="text-[13px] text-muted-foreground">
          This helps us personalize your practice experience.
        </p>
      </div>

      <div className="mb-4">
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Search className="size-4" />
          </span>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a skill (e.g., React, SQL, Git)"
            className="pl-10"
          />
        </div>
      </div>

      <div className="mb-3 text-sm font-medium text-muted-foreground">
        Top skills for Frontend Developer
      </div>
      {showValidationError && skills.length === 0 && (
        <p className="mb-3 text-sm text-destructive">
          Select at least one skill to proceed.
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {filtered.map((skill: Skills) => {
          const isSelected = skills.includes(skill);
          return (
            <button
              key={skill.id}
              type="button"
              onClick={() => toggle(skill)}
              className={`flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-[13px] shadow-sm transition-colors focus:outline-none ${
                isSelected
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                  : "border-border bg-transparent text-foreground"
              }`}
            >
              <span>{skill.name}</span>
              <span className="ml-2">
                {isSelected ? (
                  <Check className="size-4 text-emerald-600" />
                ) : (
                  <Plus className="size-4 text-slate-400" />
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default OnboardingSkills;
