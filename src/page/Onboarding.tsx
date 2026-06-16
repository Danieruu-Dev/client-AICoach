import ProgressStepper from "@/components/onboarding/ProgressStepper";
import SideBar from "@/components/shared/SideBar";

import { Button } from "@/components/ui/button";
import OnboardingProfile from "@/features/onboarding/OnboardingProfile";
import OnboardingReview from "@/features/onboarding/OnboardingReview";
import OnboardingSkills from "@/features/onboarding/OnboardingSkills";
import { ChevronLeft, ChevronRight, Send } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import api from "@/api/axios";
import { useAuth } from "@/context/AuthProviderContext";
import axios from "axios";
import OnboardingSuccess from "@/features/onboarding/OnboardingSuccess";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";

type Options = {
  id: number | string;
  name: string;
};

export interface ProfileState {
  currentRole: Options | null;
  currentStatus: Options | null;
  experience: Options | null;
  targetIndustry: Options | null;
  preferredInterview: Options | null;
}
export type Skills = {
  id: number;
  name: string;
};

//data structure for submission
interface OnboardingData {
  profile: {
    experienceLevel: string;
    careerRoleId: number;
    targetIndustryId: number;
    careerGoal: string;
    currentStatus: string;
    preferredInterview: string;
  };
  preferredTechnology: {
    technologyId: number;
  }[];
}

export default function Onboarding() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const steps = ["Profile", "Skills", "Review"];
  const [showValidationError, setShowValidationError] = useState(false);
  const [pendingNavigationPath, setPendingNavigationPath] = useState<
    string | null
  >(null);

  const [profile, setProfile] = useState<ProfileState>({
    currentRole: null,
    currentStatus: null,
    experience: null,
    targetIndustry: null,
    preferredInterview: null,
  });
  const isProfileValid = () => {
    return (
      profile.currentRole &&
      profile.currentStatus &&
      profile.experience &&
      profile.targetIndustry &&
      profile.preferredInterview
    );
  };

  const [skills, setSkills] = useState<Skills[]>([]);
  const [showSkillsValidationError, setShowSkillsValidationError] =
    useState(false);

  const isSkillsValid = () => {
    return skills.length > 0;
  };

  const handleProgressButton = (action: string) => {
    if (action === "next") {
      if (currentStep === 1 && !isProfileValid()) {
        setShowValidationError(true);
        return;
      }

      if (currentStep === 2 && !isSkillsValid()) {
        setShowSkillsValidationError(true);
        return;
      }

      setShowValidationError(false);
      setShowSkillsValidationError(false);

      if (currentStep < steps.length) {
        setCurrentStep((prev) => prev + 1);
      }
    }

    if (action === "prev" && currentStep > 1) {
      setShowValidationError(false);
      setShowSkillsValidationError(false);
      setCurrentStep((prev) => prev - 1);
    }
  };

  const hasUnsavedOnboardingData =
    currentStep < 4 &&
    (profile.currentRole ||
      profile.currentStatus ||
      profile.experience ||
      profile.targetIndustry ||
      profile.preferredInterview ||
      skills.length > 0);
  const shouldWarnBeforeLeaving = Boolean(hasUnsavedOnboardingData);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!shouldWarnBeforeLeaving) return;

      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [shouldWarnBeforeLeaving]);

  const handleNavigateAway = (path: string) => {
    if (shouldWarnBeforeLeaving) {
      setPendingNavigationPath(path);
      return;
    }

    navigate(path);
  };

  const handleCancelNavigation = () => {
    setPendingNavigationPath(null);
  };

  const handleConfirmNavigation = () => {
    if (!pendingNavigationPath) return;

    navigate(pendingNavigationPath);
    setPendingNavigationPath(null);
  };

  const handleSkip = () => {
    handleNavigateAway("/dashboard");
  };

  const handleSubmit = async () => {
    if (showSkillsValidationError && showValidationError) {
      toast.error(
        "Please fill in all required fields and select at least one skill.",
      );
      return;
    }
    const data: OnboardingData = {
      profile: {
        experienceLevel: profile.experience?.id.toString() || "",
        careerRoleId: Number(profile.currentRole?.id) || 0,
        targetIndustryId: Number(profile.targetIndustry?.id) || 0,
        careerGoal: profile.currentStatus?.id.toString() || "",
        currentStatus: profile.currentStatus?.id.toString() || "",
        preferredInterview: profile.preferredInterview?.id.toString() || "",
      },
      preferredTechnology: skills.map((skill) => ({
        technologyId: Number(skill.id) || 0,
      })),
    };
    console.log("Submitting onboarding data:", data);
    const response = await api.post(`/api/profile/${auth?.user?.id}`, data);

    return response.data;
  };
  const {
    mutate,
    data: submissionData,
    isPending,
  } = useMutation({
    mutationFn: handleSubmit,
    onSuccess: (data) => {
      toast.success(data || "Onboarding completed successfully!");
      setCurrentStep(4);
      auth?.setUser((prev) =>
        prev ? { ...prev, onboardingCompleted: true } : prev,
      );
    },
    onError: (error) => {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || error.response?.data || error.message
        : "Something went wrong";
      toast.error(errorMessage);
    },
  });
  console.log(submissionData);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex flex-col lg:flex-row">
        <SideBar pageName="Onboarding" onNavigateAttempt={handleNavigateAway} />

        <main className="flex min-w-0 flex-1 flex-col bg-background px-4 py-4 text-foreground md:px-6 md:py-5 lg:px-8 lg:py-6">
          <section className="flex items-center justify-between gap-4">
            <div className="text-2xl font-semibold text-primary">
              Onboarding
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-sidebar-border bg-transparent text-primary hover:bg-primary/5"
              onClick={handleSkip}
            >
              Skip for now
            </Button>
          </section>

          <section className="mx-auto mt-5 flex w-full max-w-4xl flex-col gap-5">
            {currentStep < 4 && (
              <div className="mx-auto w-full max-w-2xl">
                <ProgressStepper currentStep={currentStep} steps={steps} />
              </div>
            )}
            {currentStep === 1 && (
              <OnboardingProfile
                profile={profile}
                setProfile={setProfile}
                showValidationError={showValidationError}
              />
            )}

            {currentStep === 2 && (
              <OnboardingSkills
                skills={skills}
                setSkills={setSkills}
                showValidationError={showSkillsValidationError}
              />
            )}

            {currentStep === 3 && (
              <OnboardingReview profile={profile} skills={skills} />
            )}

            {currentStep === 4 && <OnboardingSuccess />}

            <div className="flex justify-end  max-w-3xl mx-auto w-full">
              {currentStep > 1 && currentStep < 4 && (
                <button
                  className="flex items-center gap-1 rounded-sm border px-4 py-2 text-[13px] bg-primary text-white cursor-pointer transition-colors hover:bg-primary/90"
                  onClick={() => handleProgressButton("prev")}
                >
                  <ChevronLeft className="size-4" /> Back
                </button>
              )}

              {currentStep < 3 && (
                <button
                  className="flex items-center gap-1 rounded-sm border px-4 py-2 text-[13px] bg-primary text-white cursor-pointer transition-colors hover:bg-primary/90"
                  onClick={() => handleProgressButton("next")}
                >
                  Continue <ChevronRight className="size-4" />
                </button>
              )}

              {currentStep === 3 && (
                <button
                  className="flex items-center gap-2 rounded-sm border px-6 py-2 text-[13px] bg-primary text-white cursor-pointer transition-colors hover:bg-primary/90"
                  onClick={() => mutate()}
                  disabled={isPending}
                >
                  {isPending ? "Submitting..." : "Submit"}
                  <Send className="size-4" />
                </button>
              )}
            </div>
          </section>
        </main>
      </div>

      <AlertDialog open={Boolean(pendingNavigationPath)}>
        <AlertDialogContent className="max-w-[92vw] gap-5 rounded-2xl p-6 sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogMedia className="size-11 bg-destructive/10 text-destructive">
              <AlertTriangle className="size-5" />
            </AlertDialogMedia>
            <AlertDialogTitle className="text-base">
              Leave onboarding?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              Your onboarding answers are not saved yet. If you leave or reload
              this page, you will need to redo the information you entered.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelNavigation}>
              Stay here
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleConfirmNavigation}
            >
              Leave page
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
