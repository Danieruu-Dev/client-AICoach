import api from "@/api/axios";

export type ActivityType =
  | "ACCOUNT_CREATED"
  | "ONBOARDING_COMPLETED"
  | "ROADMAP_GENERATED"
  | "ROADMAP_RESET"
  | "INTERVIEW_STARTED"
  | "INTERVIEW_SUBMITTED"
  | "FEEDBACK_READY"
  | "STAGE_COMPLETED";

export interface ActivityResponse {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  occurredAt: string;
  subjectId: string | null;
}

export const fetchRecentActivity = async (size = 5, page = 0) =>
  (await api.get<ActivityResponse[]>("/api/activity", { params: { page, size } })).data;
