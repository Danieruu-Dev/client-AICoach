import { Mic, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";

// Illustrative sample of a practice question and its feedback, mirroring the real evaluation screen
const sampleScores = [
  { label: "Technical", value: 88 },
  { label: "Communication", value: 82 },
  { label: "Structure", value: 76 },
];

const waveform = [6, 12, 20, 14, 24, 10, 18, 26, 12, 8, 16, 22, 14, 9, 20, 12, 6, 14, 18, 10];

function ScoreRing({ value }: { value: number }) {
  const radius = 26;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="relative size-16 shrink-0">
      <svg viewBox="0 0 64 64" className="size-16 -rotate-90" aria-hidden="true">
        <circle cx="32" cy="32" r={radius} fill="none" strokeWidth="6" className="stroke-muted" />
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          className="stroke-(--preparo-teal)"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - value / 100)}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-lg font-semibold">
        {value}
      </span>
    </div>
  );
}

export default function ProductPreview() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none" aria-hidden="true">
      {/* Soft brand glows behind the cards */}
      <div className="absolute -top-6 right-6 -z-10 size-56 rounded-full bg-(--preparo-teal)/15 blur-3xl" />
      <div className="absolute bottom-0 -left-6 -z-10 size-48 rounded-full bg-(--preparo-yellow)/20 blur-3xl" />


      {/* Question card */}
      <div className="relative z-10 mr-8 rounded-[8px] border bg-card p-5 shadow-sm sm:mr-16">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-primary/8 px-2.5 py-1 text-[11px] font-semibold text-primary">
            React fundamentals
          </span>
          <span className="text-xs text-muted-foreground">Question 2 of 5</span>
        </div>
        <p className="mt-4 text-[15px] font-medium leading-6">
          How does React decide when a component should re-render?
        </p>
        <div className="mt-5 flex items-center gap-3 rounded-[8px] bg-muted/50 px-3 py-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Mic className="size-3.5" />
          </span>
          <div className="flex h-7 flex-1 items-center gap-0.75 overflow-hidden">
            {waveform.map((height, i) => (
              <span
                key={i}
                className="w-1 shrink-0 rounded-full bg-primary/35"
                style={{ height }}
              />
            ))}
          </div>
          <span className="text-xs tabular-nums text-muted-foreground">1:24</span>
        </div>
      </div>

      {/* Feedback card, overlapping */}
      <div className="relative z-20 -mt-6 ml-8 rounded-[8px] border bg-card p-5 shadow-lg sm:ml-20">
        <div className="flex items-center gap-4">
          <ScoreRing value={84} />
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-(--preparo-teal)">
              <Sparkles className="size-3.5" />
              AI feedback
            </p>
            <p className="mt-1 text-sm font-medium">Strong answer, clear examples</p>
            <p className="text-xs text-muted-foreground">Overall score out of 100</p>
          </div>
        </div>
        <div className="mt-5 space-y-3">
          {sampleScores.map((score) => (
            <div key={score.label}>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{score.label}</span>
                <span className="font-medium tabular-nums">{score.value}</span>
              </div>
              <Progress
                value={score.value}
                className="mt-1.5 h-1.5 rounded-full *:data-[slot=progress-indicator]:bg-(--preparo-teal)"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
