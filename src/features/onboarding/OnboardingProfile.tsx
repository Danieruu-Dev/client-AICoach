import { SelectField } from "@/components/shared/SelectFields";
import {
  Briefcase,
  Globe2,
  Activity,
  Gauge,
  MessagesSquare,
} from "lucide-react";
import type { ProfileState } from "@/page/Onboarding";
import { cn } from "@/lib/utils";
import api from "@/api/axios";
import { useQuery } from "@tanstack/react-query";

const currentStatusOptions = [
  { id: "ACTIVELY_LOOKING", name: "Actively looking" },
  { id: "OPEN_TO_OPPORTUNITIES", name: "Open to opportunities" },
  { id: "NOT_LOOKING", name: "Not looking" },
  { id: "HIRED", name: "Hired" },
];

const experienceOptions = [
  { id: "ENTRY_LEVEL", name: "Entry Level" },
  { id: "JUNIOR", name: "Junior" },
  { id: "MID_LEVEL", name: "Mid Level" },
  { id: "SENIOR", name: "Senior" },
];
const interviewTypeOptions = [
  { id: "TECHNICAL", name: "Technical" },
  { id: "SYSTEM_DESIGN", name: "System Design" },
  { id: "BEHAVIORAL", name: "Behavioral" },
  { id: "HR", name: "HR" },
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
    currentRole: showValidationError && !profile.currentRole,
    currentStatus: showValidationError && !profile.currentStatus,
    experience: showValidationError && !profile.experience,
    targetIndustry: showValidationError && !profile.targetIndustry,
    preferredInterview: showValidationError && !profile.preferredInterview,
  };

  const fetchTargetIndustries = async () => {
    const response = await api.get("/api/profile/target-industry");

    return response.data.map(({ id, name }: { id: number; name: string }) => ({
      id,
      name,
    }));
  };

  const fetchCareerRoles = async () => {
    const response = await api.get("/api/profile/career-role");

    console.log("response:", response.data);
    return response.data.map(({ id, name }: { id: number; name: string }) => ({
      id,
      name,
    }));
  };

  const { data: targetIndustry } = useQuery({
    queryKey: ["target-industry"],
    queryFn: fetchTargetIndustries,
  });

  const { data: careerRole } = useQuery({
    queryKey: ["career-role"],
    queryFn: fetchCareerRoles,
  });

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
            label="Current role (or most recent)"
            placeholder="Select Role"
            icon={<Briefcase className="size-4" />}
            value={profile.currentRole}
            onChange={(value) => setProfile({ ...profile, currentRole: value })}
            options={careerRole || []}
            className={cn(
              profileErrors.currentRole &&
                "border-destructive focus-visible:ring-destructive",
            )}
          />
          <SelectField
            label="Current status"
            placeholder="Select Status"
            icon={<Activity className="size-4" />}
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
            value={profile.experience}
            onChange={(value) => setProfile({ ...profile, experience: value })}
            options={Object.values(experienceOptions)}
            className={cn(
              profileErrors.experience &&
                "border-destructive focus-visible:ring-destructive",
            )}
          />
          <SelectField
            label="Target industry"
            placeholder="Select Industry"
            icon={<Globe2 className="size-4" />}
            value={profile.targetIndustry}
            onChange={(value) =>
              setProfile({ ...profile, targetIndustry: value })
            }
            options={targetIndustry || []}
            className={cn(
              profileErrors.targetIndustry &&
                "border-destructive focus-visible:ring-destructive",
            )}
          />
        </div>
        <SelectField
          label="Preferred interview type"
          placeholder="Select Interview Type"
          icon={<MessagesSquare className="size-4" />}
          value={profile.preferredInterview}
          onChange={(value) =>
            setProfile({ ...profile, preferredInterview: value })
          }
          options={interviewTypeOptions}
          className={cn(
            profileErrors.preferredInterview &&
              "border-destructive focus-visible:ring-destructive",
          )}
        />

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
