export type EvaluationStatus = "PENDING" | "GENERATING" | "COMPLETED" | "FAILED";

export const isFeedbackGenerating = (status?: string) =>
  status === "PENDING" || status === "GENERATING";

export interface AnswerSubmission {
  sessionQuestionId: number;
  answerText: string;
  answerFormat: "TEXT";
}

export interface Feedback {
  feedbackId: number;
  feedbackPublicId: string;
  interviewAnswerId: number;
  interviewAnswerPublicId: string;
  sessionQuestionId: number;
  userRoadmapQuestionId: number;
  roadmapStageTemplateId: number;
  questionBankId: number;
  questionText: string;
  answerText: string;
  answerFormat: "TEXT" | "VOICE";
  submittedAt: string;
  status: EvaluationStatus;
  overallScore: number | null;
  technicalScore: number | null;
  conceptualUnderstandingScore: number | null;
  communicationScore: number | null;
  structureScore: number | null;
  confidenceScore: number | null;
  summary: string;
  strengths: string;
  improvements: string;
  suggestedAnswer: string;
  failureReason: string;
}

export interface InterviewEvaluation {
  sessionPublicId: string;
  status: EvaluationStatus;
  feedback: Feedback[];
  message: string;
}

export type SubmissionResponse = InterviewEvaluation;
