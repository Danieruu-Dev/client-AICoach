import api from "@/api/axios";
import readyIllustration from "@/assets/preparo_sprites/check-preparo.png";
import { useMutation } from "@tanstack/react-query";
import { Keyboard, Mic, ShieldCheck, Timer } from "lucide-react";
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
    icon: Keyboard,
    title: "Type your answers",
    description: "Written responses are currently the available answer method",
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
    <section className="flex flex-col overflow-hidden rounded-md border bg-card shadow-sm lg:min-h-0 lg:flex-1">
      <div className="order-last flex shrink-0 flex-col gap-3 border-t bg-muted/10 px-5 py-3 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-primary/10 text-primary">
            <Keyboard className="size-3.5" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold">Written interview</p>
            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
              Type your response to each question
            </p>
          </div>
        </div>
        <div className="shrink-0 sm:w-44">
          <button
            type="button"
            onClick={() => interviewSessionMutation.mutate()}
            disabled={interviewSessionMutation.isPending}
          >
            {interviewSessionMutation.isPending
              ? "Starting..."
              : "Start interview"}
          </button>
        </div>
      </div>
      <div className="grid min-h-0 flex-1 lg:grid-cols-2">
        <div className="flex flex-col items-center border-b p-5 text-center lg:border-b-0 lg:border-r lg:p-6">
          <div className="flex size-35 items-center justify-center rounded-md bg-primary/[0.04] xl:size-40">
            <img
              src={readyIllustration}
              alt="Preparo character ready for an interview"
              className="h-35 w-auto object-contain xl:h-34"
            />
          </div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            Interview preflight
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            Ready to start?
          </h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
            Find a focused environment and take a moment to organize each
            written response before submitting it.
          </p>
        </div>

        <div className="overflow-y-auto p-5 lg:p-6">
          <h2 className="text-sm font-semibold">Before you begin</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            A few things to know for the best interview experience.
          </p>
          <div className="mt-4 divide-y">
            {requirements.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex gap-4 py-3 first:pt-0 last:pb-0">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-sm border bg-background text-primary">
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold">{title}</h3>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default InterviewPreflight;
