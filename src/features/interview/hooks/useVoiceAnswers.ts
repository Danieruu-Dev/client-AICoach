import { transcribeAnswer } from "../api/transcriptionApi";
import type { Recording } from "./useAudioRecorder";
import { useEffect, useRef, useState } from "react";

export type VoiceAnswerStatus = "transcribing" | "done" | "error";

export interface VoiceAnswer {
  status: VoiceAnswerStatus;
  recording: Recording;
  lowConfidence: boolean;
  error: string | null;
}

const MIN_DURATION_SECONDS = 1;

// Keeps one recording per question and transcribes it in the background.
// The transcript itself is handed to onTranscribed, so text has a single home.
export function useVoiceAnswers(
  onTranscribed: (sessionQuestionId: number, text: string) => void,
) {
  const [voiceAnswers, setVoiceAnswers] = useState<Record<number, VoiceAnswer>>({});

  const recordingsRef = useRef<Record<number, Recording>>({});
  // Latest attempt per question, so a slow response can't overwrite a newer recording
  const attemptsRef = useRef<Record<number, number>>({});
  const unmountedRef = useRef(false);

  const update = (sessionQuestionId: number, voiceAnswer: VoiceAnswer) => {
    setVoiceAnswers((current) => ({ ...current, [sessionQuestionId]: voiceAnswer }));
  };

  const transcribe = async (sessionQuestionId: number, recording: Recording) => {
    const attempt = (attemptsRef.current[sessionQuestionId] ?? 0) + 1;
    attemptsRef.current[sessionQuestionId] = attempt;
    const isStale = () =>
      unmountedRef.current || attemptsRef.current[sessionQuestionId] !== attempt;

    if (recording.durationSeconds < MIN_DURATION_SECONDS) {
      update(sessionQuestionId, {
        status: "error",
        recording,
        lowConfidence: false,
        error: "That recording was too short. Try again and speak a little longer.",
      });
      return;
    }

    update(sessionQuestionId, {
      status: "transcribing",
      recording,
      lowConfidence: false,
      error: null,
    });

    try {
      const result = await transcribeAnswer(
        sessionQuestionId,
        recording.blob,
        recording.durationSeconds,
      );
      if (isStale()) return;

      if (!result.text.trim()) {
        update(sessionQuestionId, {
          status: "error",
          recording,
          lowConfidence: false,
          error: "We couldn't hear any speech in that recording.",
        });
        return;
      }

      onTranscribed(sessionQuestionId, result.text);
      update(sessionQuestionId, {
        status: "done",
        recording,
        lowConfidence: result.lowConfidence,
        error: null,
      });
    } catch {
      if (isStale()) return;

      update(sessionQuestionId, {
        status: "error",
        recording,
        lowConfidence: false,
        error: "We couldn't transcribe that recording.",
      });
    }
  };

  // Replaces the question's recording and starts transcribing the new one
  const addRecording = (sessionQuestionId: number, recording: Recording) => {
    const previous = recordingsRef.current[sessionQuestionId];
    if (previous) URL.revokeObjectURL(previous.url);

    recordingsRef.current[sessionQuestionId] = recording;
    void transcribe(sessionQuestionId, recording);
  };

  const retry = (sessionQuestionId: number) => {
    const recording = recordingsRef.current[sessionQuestionId];
    if (recording) void transcribe(sessionQuestionId, recording);
  };

  useEffect(() => {
    unmountedRef.current = false;
    const recordings = recordingsRef.current;

    return () => {
      unmountedRef.current = true;
      Object.values(recordings).forEach((recording) =>
        URL.revokeObjectURL(recording.url),
      );
    };
  }, []);

  return { voiceAnswers, addRecording, retry };
}
