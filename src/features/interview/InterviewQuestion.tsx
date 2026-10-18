import { submitInterviewAnswers } from "./api/evaluationApi";
import VoiceAnswerPanel from "./components/VoiceAnswerPanel";
import { useAudioRecorder } from "./hooks/useAudioRecorder";
import { useVoiceAnswers } from "./hooks/useVoiceAnswers";
import type { AnswerSubmission } from "./types/interviewTypes";
import api from "@/api/axios";
import { getDefaultAnswerMode, type AnswerMode } from "@/lib/preferences";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  Keyboard,
  // Lightbulb,
  Loader2,
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

const ANSWER_MODES = [
  { value: "voice", label: "Voice", icon: Mic },
  { value: "text", label: "Type", icon: Keyboard },
] as const;

function InterviewQuestion() {
  const { interviewSessionPublicId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const recorder = useAudioRecorder();
  const isMicBusy = recorder.status !== "idle";
  // Transcripts land in `answers`, the same place typed text lives
  const { voiceAnswers, addRecording, retry } = useVoiceAnswers(
    (sessionQuestionId, text) =>
      setAnswers((currentAnswers) => ({
        ...currentAnswers,
        [sessionQuestionId]: text,
      })),
  );
  // Starts from the default chosen in Settings; the last mode picked carries over to unvisited questions
  const [preferredMode, setPreferredMode] = useState<AnswerMode>(getDefaultAnswerMode);
  const [answerModes, setAnswerModes] = useState<Record<number, AnswerMode>>({});

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
      answerFormat:
        voiceAnswers[question.sessionQuestionId]?.status === "done"
          ? "AUDIO"
          : "TEXT",
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
  const answerMode = activeQuestion
    ? (answerModes[activeQuestion.sessionQuestionId] ?? preferredMode)
    : preferredMode;
  const activeVoiceAnswer = activeQuestion
    ? voiceAnswers[activeQuestion.sessionQuestionId]
    : undefined;
  const isTranscribing = questions.some(
    (question) =>
      voiceAnswers[question.sessionQuestionId]?.status === "transcribing",
  );

  const startRecording = () => {
    if (!activeQuestion) return;
    const { sessionQuestionId } = activeQuestion;
    void recorder.start((recording) => addRecording(sessionQuestionId, recording));
  };

  const updateActiveAnswer = (text: string) => {
    if (!activeQuestion) return;
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [activeQuestion.sessionQuestionId]: text,
    }));
  };

  const selectAnswerMode = (mode: AnswerMode) => {
    if (!activeQuestion) return;
    setPreferredMode(mode);
    setAnswerModes((currentModes) => ({
      ...currentModes,
      [activeQuestion.sessionQuestionId]: mode,
    }));
  };

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
              const voiceStatus =
                voiceAnswers[question.sessionQuestionId]?.status;
              const transcribing = voiceStatus === "transcribing";
              const completed =
                !transcribing &&
                Boolean(answers[question.sessionQuestionId]?.trim());
              const failed =
                !transcribing && !completed && voiceStatus === "error";
              const active = number === safeCurrentQuestion;
              return (
                <div
                  key={question.sessionQuestionId}
                  className="flex min-w-0 flex-1 items-center last:flex-none"
                >
                  <button
                    type="button"
                    onClick={() => setCurrentQuestion(number)}
                    disabled={isMicBusy}
                    aria-label={`Go to question ${number}${transcribing ? ", transcribing" : failed ? ", transcription failed" : completed ? ", answered" : ""}`}
                    aria-current={active ? "step" : undefined}
                    className={`flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full border text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${transcribing ? "border-amber-400 bg-amber-500/10 text-amber-600" : completed ? "border-emerald-400 bg-emerald-500/10 text-emerald-600" : failed ? "border-destructive/60 bg-destructive/10 text-destructive" : active ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}
                  >
                    {transcribing ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : completed ? (
                      <Check className="size-3.5" />
                    ) : failed ? (
                      <AlertCircle className="size-3.5" />
                    ) : (
                      number
                    )}
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
                  {answerMode === "voice"
                    ? "Speak your answer, or switch to typing."
                    : "Write a clear, structured response in your own words."}
                </p>
              </div>
              <div
                role="group"
                aria-label="Answer mode"
                className="flex rounded-sm border bg-muted/30 p-0.5"
              >
                {ANSWER_MODES.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => selectAnswerMode(value)}
                    disabled={isMicBusy || answerMutation.isPending}
                    aria-pressed={answerMode === value}
                    className={`flex cursor-pointer items-center gap-1.5 rounded-[3px] px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${answerMode === value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <Icon className="size-3.5" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {answerMode === "voice" ? (
              <VoiceAnswerPanel
                textareaId={`answer-${activeQuestion.sessionQuestionId}`}
                recorder={recorder}
                voiceAnswer={activeVoiceAnswer}
                answer={activeAnswer}
                disabled={answerMutation.isPending}
                onAnswerChange={updateActiveAnswer}
                onStartRecording={startRecording}
                onRetry={() => retry(activeQuestion.sessionQuestionId)}
                onTypeInstead={() => selectAnswerMode("text")}
              />
            ) : (
              <>
                <textarea
                  id={`answer-${activeQuestion.sessionQuestionId}`}
                  // Locked while a recording is transcribing, so the two can't overwrite each other
                  disabled={
                    answerMutation.isPending ||
                    activeVoiceAnswer?.status === "transcribing"
                  }
                  value={activeAnswer}
                  onChange={(event) => updateActiveAnswer(event.target.value)}
                  placeholder={
                    activeVoiceAnswer?.status === "transcribing"
                      ? "Transcribing your recording..."
                      : "Type your answer here..."
                  }
                  className="mt-3 min-h-32 flex-1 resize-none rounded-sm border bg-background p-4 text-sm leading-6 outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
                <p className="mt-2 text-right text-[11px] text-muted-foreground">
                  {activeAnswer.length} characters
                </p>
              </>
            )}
          </div>

          {answerMutation.isError && <p role="alert" className="mt-3 text-sm text-destructive">{answerMutation.error.message}</p>}
          {questions.some(question => !answers[question.sessionQuestionId]?.trim()) && <p className="mt-3 text-xs text-muted-foreground">Answer every question before submitting.</p>}
          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentQuestion(Math.max(1, safeCurrentQuestion - 1))}
              disabled={safeCurrentQuestion === 1 || isMicBusy}
              className="flex cursor-pointer items-center gap-2 rounded-sm border px-4 py-2.5 text-xs font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowLeft className="size-4" />
              Previous
            </button>

            {questions.length === safeCurrentQuestion ? (
              <button
                onClick={() => { if (!answerMutation.isPending) answerMutation.mutate(answers); }}
                disabled={answerMutation.isPending || isMicBusy || isTranscribing || questions.some(question => !answers[question.sessionQuestionId]?.trim())}
                type="button"
                className="flex cursor-pointer items-center gap-2 rounded-sm bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {answerMutation.isPending
                  ? "Saving answers..."
                  : isTranscribing
                    ? "Finishing transcription..."
                    : "Submit"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() =>
                  setCurrentQuestion(
                    Math.min(questions.length, safeCurrentQuestion + 1),
                  )
                }
                disabled={safeCurrentQuestion === questions.length || isMicBusy}
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
