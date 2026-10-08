import feedbackIllustration from "@/assets/preparo_sprites/thumbs-up-preparo.png";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
  Map as MapIcon,
  RefreshCw,
  Sparkles,
} from "lucide-react";  
import { Link, Navigate, useParams } from "react-router-dom";
import { getInterviewEvaluation } from "./evaluationApi";
import { isFeedbackGenerating, type Feedback } from "./interviewTypes";

const buttonClass =
  "inline-flex items-center justify-center gap-2 rounded-sm border bg-background px-4 py-2 text-xs font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50";

const scores = [
  ["overallScore", "Overall"],
  ["technicalScore", "Technical"],
  ["conceptualUnderstandingScore", "Conceptual understanding"],
  ["communicationScore", "Communication"],
  ["structureScore", "Structure"],
  ["confidenceScore", "Confidence"],
] as const;

function FeedbackDetails({ feedback }: { feedback: Feedback }) {
  return (
    <>
      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {scores.map(([key, label]) => (
          <div key={key} className="rounded-sm border bg-card p-3">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="mt-1 text-lg font-semibold">
              {feedback[key] ?? "Unavailable"}
            </dd>
          </div>
        ))}
      </dl>

      {(
        [
          ["summary", "Summary"],
          ["strengths", "Strengths"],
          ["improvements", "Areas to improve"],
          ["suggestedAnswer", "Suggested answer"],
        ] as const
      ).map(([key, label]) => (
        <div key={key}>
          <h3 className="text-sm font-semibold">{label}</h3>
          <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">
            {feedback[key] || "No feedback provided."}
          </p>
        </div>
      ))}
    </>
  );
}

function InterviewEvaluation() {
  const { interviewSessionPublicId = "" } = useParams();
  const queryClient = useQueryClient();

  const evaluation = useQuery({
    queryKey: ["interview-evaluation", interviewSessionPublicId],
    enabled: Boolean(interviewSessionPublicId),
    queryFn: ({ signal }) =>
      getInterviewEvaluation(interviewSessionPublicId, signal),
    refetchInterval: (query) =>
      isFeedbackGenerating(query.state.data?.status) ? 3000 : false,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (evaluation.data?.status !== "COMPLETED" && evaluation.data?.status !== "FAILED") return;
    for (const key of ["roadmap-stages", "roadmap-summary", "roadmap-profile", "completed-attempts"]) {
      void queryClient.invalidateQueries({ queryKey: [key] });
    }
  }, [evaluation.data?.status, interviewSessionPublicId, queryClient]);

  if (!interviewSessionPublicId) return <Navigate to="/roadmap" replace />;

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border bg-card shadow-sm">
      <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <img
            src={feedbackIllustration}
            alt="Preparo feedback character"
            className="size-16"
          />
          <div>
            <p className="text-sm font-semibold">Interview evaluation</p>
            <p className="text-xs text-muted-foreground">
              Your complete session feedback
            </p>
          </div>
        </div>

        {evaluation.isPending && (
          <div role="status" className="mt-6 rounded-md border p-6">
            <p className="flex items-center gap-2 text-sm">
              <LoaderCircle className="size-4 animate-spin" />
              Loading your evaluation...
            </p>
          </div>
        )}

        {evaluation.isError && (
          <div role="alert" className="mt-6 rounded-md border p-6">
            <p className="flex items-center gap-2 text-sm font-medium">
              <AlertCircle className="size-4 text-destructive" />
              We could not load your evaluation.
            </p>
            <button
              type="button"
              className={`${buttonClass} mt-4`}
              onClick={() => void evaluation.refetch()}
              disabled={evaluation.isFetching}
            >
              <RefreshCw className="size-4" />
              Try again
            </button>
          </div>
        )}

        {!evaluation.isError && isFeedbackGenerating(evaluation.data?.status) && (
          <div
            role="status"
            className="mt-6 rounded-md border border-primary/20 bg-primary/5 p-6"
          >
            <p className="flex items-center gap-2 text-sm font-semibold text-primary">
              <Sparkles className="size-4" />
              Your evaluation is being generated
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              You can wait here or return to the roadmap. Your evaluation will
              continue in the background.
            </p>
          </div>
        )}

        {evaluation.data?.status === "FAILED" && (
          <div role="alert" className="mt-6 rounded-md border p-6">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <AlertCircle className="size-4 text-destructive" />
              We could not generate your evaluation.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Please return to the roadmap and try again later.
            </p>
          </div>
        )}

        {evaluation.data?.status === "COMPLETED" && (
          <div role="status" className="mt-6 space-y-4">
            <div className="flex items-center gap-3 rounded-md border bg-emerald-500/5 p-4">
              <CheckCircle2 className="size-5 text-emerald-600" />
              <div>
                <p className="text-sm font-semibold">Your evaluation is ready</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Review your answers and personalized feedback below.
                </p>
              </div>
            </div>

            {evaluation.data.feedback.map((feedback) => (
              <article
                key={feedback.feedbackId}
                className="rounded-md border p-4 sm:p-5"
              >
                <h2 className="break-words text-base font-semibold">
                  {feedback.questionText}
                </h2>
                <div className="my-4 rounded-sm bg-muted/30 p-4">
                  <h3 className="text-sm font-semibold">Your answer</h3>
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6">
                    {feedback.answerText || "Answer text unavailable."}
                  </p>
                </div>
                <div className="space-y-4">
                  <FeedbackDetails feedback={feedback} />
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <footer className="flex shrink-0 justify-center border-t bg-muted/10 px-5 py-3">
        <Link to="/roadmap" className={buttonClass}>
          <MapIcon className="size-4" />
          Back to roadmap
        </Link>
      </footer>
    </section>
  );
}

export default InterviewEvaluation;
