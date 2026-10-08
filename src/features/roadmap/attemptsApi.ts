import api from "@/api/axios";
import type { Feedback } from "@/features/interview/interviewTypes";

export interface CompletedAttemptSummary {
  sessionPublicId: string;
  roadmapPublicId: string;
  stageId: number;
  stageName: string;
  attemptNumber: number;
  sessionStatus: string;
  startedAt: string | null;
  completedAt: string | null;
  questionCount: number;
  answeredCount: number;
  feedbackCompletedCount: number;
  averageScore: number | null;
}

export interface CompletedAttemptDetail extends CompletedAttemptSummary {
  answers: Feedback[];
}

export const fetchCompletedAttempts = async (roadmapPublicId: string, stageId: number) =>
  (await api.get<CompletedAttemptSummary[]>(
    `/api/interview-session/roadmaps/${roadmapPublicId}/stages/${stageId}/attempts`,
  )).data;

export const fetchCompletedAttempt = async (sessionPublicId: string) =>
  (await api.get<CompletedAttemptDetail>(
    `/api/interview-session/${sessionPublicId}/attempt`,
  )).data;
