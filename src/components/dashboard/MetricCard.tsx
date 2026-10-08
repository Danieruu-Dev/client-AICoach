import type { BarChart3 } from "lucide-react";

type MetricCardProps = {
  icon: typeof BarChart3;
  label: string;
  value: string;
  detail: string;
  progress?: number;
};

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
  progress,
}: MetricCardProps) {
  return (
    <article className="rounded-[8px] border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-[6px] bg-primary/8 text-primary">
          <Icon className="size-5" strokeWidth={1.8} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
        </div>
      </div>
      {progress !== undefined && (
        <div
          className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted"
          aria-hidden="true"
        >
          <div
            className="h-full bg-primary"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      <p className="mt-3 text-xs text-muted-foreground">{detail}</p>
    </article>
  );
}

export default MetricCard;
