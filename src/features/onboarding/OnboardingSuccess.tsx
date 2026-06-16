import React, { useEffect, useState, type CSSProperties } from "react";
import { ArrowRight, BarChart3, Check, Lightbulb, Target } from "lucide-react";
import { useAuth } from "@/context/AuthProviderContext";

const confettiPieces = [
  {
    x: -210,
    y: -135,
    rotate: -24,
    color: "bg-emerald-500",
    size: "h-4 w-1.5",
    rounded: "rounded-full",
  },
  {
    x: -175,
    y: -75,
    rotate: 35,
    color: "bg-amber-400",
    size: "h-3 w-3",
    rounded: "rounded-sm",
  },
  {
    x: -140,
    y: 105,
    rotate: 18,
    color: "bg-sky-500",
    size: "h-2.5 w-2.5",
    rounded: "rounded-full",
  },
  {
    x: -105,
    y: -165,
    rotate: 32,
    color: "bg-violet-500",
    size: "h-5 w-1.5",
    rounded: "rounded-full",
  },
  {
    x: -70,
    y: 145,
    rotate: -30,
    color: "bg-rose-500",
    size: "h-3 w-3",
    rounded: "rounded-sm",
  },
  {
    x: -35,
    y: -120,
    rotate: 55,
    color: "bg-teal-400",
    size: "h-4 w-1.5",
    rounded: "rounded-full",
  },

  {
    x: 35,
    y: -155,
    rotate: 14,
    color: "bg-violet-500",
    size: "h-3 w-1.5",
    rounded: "rounded-full",
  },
  {
    x: 65,
    y: 135,
    rotate: -22,
    color: "bg-fuchsia-500",
    size: "h-2.5 w-2.5",
    rounded: "rounded-full",
  },
  {
    x: 105,
    y: -105,
    rotate: 26,
    color: "bg-emerald-500",
    size: "h-5 w-1.5",
    rounded: "rounded-full",
  },
  {
    x: 145,
    y: 90,
    rotate: -16,
    color: "bg-amber-400",
    size: "h-3 w-3",
    rounded: "rounded-sm",
  },
  {
    x: 185,
    y: -145,
    rotate: 42,
    color: "bg-sky-500",
    size: "h-4 w-1.5",
    rounded: "rounded-full",
  },
  {
    x: 215,
    y: 125,
    rotate: -38,
    color: "bg-rose-400",
    size: "h-2.5 w-2.5",
    rounded: "rounded-full",
  },
] as const;

function OnboardingSuccess() {
  const auth = useAuth();
  const [showBurst, setShowBurst] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowBurst(false);
    }, 1900);

    return () => window.clearTimeout(timer);
  }, []);
  return (
    <div className="relative mx-auto w-full max-w-5xl rounded-2xl bg-card/90 px-8 text-center">
      <style>{`
  @keyframes confetti-burst {
    0% {
      transform: translate(-50%, -50%) scale(0.15) rotate(var(--rotate));
      opacity: 0;
    }
    10% {
      opacity: 1;
    }
    70% {
      opacity: 1;
    }
    100% {
      transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(1.05) rotate(calc(var(--rotate) + 180deg));
      opacity: 0;
    }
  }

  @keyframes confetti-float {
    0%, 100% {
      transform: translateY(0) rotate(var(--rotate));
    }
    50% {
      transform: translateY(-8px) rotate(calc(var(--rotate) + 12deg));
    }
  }
`}</style>
      <div className="flex items-center justify-center">
        <div className="relative flex h-44 w-44 items-center justify-center">
          {showBurst &&
            confettiPieces.map((piece, index) => {
              const burstStyle: CSSProperties = {
                ["--tx" as keyof CSSProperties]: `${piece.x}px`,
                ["--ty" as keyof CSSProperties]: `${piece.y}px`,
                ["--rotate" as keyof CSSProperties]: `${piece.rotate}deg`,
                animation:
                  "confetti-burst 1.75s cubic-bezier(0.11, 0.69, 0.27, 1) forwards",
                animationDelay: `${index * 14}ms`,
              };

              return (
                <span
                  key={`${piece.color}-${index}`}
                  aria-hidden="true"
                  className={`pointer-events-none absolute left-1/2 top-1/2 z-30 rounded-full shadow-sm shadow-black/10 ${piece.size} ${piece.color}`}
                  style={burstStyle}
                />
              );
            })}

          <div className="absolute h-40 w-40 rounded-full bg-[#EFF9F8]" />

          <img
            src="src/assets/preparo_sprites/thumbs-up-preparo.png"
            alt="Success"
            className="relative z-10 w-28"
          />

          <div className="absolute bottom-5 right-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-[#12B981] text-white shadow-md">
            <Check size={26} strokeWidth={3} />
          </div>
        </div>
      </div>

      <div className="mt-2">
        <h2 className="text-2xl font-bold text-[#071A55]">
          {auth?.user?.firstName}, you&apos;re all set! 🎉
        </h2>

        <p className="mx-auto mt-1 max-w-xl text-base leading-7 text-[#53627E] text-[15px]">
          Your profile is ready and we&apos;re excited to help you on your
          learning and interview preparation journey!
        </p>
      </div>

      <div className="mx-auto mt-2 max-w-4xl rounded-2xl bg-white p-6">
        <h3 className="mb-6 text-[16px] font-bold text-[#071A55]">
          Here&apos;s what you can do next
        </h3>

        <div className="grid gap-6 md:grid-cols-3 md:divide-x md:divide-[#EEF0F5]">
          <NextStep
            icon={<Target size={26} />}
            title="Start practicing"
            description="Explore personalized questions and mock interviews."
            bg="bg-[#E5FAF5]"
            color="text-[#12B981]"
          />

          <NextStep
            icon={<BarChart3 size={26} />}
            title="Track your progress"
            description="Monitor your performance and improve step by step."
            bg="bg-[#F0EAFE]"
            color="text-[#8B5CF6]"
          />

          <NextStep
            icon={<Lightbulb size={26} />}
            title="Stay consistent"
            description="Keep practicing and achieve your goals!"
            bg="bg-[#FFF5D8]"
            color="text-[#F4B000]"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-col items-center gap-4">
        <button className="flex w-full text-sm max-w-xs items-center justify-center gap-3 rounded-lg bg-[#0038D8] font-semibold text-white shadow-md transition hover:bg-[#002FB8] cursor-pointer px-4 py-2">
          Go to Dashboard
          <ArrowRight size={18} />
        </button>

        <button className="text-sm font-semibold text-[#0038D8] hover:underline cursor-pointer">
          Explore a quick demo
        </button>
      </div>
    </div>
  );
}

function NextStep({
  icon,
  title,
  description,
  bg,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  bg: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-4 px-4 text-left">
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${bg} ${color}`}
      >
        {icon}
      </div>

      <div>
        <h4 className="text-sm font-bold text-[#071A55]">{title}</h4>
        <p className="mt-1 text-sm leading-6 text-[#53627E]">{description}</p>
      </div>
    </div>
  );
}

export default OnboardingSuccess;
