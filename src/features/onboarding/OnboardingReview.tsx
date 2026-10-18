import { PencilLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PreparationState, ProfileState, Skills } from "@/pages/Onboarding";

type ReviewRow = { label: string; value: React.ReactNode };

function ReviewSection({
  title,
  step,
  rows,
  onEdit,
  children,
}: {
  title: string;
  step: number;
  rows?: ReviewRow[];
  onEdit: (step: number) => void;
  children?: React.ReactNode;
}) {
  return (
    <section className="py-6 first:pt-0 last:pb-0">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {title}
        </h2>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-primary"
          onClick={() => onEdit(step)}
          aria-label={`Edit ${title.toLowerCase()}`}
        >
          <PencilLine className="size-3.5" aria-hidden="true" />
          Edit
        </Button>
      </div>
      {rows && (
        <dl className="mt-3 grid gap-x-6 gap-y-4 sm:grid-cols-2">
          {rows.map((row) => (
            <div key={row.label} className="min-w-0">
              <dt className="text-xs text-muted-foreground">{row.label}</dt>
              <dd className="mt-0.5 text-sm font-medium wrap-break-word">{row.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {children}
    </section>
  );
}

const NotSet = () => <span className="font-normal text-muted-foreground">Not set</span>;

function OnboardingReview({
  profile,
  preparation,
  skills,
  onEdit,
}: {
  profile: ProfileState;
  preparation: PreparationState;
  skills: Skills[];
  onEdit: (step: number) => void;
}) {
  const interview = preparation.hasUpcomingInterview
    ? preparation.interviewDate
      ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(
          preparation.interviewDate,
        )
      : "Scheduled, date not set"
    : "None scheduled yet";

  return (
    <div className="divide-y">
      <ReviewSection
        title="Profile"
        step={1}
        onEdit={onEdit}
        rows={[
          { label: "Current status", value: profile.currentStatus?.name ?? <NotSet /> },
          { label: "Coding experience", value: profile.codingExperience?.name ?? <NotSet /> },
        ]}
      />

      <ReviewSection
        title="Preparation goal"
        step={2}
        onEdit={onEdit}
        rows={[
          { label: "Target role", value: preparation.targetRole?.name ?? <NotSet /> },
          { label: "Industry", value: preparation.targetIndustry?.name ?? <NotSet /> },
          { label: "Upcoming interview", value: interview },
          {
            label: "Focus notes",
            value: preparation.careerGoal.trim() ? (
              <span className="font-normal whitespace-pre-wrap">{preparation.careerGoal.trim()}</span>
            ) : (
              <span className="font-normal text-muted-foreground">None added</span>
            ),
          },
        ]}
      />

      <ReviewSection title={`Skills (${skills.length})`} step={3} onEdit={onEdit}>
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {skills.map((skill) => (
            <li
              key={skill.id}
              className="inline-flex h-7 items-center rounded-full border bg-muted/40 px-3 text-xs font-medium"
            >
              {skill.name}
            </li>
          ))}
        </ul>
      </ReviewSection>
    </div>
  );
}

export default OnboardingReview;
