import { useAuth } from "@/context/AuthProviderContext";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, CheckCircle2, Flame, Trophy } from "lucide-react";
import MetricCard from "@/features/dashboard/components/MetricCard";
import {
  fetchDashboardMetrics,
  type DashboardMetrics,
} from "./api/dashboardMetricsApi";

const plural = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? "" : "s"}`;

function streakDetail({ currentStreakDays, practicedToday }: DashboardMetrics) {
  if (currentStreakDays === 0) return "Start practicing today";
  if (practicedToday) return "Practiced today — nice work";
  return "Practice today to keep it going";
}

function MetricsSection() {
  const auth = useAuth();
  const userId = auth?.user?.id;
  const { data } = useQuery({
    queryKey: ["dashboard-metrics", userId],
    queryFn: fetchDashboardMetrics,
    enabled: Boolean(userId),
    retry: 1,
  });

  // While loading or on error the cards show placeholders instead of misleading zeros
  const placeholder = "—";

  return (
    <div className="grid gap-px overflow-hidden rounded-[8px] border bg-border shadow-sm sm:grid-cols-2 2xl:grid-cols-4">
      <MetricCard
        icon={BarChart3}
        label="Overall progress"
        value={data ? `${data.progressPercent}%` : placeholder}
        detail={
          data
            ? `${data.completedQuestions} of ${plural(data.totalQuestions, "question")} completed`
            : "Loading progress…"
        }
        progress={data?.progressPercent ?? 0}
      />
      <MetricCard
        icon={CheckCircle2}
        label="Questions answered"
        value={data ? String(data.questionsAnswered) : placeholder}
        detail="Unique questions across all stages"
      />
      <MetricCard
        icon={Trophy}
        label="Average score"
        value={
          data?.averageScore != null
            ? `${Math.round(data.averageScore)}/100`
            : placeholder
        }
        detail={
          data && data.scoredQuestions > 0
            ? `Best attempt per question · ${plural(data.scoredQuestions, "question")}`
            : "Best attempt per question, once scored"
        }
      />
      <MetricCard
        icon={Flame}
        label="Current streak"
        value={data ? plural(data.currentStreakDays, "day") : placeholder}
        detail={data ? streakDetail(data) : "Loading streak…"}
      />
    </div>
  );
}

export default MetricsSection;
