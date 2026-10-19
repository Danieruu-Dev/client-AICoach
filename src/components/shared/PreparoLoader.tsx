import { useEffect, useState } from "react";
import mascot from "@/assets/preparo_sprites/happy-checklist-preparo.png";

interface PreparoLoaderProps {
  message?: string;
  // Fill the whole screen (page loads) or just the parent (sections)
  fullScreen?: boolean;
}

// The free hosting puts the API and Keycloak to sleep when idle, so the first
// request can take a minute. Explain the wait instead of looking frozen.
const SLOW_AFTER_MS = 6000;

function Sparkle({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`absolute fill-(--preparo-yellow) motion-safe:animate-twinkle ${className}`}
    >
      <path d="M12 0c.6 5.4 3.6 9.6 12 12-8.4 2.4-11.4 6.6-12 12-.6-5.4-3.6-9.6-12-12C8.4 9.6 11.4 5.4 12 0Z" />
    </svg>
  );
}

function PreparoLoader({ message = "Loading Preparo...", fullScreen = true }: PreparoLoaderProps) {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), SLOW_AFTER_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-6 bg-background p-6 text-center text-foreground ${
        fullScreen ? "min-h-svh" : "py-16"
      }`}
    >
      <div className="relative flex size-40 items-center justify-center">
        <div className="absolute inset-4 rounded-full bg-(--preparo-teal)/15 motion-safe:animate-pulse" />
        <Sparkle className="top-3 left-5 size-5" />
        <Sparkle className="top-8 right-3 size-4 [animation-delay:600ms]" />
        <Sparkle className="bottom-8 left-2 size-3 [animation-delay:1200ms]" />
        <img
          src={mascot}
          alt=""
          className="relative size-28 object-contain drop-shadow-md motion-safe:animate-float"
        />
      </div>

      <div className="flex w-56 flex-col items-center gap-3">
        <p className="text-sm font-medium">{message}</p>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full w-2/5 rounded-full bg-(--preparo-teal) motion-safe:animate-indeterminate" />
        </div>
      </div>

      {slow && (
        <p className="max-w-xs text-xs text-muted-foreground motion-safe:animate-in motion-safe:fade-in motion-safe:duration-500">
          Waking up Preparo&apos;s servers. The first visit after a break can take up to a minute.
        </p>
      )}
    </div>
  );
}

export default PreparoLoader;
