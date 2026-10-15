import api from "@/api/axios";
import readyIllustration from "@/assets/preparo_sprites/check-preparo.png";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ArrowRight,
  LoaderCircle,
  Mic,
  ShieldCheck,
  Timer,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

const requirements = [
  // {
  //   icon: Clock3,
  //   title: "Estimated time",
  //   description: "5 questions · approximately 15 minutes",
  // },
  {
    icon: Timer,
    title: "Timed session",
    description: "The timer begins when you start the interview",
  },
  {
    icon: Mic,
    title: "Voice answers coming soon",
    description:
      "Voice recording will be available as an optional answer method",
  },
  {
    icon: ShieldCheck,
    title: "Stay focused",
    description: "Use a quiet space and avoid switching tabs",
  },
];
const ENUM_SESSION_TYPE = {
  ROADMAP_STAGE: "ROADMAP_STAGE",
};

function InterviewPreflight() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const stageId = searchParams.get("stageId");
  const roadmapPublicId = searchParams.get("userRoadmapPublicId");

  const interviewSessionMutation = useMutation({
    mutationFn: async () => {
      if (!stageId || !roadmapPublicId) {
        throw new Error("Missing interview details");
      }

      const response = await api.post("/api/interview-session", {
        stageId,
        roadmapPublicId,
        sessionType: ENUM_SESSION_TYPE.ROADMAP_STAGE,
      });

      return response.data as {
        publicId: string;
        status: string;
      };
    },
    onSuccess: (session) => {
      navigate(`/interview/question/${session.publicId}`);
    },
  });

  return (
    <section className="grid overflow-hidden rounded-[8px] border bg-card shadow-sm lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,1fr)_24rem] lg:grid-rows-[minmax(0,1fr)]">
      <div className="flex flex-col items-center justify-center overflow-y-auto px-5 py-10 text-center sm:px-8">
        <img
          src={readyIllustration}
          alt="Preparo character ready for an interview"
          className="h-36 w-auto object-contain"
        />
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
          Interview preflight
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">
          Ready to start?
        </h2>
        <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
          Find a focused environment and take a moment to organize each response
          before submitting it.
        </p>
        <Button
          className="mt-7 h-11 rounded-[6px] px-8 text-sm"
          onClick={() => interviewSessionMutation.mutate()}
          disabled={interviewSessionMutation.isPending}
        >
          {interviewSessionMutation.isPending
            ? "Starting..."
            : "Start interview"}
          {interviewSessionMutation.isPending ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <ArrowRight />
          )}
        </Button>
        {interviewSessionMutation.isError && (
          <p role="alert" className="mt-3 text-xs text-destructive">
            Couldn’t start the interview. Please try again.
          </p>
        )}
      </div>

      <aside className="overflow-y-auto border-t bg-muted/25 p-5 sm:p-7 lg:border-l lg:border-t-0">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Before you begin
        </p>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          A few things to know for the best interview experience.
        </p>
        <Separator className="my-5" />
        <ul className="space-y-5">
          {requirements.map(({ icon: Icon, title, description }) => (
            <li key={title} className="flex gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-card text-primary">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h3 className="text-sm font-medium">{title}</h3>
                <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                  {description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </aside>
    </section>
  );
}

export default InterviewPreflight;
