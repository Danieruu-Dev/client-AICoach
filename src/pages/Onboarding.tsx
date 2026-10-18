import SetupRail from "@/features/onboarding/components/SetupRail";
import ModeToggle from "@/components/mode-toggle";
import OnboardingWelcome from "@/features/onboarding/OnboardingWelcome";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import OnboardingProfile from "@/features/onboarding/OnboardingProfile";
import OnboardingReview from "@/features/onboarding/OnboardingReview";
import OnboardingSkills from "@/features/onboarding/OnboardingSkills";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  LogOut,
  Send,
  ShieldCheck,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
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
import OnboardingPreparation from "@/features/onboarding/OnboardingPreparation";
import { useNavigate } from "react-router-dom";

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
  category?: string;
};

// Header copy for steps 1-4
const stepContent = [
  {
    title: "Profile",
    heading: "Tell us where you are",
    description: "Your situation and experience set the difficulty of your practice.",
  },
  {
    title: "Preparation goal",
    heading: "What are you preparing for?",
    description: "Your target role and industry shape your questions and roadmap.",
  },
  {
    title: "Skills",
    heading: "Pick the skills to practice",
    description: "Choose the technologies you want interview questions on.",
  },
  {
    title: "Review",
    heading: "Review and submit",
    description: "Check your answers. You'll confirm our terms before we build your roadmap.",
  },
];

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
  // Step 0 is the welcome screen; steps 1-4 are the stepper
  const [currentStep, setCurrentStep] = useState(0);
  // Furthest step the user has opened; stays "in progress" in the rail while they look back
  const [furthestStep, setFurthestStep] = useState(1);
  // Errors only show after the user tries to continue from an incomplete step
  const [showValidationError, setShowValidationError] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  // Set once the user confirmed logging out, so the browser's "leave site?" prompt doesn't ask again
  const isLoggingOut = useRef(false);
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
  const [skills, setSkills] = useState<Skills[]>([]);

  const isStepValid = (step: number) => {
    if (step === 1) return Boolean(profile.currentStatus && profile.codingExperience);
    if (step === 2) return Boolean(preparation.targetRole && preparation.targetIndustry);
    if (step === 3) return skills.length > 0;
    return true;
  };

  // A step can be opened if every step before it is filled in, so users can always go back
  // but can't jump past an unfinished step
  const canGoToStep = (step: number) =>
    Array.from({ length: step - 1 }, (_, i) => i + 1).every(isStepValid);

  const stepBodyRef = useRef<HTMLDivElement>(null);

  const goToStep = (step: number) => {
    if (step > currentStep && !canGoToStep(step)) return;
    setShowValidationError(false);
    setCurrentStep(step);
    setFurthestStep((prev) => Math.max(prev, step));
  };

  // The step content scrolls inside the card, so start each step at its top
  useEffect(() => {
    stepBodyRef.current?.scrollTo({ top: 0 });
  }, [currentStep]);

  // When Continue is blocked, bring the first error into view
  useEffect(() => {
    if (!showValidationError) return;
    stepBodyRef.current
      ?.querySelector('[role="alert"]')
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [showValidationError]);

  const handleContinue = () => {
    if (!isStepValid(currentStep)) {
      setShowValidationError(true);
      return;
    }
    goToStep(currentStep + 1);
  };

  // Recap shown under finished steps in the setup rail
  const railSteps = stepContent.map((step, index) => ({
    title: step.title,
    summary: [
      [profile.currentStatus?.name, profile.codingExperience?.name],
      [preparation.targetRole?.name, preparation.targetIndustry?.name],
      [skills.length ? `${skills.length} selected` : undefined],
      [],
    ][index]
      .filter(Boolean)
      .join(" · "),
  }));

  const hasUnsavedOnboardingData =
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
      if (!shouldWarnBeforeLeaving || isLoggingOut.current) return;

      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [shouldWarnBeforeLeaving]);

  // Onboarding can't be skipped, so logging out is the only way off this page
  const handleLogout = () => {
    if (shouldWarnBeforeLeaving && !showLogoutDialog) {
      setShowLogoutDialog(true);
      return;
    }

    isLoggingOut.current = true;
    auth?.logout();
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
    const response = await api.post(`/api/profile/${auth?.user?.id}`, data);

    return response.data;
  };
  const { mutate, isPending } = useMutation({
    mutationFn: handleSubmit,
    onSuccess: () => {
      // The response is an object ({ message, roadmapId, ... }); toasts can only render text
      toast.success("You're all set! Your roadmap is ready.");
      auth?.setUser((prev) =>
        prev ? { ...prev, onboardingCompleted: true } : prev,
      );
      navigate("/dashboard", { replace: true });
    },
    onError: (error) => {
      // Error bodies can be plain text or JSON; only ever pass a string to the toast
      const data = axios.isAxiosError(error) ? error.response?.data : undefined;
      const errorMessage =
        (typeof data === "string" && data) ||
        (typeof data?.message === "string" && data.message) ||
        "We couldn't save your answers. Please try again.";
      toast.error(errorMessage);
    },
  });

  const step = stepContent[currentStep - 1];

  return (
    // Fixed to the viewport: only the step content scrolls, so Back/Continue stay in view
    <div className="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
      <header className="flex h-16 items-center justify-between border-b border-border px-4 md:px-6">
        <div className="flex items-center gap-2">
          <img src="/icon-preparo.png" alt="" className="h-8 w-11" />
          <img src="/preparo_typo_dark.png" alt="Preparo" className="h-9 dark:hidden" />
          <img src="/preparo_typo_light.png" alt="Preparo" className="hidden h-9 dark:block" />
        </div>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={handleLogout}
          >
            <LogOut className="size-4" />
            Log out
          </Button>
        </div>
      </header>

      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto bg-muted/20 px-4 py-4 text-foreground md:px-6 md:py-6 lg:px-8">
        {currentStep === 0 || !step ? (
          <OnboardingWelcome
            firstName={auth?.user?.firstName}
            onStart={() => goToStep(1)}
          />
        ) : (
          <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col gap-4 lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
            <SetupRail
              steps={railSteps}
              currentStep={currentStep}
              canGoTo={canGoToStep}
              // Review only counts as done once onboarding is submitted
              isComplete={(step) => step < stepContent.length && isStepValid(step)}
              // The step being worked on: the furthest one reached, or an earlier one
              // that was emptied again (its later steps lock until it's filled back in)
              inProgressStep={Math.min(
                furthestStep,
                stepContent.findIndex((_, i) => !isStepValid(i + 1)) + 1 || stepContent.length,
              )}
              onSelect={goToStep}
            />

            <article className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-[8px] border bg-card shadow-sm">
              <header className="border-b px-5 py-3 sm:px-6 sm:py-3.5">
                <div className="flex items-center justify-between gap-4">
                  <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
                    {step.heading}
                  </h1>
                  <span className="shrink-0 rounded-full bg-primary/8 px-2.5 py-1 text-xs font-semibold text-primary">
                    Step {currentStep} of {stepContent.length}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                  {step.description}
                </p>
              </header>

              <div
                ref={stepBodyRef}
                className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6"
              >
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
                    showValidationError={showValidationError}
                    targetRoleName={preparation.targetRole?.name}
                  />
                )}
                {currentStep === 4 && (
                  <OnboardingReview
                    profile={profile}
                    skills={skills}
                    preparation={preparation}
                    onEdit={goToStep}
                  />
                )}
              </div>

              <footer className="flex items-center justify-between gap-3 border-t bg-muted/25 px-5 py-2.5 sm:px-6">
                <Button
                  type="button"
                  variant="outline"
                  className="h-8 rounded-[6px] px-3 text-sm"
                  onClick={() => goToStep(currentStep - 1)}
                >
                  <ArrowLeft className="size-4" />
                  Back
                </Button>

                {currentStep < stepContent.length ? (
                  <Button
                    type="button"
                    className="h-8 rounded-[6px] px-4 text-sm"
                    onClick={handleContinue}
                  >
                    Continue
                    <ArrowRight className="size-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    className="h-8 rounded-[6px] px-4 text-sm"
                    onClick={handleOpenConsentDialog}
                    disabled={isPending}
                  >
                    {isPending ? "Submitting..." : "Submit and build roadmap"}
                    <Send className="size-4" />
                  </Button>
                )}
              </footer>
            </article>
          </div>
        )}
      </main>

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent className="max-w-[92vw] gap-5 rounded-md p-6 sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogMedia className="size-11 bg-destructive/10 text-destructive">
              <AlertTriangle className="size-5" />
            </AlertDialogMedia>
            <AlertDialogTitle className="text-base">
              Log out before finishing?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              Your onboarding answers are not saved yet. You&apos;ll need to
              fill them in again the next time you sign in.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay here</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleLogout}>
              Log out
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
