import api from "@/api/axios";
import type {
  AnswerSubmission,
  InterviewEvaluation,
  SubmissionResponse,
} from "./interviewTypes";

export const submitInterviewAnswers = async (
  sessionId: string,
  answers: AnswerSubmission[],
) => {
  const { data } = await api.post<SubmissionResponse>(
    `/api/interviews/${sessionId}/submit`,
    answers,
  );

  return data;
};

export const getInterviewEvaluation = async (
  sessionId: string,
  signal?: AbortSignal,
) => {
  const { data } = await api.get<InterviewEvaluation>(
    `/api/interviews/${sessionId}/evaluation`,
    { signal },
  );

  return data;
};
