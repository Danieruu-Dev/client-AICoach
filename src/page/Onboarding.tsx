import ProgressStepper from "@/components/onboarding/ProgressStepper";
import SideBar from "@/components/shared/SideBar";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import OnboardingProfile from "@/features/onboarding/OnboardingProfile";
import OnboardingReview from "@/features/onboarding/OnboardingReview";
import OnboardingSkills from "@/features/onboarding/OnboardingSkills";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Send,
  ShieldCheck,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import api from "@/api/axios";
import { useAuth } from "@/context/AuthProviderContext";
import axios from "axios";
import { toast } from "sonner";
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
import OnboardingPreparation from "@/features/onboarding/OnboardingPreparation";

const LEGAL_VERSION = "1.0";

type Options = {
  id: number | string;
  name: string;
};

export interface PreparationState {
  targetRole: Options | null;
  targetIndustry: Options | null;
  hasUpcomingInterview: boolean;
  interviewDate?: Date;
  careerGoal: string;
}

export interface ProfileState {
  currentStatus: Options | null;
  codingExperience: Options | null;
}
export type Skills = {
  id: number;
  name: string;
};

//data structure for submission
interface OnboardingData {
  profile: {
    codingExperience: string;
    currentStatus: string;
  };
  preparationGoal: {
    targetRoleId: number;
    targetIndustryId: number;
    hasUpcomingInterview: boolean;
    interviewDate?: Date;
    careerGoal: string;
  };
  preparationGoalTechnology: {
    technologyId: number;
  }[];
  acceptedTermsVersion: string;
  acceptedPrivacyVersion: string;
  legalAcceptedAt: string;
}

export default function Onboarding() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const steps = ["Profile", "Preparation", "Skills", "Review"];
  const [showValidationError, setShowValidationError] = useState(false);
  const [pendingNavigationPath, setPendingNavigationPath] = useState<
    string | null
  >(null);
  const [showConsentDialog, setShowConsentDialog] = useState(false);
  const [hasAcceptedConsent, setHasAcceptedConsent] = useState(false);

  const [profile, setProfile] = useState<ProfileState>({
    currentStatus: null,
    codingExperience: null,
  });
  const [preparation, setPreparation] = useState<PreparationState>({
    targetRole: null,
    targetIndustry: null,
    hasUpcomingInterview: false,
    interviewDate: undefined,
    careerGoal: "",
  });
  const isProfileValid = () => {
    return profile.currentStatus && profile.codingExperience;
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

      if (currentStep === 3 && !isSkillsValid()) {
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
    (preparation.targetRole ||
      preparation.targetIndustry ||
      preparation.hasUpcomingInterview ||
      preparation.interviewDate ||
      preparation.careerGoal ||
      profile.currentStatus ||
      profile.codingExperience ||
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

  const handleOpenConsentDialog = () => {
    setHasAcceptedConsent(false);
    setShowConsentDialog(true);
  };

  const handleConfirmConsent = () => {
    if (!hasAcceptedConsent) return;

    setShowConsentDialog(false);
    mutate();
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
        codingExperience: profile.codingExperience?.id.toString() || "",
        currentStatus: profile.currentStatus?.id.toString() || "",
      },
      preparationGoal: {
        targetRoleId: Number(preparation.targetRole?.id) || 0,
        targetIndustryId: Number(preparation.targetIndustry?.id) || 0,
        hasUpcomingInterview: preparation.hasUpcomingInterview,
        interviewDate: preparation.interviewDate,
        careerGoal: preparation.careerGoal || "",
      },
      preparationGoalTechnology: skills.map((skill) => ({
        technologyId: Number(skill.id) || 0,
      })),
      acceptedTermsVersion: LEGAL_VERSION,
      acceptedPrivacyVersion: LEGAL_VERSION,
      legalAcceptedAt: new Date().toISOString(),
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
            {currentStep < 5 && (
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
              <OnboardingPreparation
                preparation={preparation}
                setPreparation={setPreparation}
                showValidationError={showValidationError}
              />
            )}
            {currentStep === 3 && (
              <OnboardingSkills
                skills={skills}
                setSkills={setSkills}
                showValidationError={showSkillsValidationError}
              />
            )}

            {currentStep === 4 && (
              <OnboardingReview
                profile={profile}
                skills={skills}
                preparation={preparation}
              />
            )}

            <div className="flex justify-end  max-w-3xl mx-auto w-full">
              {currentStep > 1 && currentStep < 5 && (
                <button
                  className="flex items-center gap-1 rounded-sm border px-4 py-2 text-[13px] bg-primary text-white cursor-pointer transition-colors hover:bg-primary/90"
                  onClick={() => handleProgressButton("prev")}
                >
                  <ChevronLeft className="size-4" /> Back
                </button>
              )}

              {currentStep < 4 && (
                <button
                  className="flex items-center gap-1 rounded-sm border px-4 py-2 text-[13px] bg-primary text-white cursor-pointer transition-colors hover:bg-primary/90"
                  onClick={() => handleProgressButton("next")}
                >
                  Continue <ChevronRight className="size-4" />
                </button>
              )}

              {currentStep === 4 && (
                <button
                  className="flex items-center gap-2 rounded-sm border px-6 py-2 text-[13px] bg-primary text-white cursor-pointer transition-colors hover:bg-primary/90"
                  onClick={handleOpenConsentDialog}
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
        <AlertDialogContent className="max-w-[92vw] gap-5 rounded-md p-6 sm:max-w-md">
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

      <AlertDialog open={showConsentDialog} onOpenChange={setShowConsentDialog}>
        <AlertDialogContent className="max-h-[90vh] max-w-[94vw] gap-5 overflow-y-auto rounded-sm p-6 sm:max-w-xl">
          <AlertDialogHeader>
            <AlertDialogMedia className="size-11 bg-primary/10 text-primary">
              <ShieldCheck className="size-5" />
            </AlertDialogMedia>
            <AlertDialogTitle className="text-base">
              Before you finish onboarding
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              Please review how Preparo uses your information to personalize
              interview preparation.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 text-sm text-foreground">
            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-primary">
                Privacy summary
              </h3>
              <p className="text-muted-foreground">
                Preparo collects account details, interview profile answers,
                career goals, technology preferences, progress data, and
                AI-generated interview feedback so we can provide personalized
                coaching and recommendations.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-primary">
                AI processing
              </h3>
              <p className="text-muted-foreground">
                Some content you provide may be processed by third-party AI
                providers to generate interview feedback, practice questions,
                and recommendations. These providers process data to deliver the
                requested service.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-primary">
                Terms summary
              </h3>
              <p className="text-muted-foreground">
                Preparo is for educational interview preparation. AI feedback
                may be imperfect and does not guarantee job offers, interview
                success, or career outcomes. Users are responsible for keeping
                account credentials secure and using the service lawfully.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-primary">
                Your rights
              </h3>
              <p className="text-muted-foreground">
                You may request deletion of your account and associated personal
                data by contacting support.
              </p>
            </section>

            <div className="flex items-start gap-3 rounded-lg bg-muted/35 p-3">
              <Checkbox
                id="onboarding-consent"
                checked={hasAcceptedConsent}
                onCheckedChange={(checked) =>
                  setHasAcceptedConsent(checked === true)
                }
                className="mt-1"
              />
              <Label
                htmlFor="onboarding-consent"
                className="cursor-pointer text-sm leading-6 text-foreground"
              >
                I have read and agree to Preparo&apos;s Terms of Service and
                Privacy Policy summary, including the use of AI processing for
                interview feedback and recommendations.
              </Label>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setHasAcceptedConsent(false)}>
              Cancel
            </AlertDialogCancel>
            <Button
              type="button"
              onClick={handleConfirmConsent}
              disabled={!hasAcceptedConsent || isPending}
            >
              {isPending ? "Submitting..." : "Agree and submit"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
