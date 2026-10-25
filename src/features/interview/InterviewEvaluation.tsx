import feedbackIllustration from "@/assets/preparo_sprites/thumbs-up-preparo.png";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { invalidateProgress } from "@/lib/queryCache";
import { type ReactNode, useEffect } from "react";
import {
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
  Map as MapIcon,
  RefreshCw,
} from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import { getInterviewEvaluation } from "./api/evaluationApi";
import { isFeedbackGenerating, type Feedback } from "./types/interviewTypes";

const dimensions = [
  ["technicalScore", "Technical"],
  ["conceptualUnderstandingScore", "Conceptual understanding"],
  ["communicationScore", "Communication"],
  ["structureScore", "Structure"],
  ["confidenceScore", "Confidence"],
] as const;

type ScoreKey = "overallScore" | (typeof dimensions)[number][0];

const sections = [
  ["summary", "Summary"],
  ["strengths", "Strengths"],
  ["improvements", "Areas to improve"],
] as const;

function averageScore(feedback: Feedback[], key: ScoreKey) {
  const values = feedback
    .map((item) => item[key])
    .filter((value): value is number => value != null);
  if (values.length === 0) return null;
  return Math.round(
    values.reduce((total, value) => total + Number(value), 0) / values.length,
  );
}

function ScoreBar({ label, value }: { label: string; value: number | null }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">
          {value != null ? Math.round(value) : "—"}
        </span>
      </div>
      <Progress
        className="mt-1.5 h-1.5 rounded-full"
        value={value ?? 0}
        aria-label={label}
      />
    </div>
  );
}

function BackToRoadmapButton({ className }: { className?: string }) {
  return (
    <Button
      asChild
      variant="outline"
      className={`h-10 rounded-[6px] px-5 text-sm ${className ?? ""}`}
    >
      <Link to="/roadmap">
        <MapIcon />
        Back to roadmap
      </Link>
    </Button>
  );
}

function StatusPanel({
  role,
  title,
  description,
  children,
}: {
  role: "status" | "alert";
  title: ReactNode;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div
      role={role}
      className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-5 py-10 text-center sm:px-8"
    >
      <img
        src={feedbackIllustration}
        alt="Preparo feedback character"
        className="h-32 w-auto object-contain"
      />
      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
        Interview evaluation
      </p>
      <h2 className="mt-2 flex items-center gap-2 text-2xl font-semibold tracking-tight">
        {title}
      </h2>
      {description && (
        <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      )}
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        {children}
      </div>
    </div>
  );
}

function FeedbackCard({
  feedback,
  index,
  total,
}: {
  feedback: Feedback;
  index: number;
  total: number;
}) {
  return (
    <AccordionItem
      value={String(feedback.feedbackId)}
      className="data-open:bg-transparent"
    >
      <AccordionTrigger className="cursor-pointer items-center gap-4 p-5 hover:bg-muted/40 hover:no-underline">
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            Question {index + 1} of {total}
          </span>
          <span className="mt-1.5 block wrap-break-word text-sm font-semibold leading-6">
            {feedback.questionText}
          </span>
        </span>
        <span className="shrink-0 text-right">
          <span className="block text-xl font-semibold tracking-tight">
            {feedback.overallScore != null
              ? Math.round(feedback.overallScore)
              : "—"}
          </span>
          <span className="block text-[11px] font-normal text-muted-foreground">
            Overall
          </span>
        </span>
      </AccordionTrigger>

      <AccordionContent className="space-y-5 px-3 pb-5 text-sm">
        <div className="rounded-md bg-muted/40 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Your answer
          </h3>
          <p className="mt-2 whitespace-pre-wrap wrap-break-word text-sm leading-6">
            {feedback.answerText || "Answer text unavailable."}
          </p>
        </div>

        <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2 xl:grid-cols-3">
          {dimensions.map(([key, label]) => (
            <ScoreBar key={key} label={label} value={feedback[key]} />
          ))}
        </div>

        {sections.map(([key, label]) => (
          <div key={key}>
            <h3 className="text-sm font-semibold">{label}</h3>
            <p className="mt-1 whitespace-pre-wrap wrap-break-word text-sm leading-6 text-muted-foreground">
              {feedback[key] || "No feedback provided."}
            </p>
          </div>
        ))}

        <div className="rounded-md bg-primary/5 p-4">
          <h3 className="text-sm font-semibold">Suggested answer</h3>
          <p className="mt-1 whitespace-pre-wrap wrap-break-word text-sm leading-6 text-muted-foreground">
            {feedback.suggestedAnswer || "No feedback provided."}
          </p>
        </div>
      </AccordionContent>
    </AccordionItem>
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
    if (
      evaluation.data?.status !== "COMPLETED" &&
      evaluation.data?.status !== "FAILED"
    )
      return;
    invalidateProgress(queryClient);
  }, [evaluation.data?.status, interviewSessionPublicId, queryClient]);

  if (!interviewSessionPublicId) return <Navigate to="/roadmap" replace />;

  const feedback = evaluation.data?.feedback ?? [];
  const overall = averageScore(feedback, "overallScore");

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[8px] border bg-card shadow-sm">
      {evaluation.isPending && (
        <StatusPanel
          role="status"
          title={
            <>
              <LoaderCircle className="size-5 animate-spin text-primary" />
              Loading your evaluation...
            </>
          }
        />
      )}

      {evaluation.isError && (
        <StatusPanel
          role="alert"
          title={
            <>
              <AlertCircle className="size-5 text-destructive" />
              We could not load your evaluation.
            </>
          }
          description="Check your connection and try again."
        >
          <Button
            className="h-10 rounded-[6px] px-5 text-sm"
            onClick={() => void evaluation.refetch()}
            disabled={evaluation.isFetching}
          >
            <RefreshCw
              className={evaluation.isFetching ? "animate-spin" : ""}
            />
            Try again
          </Button>
          <BackToRoadmapButton />
        </StatusPanel>
      )}

      {!evaluation.isError && isFeedbackGenerating(evaluation.data?.status) && (
        <StatusPanel role="status" title="Your evaluation is being generated">
          <div className="w-full">
            <div className="mx-auto w-full max-w-sm rounded-[8px] border bg-muted/25 p-4">
              <p className="flex items-center justify-center gap-2.5 text-sm font-medium">
                <LoaderCircle className="size-5 animate-spin text-primary" />
                Reviewing your answers…
              </p>
              <div
                className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted"
                aria-hidden="true"
              >
                <div className="h-full w-2/5 rounded-full bg-primary animate-indeterminate" />
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                This usually takes a moment. The page updates automatically.
              </p>
            </div>
          </div>
          <BackToRoadmapButton />
        </StatusPanel>
      )}

      {!evaluation.isError && evaluation.data?.status === "FAILED" && (
        <StatusPanel
          role="alert"
          title={
            <>
              <AlertCircle className="size-5 text-destructive" />
              We could not generate your evaluation.
            </>
          }
          description="Please return to the roadmap and try again later."
        >
          <BackToRoadmapButton />
        </StatusPanel>
      )}

      {!evaluation.isError && evaluation.data?.status === "COMPLETED" && (
        <div
          role="status"
          className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_22rem] lg:grid-rows-[minmax(0,1fr)]"
        >
          <div className="min-h-0 overflow-y-auto p-5 sm:p-6">
            {feedback.length > 0 && (
              <Accordion
                type="multiple"
                defaultValue={[String(feedback[0].feedbackId)]}
                className="rounded-[8px]"
              >
                {feedback.map((item, index) => (
                  <FeedbackCard
                    key={item.feedbackId}
                    feedback={item}
                    index={index}
                    total={feedback.length}
                  />
                ))}
              </Accordion>
            )}
          </div>

          <aside className="min-h-0 overflow-y-auto border-b bg-muted/25 p-5 max-lg:order-first sm:p-6 lg:border-b-0 lg:border-l">
            <div className="flex items-center gap-3">
              <img
                src={feedbackIllustration}
                alt="Preparo feedback character"
                className="size-14 shrink-0 object-contain"
              />
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-sm font-semibold">
                  <CheckCircle2 className="size-4 text-emerald-600" />
                  Your evaluation is ready
                </p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Review your answers and personalized feedback.
                </p>
              </div>
            </div>

            <Separator className="my-5" />

            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Session score
            </p>
            <div className="mt-2 flex items-end justify-between gap-3">
              <p className="text-4xl font-semibold tracking-tight">
                {overall ?? "—"}
                <span className="ml-1 text-sm font-medium text-muted-foreground">
                  / 100
                </span>
              </p>
              <Badge variant="outline" className="mb-1.5 bg-card">
                {feedback.length}{" "}
                {feedback.length === 1 ? "question" : "questions"}
              </Badge>
            </div>

            <div className="mt-5 space-y-3.5">
              {dimensions.map(([key, label]) => (
                <ScoreBar
                  key={key}
                  label={label}
                  value={averageScore(feedback, key)}
                />
              ))}
            </div>

            <BackToRoadmapButton className="mt-6 w-full bg-card" />
          </aside>
        </div>
      )}
    </section>
  );
}

export default InterviewEvaluation;
