import type { BarChart3 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

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
    <article className="bg-card p-5">
      <p className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Icon className="size-3.5 text-primary" aria-hidden="true" />
        {label}
      </p>
      <p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p>
      {progress !== undefined && (
        <Progress
          className="mt-3 h-1.5 rounded-full"
          value={progress}
          aria-label={label}
        />
      )}
      <p className="mt-2 text-xs text-muted-foreground">{detail}</p>
    </article>
  );
}

export default MetricCard;
