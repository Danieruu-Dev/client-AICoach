import type { AudioRecorder } from "../hooks/useAudioRecorder";
import type { VoiceAnswer } from "../hooks/useVoiceAnswers";
import {
  AlertCircle,
  Loader2,
  Mic,
  RefreshCw,
  RotateCcw,
  Square,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const BAR_COUNT = 24;

const formatDuration = (totalSeconds: number) => {
  const seconds = Math.floor(totalSeconds);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
};

// Bars that move with the mic input, so the user can see they are being heard
function AudioLevelBars({ stream }: { stream: MediaStream }) {
  const barsRef = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    void audioContext.resume();

    const levels = new Uint8Array(analyser.frequencyBinCount);
    let frame = 0;

    // Writes straight to the DOM to avoid re-rendering on every frame
    const draw = () => {
      analyser.getByteFrequencyData(levels);
      barsRef.current.forEach((bar, index) => {
        if (!bar) return;
        bar.style.transform = `scaleY(${Math.max(0.08, levels[index] / 255)})`;
      });
      frame = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(frame);
      source.disconnect();
      void audioContext.close();
    };
  }, [stream]);

  return (
    <div className="flex h-12 items-center gap-1" aria-hidden="true">
      {Array.from({ length: BAR_COUNT }, (_, index) => (
        <span
          key={index}
          ref={(element) => {
            barsRef.current[index] = element;
          }}
          className="h-full w-1 scale-y-[0.08] rounded-full bg-destructive transition-transform duration-75"
        />
      ))}
    </div>
  );
}

function RecordingTimer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setSeconds((current) => current + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  return <span className="tabular-nums">{formatDuration(seconds)}</span>;
}

const secondaryButtonClass =
  "flex cursor-pointer items-center gap-2 rounded-sm border px-4 py-2 text-xs font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50";

interface VoiceAnswerPanelProps {
  textareaId: string;
  recorder: AudioRecorder;
  // The active question's recording and transcription state, if it has one
  voiceAnswer?: VoiceAnswer;
  answer: string;
  disabled?: boolean;
  onAnswerChange: (text: string) => void;
  onStartRecording: () => void;
  onRetry: () => void;
  onTypeInstead: () => void;
}

function VoiceAnswerPanel({
  textareaId,
  recorder,
  voiceAnswer,
  answer,
  disabled,
  onAnswerChange,
  onStartRecording,
  onRetry,
  onTypeInstead,
}: VoiceAnswerPanelProps) {
  const isMicBusy = recorder.status !== "idle";

  // Review: the transcript is back and can be edited or re-recorded
  if (!isMicBusy && voiceAnswer?.status === "done") {
    return (
      <div className="mt-3 flex min-h-0 flex-1 flex-col">
        {voiceAnswer.lowConfidence && (
          <p
            role="status"
            className="mb-2 flex items-center gap-1.5 rounded-sm border border-amber-400/50 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400"
          >
            <AlertCircle className="size-3.5 shrink-0" />
            We had trouble hearing parts of this. Check the text or re-record.
          </p>
        )}
        <textarea
          id={textareaId}
          disabled={disabled}
          value={answer}
          onChange={(event) => onAnswerChange(event.target.value)}
          placeholder="Your transcript appears here..."
          className="min-h-32 flex-1 resize-none rounded-sm border bg-background p-4 text-sm leading-6 outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/10"
        />
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <audio
            controls
            src={voiceAnswer.recording.url}
            className="h-9 min-w-48 flex-1"
          />
          <button
            type="button"
            onClick={onStartRecording}
            disabled={disabled}
            className={secondaryButtonClass}
          >
            <RotateCcw className="size-3.5" />
            Re-record
          </button>
          <p className="text-[11px] text-muted-foreground">
            {answer.length} characters
          </p>
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          This is what we heard. You can edit the text before submitting.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-3 flex min-h-56 flex-1 flex-col items-center justify-center gap-4 rounded-sm border border-dashed bg-muted/20 p-6 text-center">
      {recorder.status === "recording" && recorder.stream ? (
        <>
          <div
            role="status"
            className="flex items-center gap-2 text-sm font-semibold text-destructive"
          >
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-destructive opacity-75" />
              <span className="relative inline-flex size-2.5 rounded-full bg-destructive" />
            </span>
            Recording
            <RecordingTimer />
          </div>
          <AudioLevelBars stream={recorder.stream} />
          <button
            type="button"
            onClick={recorder.stop}
            aria-label="Stop recording"
            className="flex size-16 cursor-pointer items-center justify-center rounded-full bg-destructive text-white shadow-sm transition-transform hover:scale-105"
          >
            <Square className="size-6 fill-current" />
          </button>
          <p className="text-xs text-muted-foreground">
            The bars move when the mic hears you. Tap stop when you&apos;re done.
          </p>
        </>
      ) : !isMicBusy && voiceAnswer?.status === "transcribing" ? (
        <div role="status" className="flex flex-col items-center gap-3">
          <Loader2 className="size-9 animate-spin text-primary" />
          <div>
            <p className="text-sm font-semibold">Transcribing your answer...</p>
            <p className="mt-1 text-xs text-muted-foreground">
              You can move on to the next question while this finishes.
            </p>
          </div>
        </div>
      ) : !isMicBusy && voiceAnswer?.status === "error" ? (
        <>
          <div role="alert">
            <p className="flex items-center justify-center gap-1.5 text-sm font-semibold text-destructive">
              <AlertCircle className="size-4" />
              {voiceAnswer.error}
            </p>
            {answer.trim() && (
              <p className="mt-1 text-xs text-muted-foreground">
                Your earlier answer is still saved.
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={onRetry}
              disabled={disabled}
              className={secondaryButtonClass}
            >
              <RefreshCw className="size-3.5" />
              Try again
            </button>
            <button
              type="button"
              onClick={onStartRecording}
              disabled={disabled}
              className={secondaryButtonClass}
            >
              <RotateCcw className="size-3.5" />
              Re-record
            </button>
          </div>
          <button
            type="button"
            onClick={onTypeInstead}
            className="cursor-pointer text-xs font-medium underline underline-offset-2 hover:text-primary"
          >
            Type your answer instead
          </button>
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={onStartRecording}
            disabled={disabled || recorder.status === "requesting"}
            aria-label="Start recording"
            className={`flex size-16 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 ${recorder.status === "requesting" ? "animate-pulse" : ""}`}
          >
            <Mic className="size-7" />
          </button>
          <div role="status">
            <p className="text-sm font-semibold">
              {recorder.status === "requesting"
                ? "Waiting for microphone access..."
                : "Tap the mic to start speaking"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {recorder.status === "requesting"
                ? "Choose Allow in your browser's prompt."
                : "Answer out loud, like you would in a real interview."}
            </p>
          </div>
        </>
      )}

      {recorder.error && (
        <div role="alert" className="flex flex-col items-center gap-2">
          <p className="flex items-center gap-1.5 text-xs text-destructive">
            <AlertCircle className="size-3.5" />
            {recorder.error}
          </p>
          <button
            type="button"
            onClick={onTypeInstead}
            className="cursor-pointer text-xs font-medium underline underline-offset-2 hover:text-primary"
          >
            Type your answer instead
          </button>
        </div>
      )}
    </div>
  );
}

export default VoiceAnswerPanel;
