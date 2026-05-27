import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ModeToggle from "@/components/mode-toggle";
import { useQuery } from "@tanstack/react-query";
import api from "@/api/axios";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

const COUNTDOWN_SECONDS = 3 * 60;

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const remainingSeconds = (seconds % 60).toString().padStart(2, "0");

  return `${minutes}:${remainingSeconds}`;
}

export default function Verification() {
  const [secondsRemaining, setSecondsRemaining] = useState(COUNTDOWN_SECONDS);
  const [, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isIDValid, setIsIDValid] = useState<boolean | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(
    null,
  );
  const canResend = secondsRemaining === 0 && !isResending;
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const queryUserId = searchParams.get("userId");
  const token = searchParams.get("token");
  const verificationUserId = queryUserId ?? id;
  const isVerificationLink = Boolean(queryUserId && token);
  const activeUserId = verificationUserId ?? null;

  const { data: isVerified } = useQuery({
    queryKey: ["account-status", activeUserId],
    queryFn: async () => {
      if (!activeUserId) return false;

      try {
        const response = await api.get(
          `/api/auth/account-status/${activeUserId}`,
        );
        return response.data.isVerified === "true";
      } catch (error) {
        console.error("Failed to fetch verification status:", error);
        return false;
      }
    },
    refetchInterval: 5000,
    enabled: !!activeUserId && !isVerificationLink,
  });

  useEffect(() => {
    if (secondsRemaining === 0) return;

    const id = window.setInterval(() => {
      setSecondsRemaining((s) => Math.max(s - 1, 0));
    }, 1000);

    return () => window.clearInterval(id);
  }, [secondsRemaining]);

  const handleResend = async () => {
    const email = localStorage.getItem("email") || null;
    if (!email) {
      toast.error("Email not found. Please sign up or sign in again.");
      return;
    }

    setIsResending(true);
    try {
      const response = await api.post(`/api/auth/resend-verification`, {
        publicId: activeUserId,
        email: JSON.parse(email),
      });
      console.log("Resend response:", response.data);
      toast.success("Verification email resent!");

      const cooldownResponse = await api.get(
        `/api/auth/resend-cooldown/${activeUserId}`,
      );
      const result = cooldownResponse.data;
      console.log("Cooldown seconds:", result.remainingSeconds);
      if (result.remainingSeconds <= 0) {
        setSecondsRemaining(0);
      } else {
        setSecondsRemaining(result.remainingSeconds);
      }
    } catch (error) {
      console.error("Failed to resend verification email:", error);
      toast.error("Failed to resend verification email. Please try again.");
    } finally {
      setIsResending(false);
    }

    // setSecondsRemaining(COUNTDOWN_SECONDS);
  };

  useEffect(() => {
    if (!isVerificationLink && isVerified) {
      navigate(`/verification/success/${activeUserId}`);
    }
  }, [isVerified, navigate, activeUserId, isVerificationLink]);

  useEffect(() => {
    const verifyEmailLink = async () => {
      if (!isVerificationLink || !queryUserId || !token) {
        return;
      }

      setIsVerifying(true);
      setVerificationError(null);

      try {
        await api.get("/api/auth/verify", {
          params: {
            userId: queryUserId,
            token,
          },
        });

        navigate(`/verification/success/${queryUserId}`, { replace: true });
      } catch (error) {
        console.error("Failed to verify email link:", error);
        setVerificationError(
          "The verification link is invalid or has expired. Please request a new email.",
        );
      } finally {
        setIsVerifying(false);
      }
    };

    verifyEmailLink();
  }, [isVerificationLink, navigate, queryUserId, token]);

  useEffect(() => {
    const initializeVerificationState = async () => {
      if (!verificationUserId || isVerificationLink) return;

      setIsLoading(true);
      try {
        const accountResponse = await api.get(
          `/api/auth/account/${verificationUserId}`,
        );
        setIsIDValid(accountResponse.data);

        const cooldownResponse = await api.get(
          `/api/auth/resend-cooldown/${verificationUserId}`,
        );
        const result = cooldownResponse.data;
        console.log("Cooldown seconds:", result.remainingSeconds);
        if (result.remainingSeconds <= 0) {
          setSecondsRemaining(0);
        } else {
          setSecondsRemaining(result.remainingSeconds);
        }
      } catch (error) {
        console.error("Failed to initialize verification state:", error);
        setIsIDValid(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeVerificationState();
  }, [verificationUserId, isVerificationLink]);

  console.log("Resend successful, fetching cooldown...", secondsRemaining);
  if (isVerificationLink && verificationError) {
    return (
      <div className="relative flex min-h-svh items-center justify-center bg-muted p-6 md:p-10">
        <div className="absolute right-4 top-4 md:right-6 md:top-6">
          <ModeToggle />
        </div>

        <div className="w-full max-w-md">
          <Card className="overflow-hidden border-border/60 shadow-lg shadow-black/5">
            <CardHeader className="space-y-3 text-center">
              <CardTitle className="text-2xl">Verification failed</CardTitle>
              <CardDescription className="text-base">
                {verificationError}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-center text-sm text-muted-foreground">
              <p>
                Try requesting a new verification email from the sign in page.
              </p>
              <Button asChild className="w-full">
                <a href="/authentication">Continue to sign in</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isVerificationLink) {
    return (
      <div className="relative flex min-h-svh items-center justify-center bg-muted p-6 md:p-10">
        <div className="absolute right-4 top-4 md:right-6 md:top-6">
          <ModeToggle />
        </div>

        <div className="w-full max-w-md">
          <Card className="overflow-hidden border-border/60 shadow-lg shadow-black/5">
            <CardHeader className="space-y-3 text-center">
              <CardTitle className="text-2xl">
                {isVerifying ? "Verifying your email" : "Checking link"}
              </CardTitle>
              <CardDescription className="text-base">
                We are confirming your account now. This only takes a moment.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-center text-sm text-muted-foreground">
              <p>
                {isVerifying
                  ? "Please keep this page open while we finish verification."
                  : "Redirecting you to the next step."}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isIDValid === false) {
    return (
      <div className="relative flex min-h-svh items-center justify-center bg-muted p-6 md:p-10">
        <div className="absolute right-4 top-4 md:right-6 md:top-6">
          <ModeToggle />
        </div>

        <div className="w-full max-w-md">
          <Card className="overflow-hidden border-border/60 shadow-lg shadow-black/5">
            <CardContent className="p-6 text-center text-sm text-muted-foreground">
              Verification session not found. Please sign up or sign in again.
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  return (
    <div className="relative flex min-h-svh items-center justify-center bg-muted p-6 md:p-10">
      <div className="absolute right-4 top-4 md:right-6 md:top-6">
        <ModeToggle />
      </div>

      <div className="w-full max-w-md">
        <Card className="overflow-hidden border-border/60 shadow-lg shadow-black/5">
          <CardHeader className="space-y-3 text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full border border-primary/15 bg-primary/5 text-primary">
              <svg
                viewBox="0 0 24 24"
                className="size-7"
                fill="none"
                aria-hidden
              >
                <path
                  d="M4.5 7.5L12 12.75L19.5 7.5M6.75 18.75H17.25C18.4926 18.75 19.5 17.7426 19.5 16.5V7.5C19.5 6.25736 18.4926 5.25 17.25 5.25H6.75C5.50736 5.25 4.5 6.25736 4.5 7.5V16.5C4.5 17.7426 5.50736 18.75 6.75 18.75Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="space-y-1">
              <CardTitle className="text-2xl">Check your email</CardTitle>
              <CardDescription className="text-base">
                We sent an activation link to your inbox. Click the link to
                verify your account.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="rounded-xl border border-border/70 bg-background/80 p-6 text-center">
              <p className="text-sm text-muted-foreground">
                Time left before you can resend
              </p>
              <div className="mt-4 font-mono text-5xl font-semibold tracking-[0.2em] text-foreground tabular-nums">
                {formatTime(secondsRemaining)}
              </div>
            </div>

            <div className="space-y-3">
              <Button
                type="button"
                className="w-full"
                onClick={handleResend}
                disabled={!canResend || isResending}
              >
                {isResending
                  ? "Sending..."
                  : canResend
                    ? "Resend activation email"
                    : "Resend available when timer ends"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                {canResend ? "You can request a new email now." : ""}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
