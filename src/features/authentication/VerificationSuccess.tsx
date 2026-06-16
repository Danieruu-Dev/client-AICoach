import ModeToggle from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";

const confettiPieces = [
  { x: -180, y: -120, rotate: -24, color: "bg-emerald-500", size: "h-3 w-1.5" },
  { x: -140, y: 100, rotate: 18, color: "bg-amber-400", size: "size-2" },
  { x: -90, y: -160, rotate: 32, color: "bg-sky-500", size: "h-4 w-1.5" },
  { x: -40, y: 140, rotate: -30, color: "bg-rose-500", size: "size-2.5" },
  { x: 40, y: -150, rotate: 14, color: "bg-violet-500", size: "h-3 w-1.5" },
  { x: 90, y: 120, rotate: -22, color: "bg-fuchsia-500", size: "size-2" },
  { x: 140, y: -90, rotate: 26, color: "bg-emerald-500", size: "h-4 w-1.5" },
  { x: 180, y: 90, rotate: -16, color: "bg-amber-400", size: "size-2.5" },
  { x: -220, y: -40, rotate: -12, color: "bg-sky-500", size: "size-2" },
  { x: -205, y: 48, rotate: 34, color: "bg-fuchsia-500", size: "h-3 w-1.5" },
  { x: -160, y: -210, rotate: 22, color: "bg-amber-400", size: "size-2.5" },
  { x: -120, y: 200, rotate: -28, color: "bg-emerald-500", size: "h-4 w-1.5" },
  { x: 120, y: -210, rotate: 18, color: "bg-rose-500", size: "size-2" },
  { x: 160, y: 210, rotate: -30, color: "bg-sky-500", size: "h-3 w-1.5" },
  { x: 205, y: -55, rotate: 40, color: "bg-violet-500", size: "size-2.5" },
  { x: 225, y: 35, rotate: -18, color: "bg-amber-400", size: "size-2" },
] as const;

function VerificationSuccess() {
  const [showBurst, setShowBurst] = useState(true);

  useEffect(() => {
    const burstTimer = window.setTimeout(() => {
      setShowBurst(false);
    }, 1400);

    return () => window.clearTimeout(burstTimer);
  }, []);

  return (
    <div className="relative flex min-h-svh items-center justify-center bg-muted p-6 md:p-10">
      <style>{`
        @keyframes confetti-burst {
          0% {
            transform: translate(-50%, -50%) scale(0.25) rotate(var(--rotate));
            opacity: 0;
          }
          12% {
            opacity: 1;
          }
          72% {
            opacity: 1;
          }
          100% {
            transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(1) rotate(calc(var(--rotate) + 28deg));
            opacity: 0;
          }
        }
      `}</style>

      {showBurst ? (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {confettiPieces.map((piece, index) => {
            const burstStyle: CSSProperties = {
              ["--tx" as keyof CSSProperties]: `${piece.x}px`,
              ["--ty" as keyof CSSProperties]: `${piece.y}px`,
              ["--rotate" as keyof CSSProperties]: `${piece.rotate}deg`,
              animation:
                "confetti-burst 1.25s cubic-bezier(0.11, 0.69, 0.27, 1) forwards",
              animationDelay: `${index * 14}ms`,
            };

            return (
              <span
                key={`${piece.color}-${index}`}
                aria-hidden="true"
                className={`absolute left-1/2 top-[52%] rounded-full shadow-sm shadow-black/10 ${piece.size} ${piece.color}`}
                style={burstStyle}
              />
            );
          })}
        </div>
      ) : null}

      <div className="absolute right-4 top-4 md:right-6 md:top-6">
        <ModeToggle />
      </div>

      <div className="w-full max-w-md">
        <Card className="overflow-hidden border-border/60 shadow-lg shadow-black/5">
          <CardHeader className="space-y-3 text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full border border-emerald-500/15 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <svg
                viewBox="0 0 24 24"
                className="size-7"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M5 12.5L9.25 16.75L19 7"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div className="space-y-1">
              <CardTitle className="text-2xl">Email verified</CardTitle>
              <CardDescription className="text-base">
                Your account has been successfully verified. You can now sign in
                and continue.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="rounded-xl border border-border/70 bg-background/80 p-4 text-center text-sm text-muted-foreground">
              Verification completed successfully.
            </div>

            <Button asChild className="w-full">
              <Link to="/authentication">Continue to sign in</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default VerificationSuccess;
