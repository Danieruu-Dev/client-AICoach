import {
  BadgeCheck,
  Briefcase,
  Code2,
  GraduationCap,
  Search,
  ShieldCheck,
  Shuffle,
  type LucideIcon,
} from "lucide-react";
import type { ProfileState } from "@/pages/Onboarding";
import { ChoiceCards, ChoicePills } from "./components/ChoiceGroups";

// ids must match the server's CurrentStatus / CodingExperience enums
const currentStatusOptions = [
  { id: "STUDENT", name: "Student" },
  { id: "FRESH_GRADUATE", name: "Fresh Graduate" },
  { id: "CAREER_SHIFTER", name: "Career Shifter" },
  { id: "JUNIOR_DEVELOPER", name: "Junior Developer" },
  { id: "UNEMPLOYED", name: "Unemployed" },
  { id: "EMPLOYED_LOOKING", name: "Employed but Looking" },
];

const statusMeta: Record<string, { icon: LucideIcon; description: string }> = {
  STUDENT: { icon: GraduationCap, description: "Still in school or a bootcamp" },
  FRESH_GRADUATE: { icon: BadgeCheck, description: "Recently finished your studies" },
  CAREER_SHIFTER: { icon: Shuffle, description: "Moving into tech from another field" },
  JUNIOR_DEVELOPER: { icon: Code2, description: "Early in your developer career" },
  UNEMPLOYED: { icon: Search, description: "Between jobs and job hunting" },
  EMPLOYED_LOOKING: { icon: Briefcase, description: "Working, but open to a new role" },
};

const codingExperienceOptions = [
  { id: "LESS_THAN_6_MONTHS", name: "Less than 6 months" },
  { id: "SIX_MONTHS_TO_1_YEAR", name: "6 months to 1 year" },
  { id: "ONE_TO_TWO_YEARS", name: "1 to 2 years" },
  { id: "TWO_TO_FOUR_YEARS", name: "2 to 4 years" },
  { id: "FOUR_PLUS_YEARS", name: "4+ years" },
];

export function OnboardingProfile({
  profile,
  setProfile,
  showValidationError,
}: {
  profile: ProfileState;
  setProfile: React.Dispatch<React.SetStateAction<ProfileState>>;
  showValidationError: boolean;
}) {
  return (
    <div className="space-y-8">
      <ChoiceCards
        label="Where are you right now?"
        options={currentStatusOptions}
        value={profile.currentStatus}
        onChange={(value) =>
          setProfile((prev) => ({ ...prev, currentStatus: value }))
        }
        getMeta={(option) => statusMeta[option.id]}
        invalid={showValidationError}
        errorMessage="Choose the option that fits you best."
      />

      <ChoicePills
        label="How long have you been coding?"
        hint="Include school, bootcamps, and personal projects."
        options={codingExperienceOptions}
        value={profile.codingExperience}
        onChange={(value) =>
          setProfile((prev) => ({ ...prev, codingExperience: value }))
        }
        invalid={showValidationError}
        errorMessage="Pick your coding experience."
      />

      <p className="flex items-start gap-2 rounded-[8px] bg-muted/40 px-3.5 py-3 text-xs leading-5 text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden="true" />
        We use this only to set the difficulty and focus of your practice.
      </p>
    </div>
  );
}

export default OnboardingProfile;
