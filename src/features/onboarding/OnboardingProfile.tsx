import { SelectField } from "@/components/shared/SelectFields";
import { Gauge, Info } from "lucide-react";
import type { ProfileState } from "@/page/Onboarding";
import { cn } from "@/lib/utils";

const currentStatusOptions = [
  { id: "STUDENT", name: "Student" },
  { id: "FRESH_GRADUATE", name: "Fresh Graduate" },
  { id: "CAREER_SHIFTER", name: "Career Shifter" },
  { id: "JUNIOR_DEVELOPER", name: "Junior Developer" },
  { id: "UNEMPLOYED", name: "Unemployed" },
  { id: "EMPLOYED_LOOKING", name: "Employed but Looking" },
];

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
  const profileErrors = {
    currentStatus: showValidationError && !profile.currentStatus,
    codingExperience: showValidationError && !profile.codingExperience,
  };

  return (
    <div className="mx-auto w-full max-w-3xl rounded-2xl border border-border/70 bg-card/90 p-4 shadow-sm backdrop-blur-sm md:p-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-xl font-semibold tracking-tight text-primary md:text-2xl">
          👋 Let&apos;s get to know you!
        </h1>
        <p className="text-sm text-muted-foreground md:text-[15px]">
          This helps us personalize your practice experience.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {showValidationError && (
          <p className="text-sm text-destructive">
            Complete all required fields to proceed to the next step.
          </p>
        )}
        <div className="grid gap-4 md:grid-cols-2">
          <SelectField
            label="Current status"
            placeholder="Select Status"
            icon={<Info className="size-4" />}
            value={profile.currentStatus}
            onChange={(value) =>
              setProfile({ ...profile, currentStatus: value })
            }
            options={Object.values(currentStatusOptions)}
            className={cn(
              profileErrors.currentStatus &&
                "border-destructive focus-visible:ring-destructive",
            )}
          />
          <SelectField
            label="Experience level"
            placeholder="Select Experience"
            icon={<Gauge className="size-4" />}
            value={profile.codingExperience}
            onChange={(value) =>
              setProfile({ ...profile, codingExperience: value })
            }
            options={Object.values(codingExperienceOptions)}
            className={cn(
              profileErrors.codingExperience &&
                "border-destructive focus-visible:ring-destructive",
            )}
          />
        </div>

        <p className="text-xs text-muted-foreground">
          We&apos;ll use this to show relevant opportunities and insights.
        </p>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-3.5 text-emerald-950">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-full bg-emerald-500/15 p-2 text-emerald-600">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                className="size-4"
              >
                <path
                  d="M12 2 4 5.5v6.2c0 4.8 3.2 9.2 8 10.3 4.8-1.1 8-5.5 8-10.3V5.5L12 2Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <path
                  d="m9.5 12 1.9 1.9 3.6-4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <div className="text-sm font-semibold text-emerald-700">
                Your privacy matters
              </div>
              <p className="mt-1 text-sm text-emerald-700/90">
                Your information is secure and will only be used to personalize
                your experience.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OnboardingProfile;
