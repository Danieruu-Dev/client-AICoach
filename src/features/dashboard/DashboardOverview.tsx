import {
  BarChart3,
  Braces,
  CheckCircle2,
  CircleUserRound,
  Code2,
  Flame,
  GitBranch,
  Layers3,
  MessageCircleMore,
  ServerCog,
  Target,
  Trophy,
} from "lucide-react";

// import ModeToggle from "@/components/mode-toggle";

import RoadmapSection from "./RoadmapSection";
import MetricCard from "@/components/dashboard/MetricCard";
import PracticeInterviewSection from "./PracticeInterviewSection";
import RecentActivitySection from "./RecentActivitySection";
import RoadmapSwitcher from "@/components/shared/RoadmapSwitcher";

type RoadmapOverviewProps = {
  firstName?: string;
};

const practiceOptions = [
  { title: "React", subtitle: "Frontend", icon: Braces },
  { title: "Git", subtitle: "Core skills", icon: GitBranch },
  { title: "HTTP & APIs", subtitle: "Web concepts", icon: ServerCog },
  { title: "Behavioral", subtitle: "Soft skills", icon: CircleUserRound },
  { title: "Project review", subtitle: "Deep dive", icon: Layers3 },
  {
    title: "Mock interview",
    subtitle: "Full practice",
    icon: MessageCircleMore,
  },
];

const recentActivity = [
  {
    title: "Roadmap generated",
    description: "Full Stack Developer",
    time: "Today",
    icon: Target,
  },
  {
    title: "Preparation goal created",
    description: "Technology & SaaS",
    time: "Today",
    icon: CheckCircle2,
  },
  {
    title: "Skills added",
    description: "Your roadmap is ready",
    time: "Today",
    icon: Code2,
  },
];

export default function RoadmapOverview({ firstName }: RoadmapOverviewProps) {
  const displayName = firstName?.trim() || "there";

  return (
    <section className="min-h-screen flex-1 bg-muted/20 px-4 pb-8 pt-20 sm:px-6 lg:px-8 lg:pt-8">
      <div className="mx-auto max-w-360">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Dashboard</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
              Good afternoon, {displayName}!
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Let&apos;s practice and get better every day.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <RoadmapSwitcher />
            {/* <ModeToggle /> */}
          </div>
        </header>

        <RoadmapSection />

        {/* Roadmap Metrics */}
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={BarChart3}
            label="Overall progress"
            value="0%"
            detail="0 of 25 questions"
            progress={0}
          />
          <MetricCard
            icon={CheckCircle2}
            label="Questions answered"
            value="0"
            detail="Across all stages"
          />
          <MetricCard
            icon={Trophy}
            label="Average score"
            value="—"
            detail="Complete a question to begin"
          />
          <MetricCard
            icon={Flame}
            label="Current streak"
            value="0 days"
            detail="Start practicing today"
          />
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
          <PracticeInterviewSection practiceOptions={practiceOptions} />
          <RecentActivitySection recentActivity={recentActivity} />
        </div>
      </div>
    </section>
  );
}
