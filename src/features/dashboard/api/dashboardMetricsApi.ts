import api from "@/api/axios";

export interface DashboardMetrics {
  totalQuestions: number;
  completedQuestions: number;
  progressPercent: number;
  questionsAnswered: number;
  // Average of each question's best completed score (0-100); null until one is scored
  averageScore: number | null;
  scoredQuestions: number;
  currentStreakDays: number;
  practicedToday: boolean;
  timeZone: string;
}

// The browser's zone decides what "today" means for the streak
export const fetchDashboardMetrics = async () =>
  (await api.get<DashboardMetrics>("/api/dashboard/metrics", {
    params: { tz: Intl.DateTimeFormat().resolvedOptions().timeZone },
  })).data;
