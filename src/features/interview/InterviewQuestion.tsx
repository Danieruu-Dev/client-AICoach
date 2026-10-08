import { submitInterviewAnswers } from "./evaluationApi";
import type { AnswerSubmission } from "./interviewTypes";
import api from "@/api/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  // Lightbulb,
  Mic,
  RefreshCw,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Navigate, useParams, useNavigate } from "react-router-dom";

interface InterviewSessionQuestionResponse {
  interviewSessionPublicId: string;
  userPublicId: string;
  userRoadmapId: number;
  stageName: string;
  stageId: number;
  sessionType: string;
  interviewSessionStatus: string;
  attemptNumber: number;
  startedAt: string | null;
  completedAt: string | null;
  sessionQuestionId: number;
  position: number;
  sessionQuestionStatus: string;
  userRoadmapQuestionId: number;
  userRoadmapQuestionPublicId: string;
  questionBankId: number;
  questionText: string;
  sortOrder: number;
  userRoadmapQuestionStatus: string;
}
function InterviewQuestion() {
  const { interviewSessionPublicId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const startInterviewSession = async (interviewSessionPublicId: string) => {
    const response = await api.put<InterviewSessionQuestionResponse[]>(
      `/api/interview-session/${interviewSessionPublicId}/start`,
    );

    return response.data;
  };

  const submitAnswers = async (answers: Record<number, string>) => {
    if (!interviewSessionPublicId) {
      throw new Error("Missing interview session");
    }

    if (interviewQuestions.some(question => !answers[question.sessionQuestionId]?.trim())) {
      throw new Error("Please answer every question before submitting.");
    }
    const answerSubmissions: AnswerSubmission[] = interviewQuestions.map(question => ({
      sessionQuestionId: question.sessionQuestionId,
      answerText: answers[question.sessionQuestionId].trim(),
      answerFormat: "TEXT",
    }));

    return submitInterviewAnswers(interviewSessionPublicId, answerSubmissions);
  };

  const {
    data: interviewQuestions = [],
    isPending,
    isError,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["interview-session-questions", interviewSessionPublicId],
    queryFn: () => startInterviewSession(interviewSessionPublicId!),
    enabled: Boolean(interviewSessionPublicId),
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const answerMutation = useMutation({
    mutationFn: (answers: Record<number, string>) =>
      submitAnswers(answers),
    onSuccess: (evaluation) => {
      queryClient.setQueryData(["interview-evaluation", interviewSessionPublicId], evaluation);
      void queryClient.invalidateQueries({ queryKey: ["roadmap-stages"] });
      void queryClient.invalidateQueries({ queryKey: ["roadmap-summary"] });
      navigate(`/interview/evaluation/${interviewSessionPublicId}`, { replace: true });
    },
  });

  const questions = useMemo(() => {
    return [...interviewQuestions].sort(
      (first, second) =>
        (first.position ?? first.sortOrder ?? 0) -
        (second.position ?? second.sortOrder ?? 0),
    );
  }, [interviewQuestions]);

  const safeCurrentQuestion = Math.min(
    Math.max(currentQuestion, 1),
    Math.max(questions.length, 1),
  );
  const activeQuestion = questions[safeCurrentQuestion - 1];
  const activeAnswer = activeQuestion
    ? (answers[activeQuestion.sessionQuestionId] ?? "")
    : "";

  if (!interviewSessionPublicId) {
    return <Navigate to="/roadmap" replace />;
  }

  if (isPending) {
    return (
      <section className="flex min-h-0 flex-1 flex-col overflow-y-auto rounded-md border bg-card p-5 shadow-sm sm:p-6">
        <div className="mx-auto flex w-full max-w-4xl flex-1 animate-pulse flex-col">
          <div className="h-5 w-36 rounded-sm bg-muted" />
          <div className="mt-6 flex min-h-105 flex-1 flex-col rounded-md border p-5 sm:p-6">
            <div className="h-6 w-20 rounded-sm bg-muted" />
            <div className="mt-4 h-8 w-4/5 rounded-sm bg-muted" />
            <div className="mt-3 h-8 w-3/5 rounded-sm bg-muted" />
            <div className="my-6 border-t" />
            <div className="flex flex-1 items-center justify-center">
              <div className="size-20 rounded-full bg-muted" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="flex min-h-0 flex-1 flex-col overflow-y-auto rounded-md border bg-card p-5 shadow-sm sm:p-6">
        <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center text-center">
          <AlertCircle className="size-9 text-destructive" />
          <h2 className="mt-4 text-lg font-semibold">
            Couldn&apos;t load interview questions
          </h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Try loading the questions again before starting this interview.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="mt-5 flex items-center gap-2 rounded-sm border px-4 py-2.5 text-xs font-medium transition-colors hover:bg-muted disabled:cursor-wait disabled:opacity-60"
          >
            <RefreshCw
              className={`size-3.5 ${isFetching ? "animate-spin" : ""}`}
            />
            Try again
          </button>
        </div>
      </section>
    );
  }

  if (!activeQuestion) {
    return (
      <section className="flex min-h-0 flex-1 flex-col overflow-y-auto rounded-md border bg-card p-5 shadow-sm sm:p-6">
        <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center text-center">
          <h2 className="text-lg font-semibold">No questions available</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            This stage does not have any interview questions yet.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border bg-card p-4 shadow-sm sm:p-5">
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <p className="shrink-0 text-sm font-semibold">
            Question {safeCurrentQuestion} of {questions.length}
          </p>
          <div
            className="flex min-w-0 flex-1 items-center justify-between gap-1"
            aria-label="Question progress"
          >
            {questions.map((question, index) => {
              const number = index + 1;
              const completed = Boolean(
                answers[question.sessionQuestionId]?.trim(),
              );
              const active = number === safeCurrentQuestion;
              return (
                <div
                  key={question.sessionQuestionId}
                  className="flex min-w-0 flex-1 items-center last:flex-none"
                >
                  <button
                    type="button"
                    onClick={() => setCurrentQuestion(number)}
                    aria-label={`Go to question ${number}`}
                    aria-current={active ? "step" : undefined}
                    className={`flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full border text-xs font-semibold transition-colors ${completed ? "border-emerald-400 bg-emerald-500/10 text-emerald-600" : active ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}
                  >
                    {completed ? <Check className="size-3.5" /> : number}
                  </button>
                  {number < questions.length && (
                    <span
                      className={`mx-1 h-px min-w-1 flex-1 ${completed ? "bg-emerald-300" : "bg-border"}`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 flex min-h-0 flex-1 flex-col rounded-md border p-4 sm:p-5">
          <div>
            <h1 className="mt-4 text-xl font-semibold tracking-tight sm:text-2xl">
              {activeQuestion.questionText}
            </h1>
          </div>

          <div className="my-4 border-t" />

          <div className="flex flex-1 flex-col">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <label
                  htmlFor={`answer-${activeQuestion.sessionQuestionId}`}
                  className="text-sm font-semibold"
                >
                  Your answer
                </label>
                <p className="mt-1 text-xs text-muted-foreground">
                  Write a clear, structured response in your own words.
                </p>
              </div>
              <button
                type="button"
                disabled
                title="Voice answers are not available yet"
                className="flex cursor-not-allowed items-center gap-2 rounded-sm border bg-muted/30 px-3 py-2 text-xs font-medium text-muted-foreground opacity-70"
              >
                <Mic className="size-4" />
                Voice answer
                <span className="rounded-sm bg-muted px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide">
                  Coming soon
                </span>
              </button>
            </div>
            <textarea
              id={`answer-${activeQuestion.sessionQuestionId}`}
              disabled={answerMutation.isPending}
              value={activeAnswer}
              onChange={(event) =>
                setAnswers((currentAnswers) => ({
                  ...currentAnswers,
                  [activeQuestion.sessionQuestionId]: event.target.value,
                }))
              }
              placeholder="Type your answer here..."
              className="mt-3 min-h-32 flex-1 resize-none rounded-sm border bg-background p-4 text-sm leading-6 outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
            <p className="mt-2 text-right text-[11px] text-muted-foreground">
              {activeAnswer.length} characters
            </p>
          </div>

          {answerMutation.isError && <p role="alert" className="mt-3 text-sm text-destructive">{answerMutation.error.message}</p>}
          {questions.some(question => !answers[question.sessionQuestionId]?.trim()) && <p className="mt-3 text-xs text-muted-foreground">Answer every question before submitting.</p>}
          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() =>
                setCurrentQuestion(Math.max(1, safeCurrentQuestion - 1))
              }
              disabled={safeCurrentQuestion === 1}
              className="flex cursor-pointer items-center gap-2 rounded-sm border px-4 py-2.5 text-xs font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowLeft className="size-4" />
              Previous
            </button>

            {questions.length === safeCurrentQuestion ? (
              <button
                onClick={() => { if (!answerMutation.isPending) answerMutation.mutate(answers); }}
                disabled={answerMutation.isPending || questions.some(question => !answers[question.sessionQuestionId]?.trim())}
                type="button"
                className="flex cursor-pointer items-center gap-2 rounded-sm bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {answerMutation.isPending ? "Saving answers..." : "Submit"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() =>
                  setCurrentQuestion(
                    Math.min(questions.length, safeCurrentQuestion + 1),
                  )
                }
                disabled={safeCurrentQuestion === questions.length}
                className="flex cursor-pointer items-center gap-2 rounded-sm bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
                <ArrowRight className="size-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default InterviewQuestion;
