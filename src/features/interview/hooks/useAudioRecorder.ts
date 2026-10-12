import { useCallback, useEffect, useRef, useState } from "react";

export type RecorderStatus = "idle" | "requesting" | "recording";

export interface Recording {
  blob: Blob;
  // Object URL for local playback; whoever receives the recording must revoke it
  url: string;
  durationSeconds: number;
}

// Controls the mic only. Finished recordings are handed to the caller, not stored here.
export function useAudioRecorder() {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  // Live mic stream, exposed so the UI can draw an input level meter
  const [stream, setStream] = useState<MediaStream | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef(0);
  const unmountedRef = useRef(false);

  // Stops the mic so the browser's recording indicator turns off
  const releaseStream = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  const start = useCallback(async (onRecorded: (recording: Recording) => void) => {
    setError(null);

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError("Voice recording isn't supported in this browser.");
      return;
    }

    setStatus("requesting");

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = mediaStream;

      if (unmountedRef.current) {
        releaseStream();
        return;
      }

      // Safari doesn't support webm; let it pick its default (audio/mp4)
      const options = MediaRecorder.isTypeSupported("audio/webm")
        ? { mimeType: "audio/webm" }
        : undefined;
      const recorder = new MediaRecorder(mediaStream, options);

      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
        setStatus("idle");
        setStream(null);
        releaseStream();
        onRecorded({
          blob,
          url: URL.createObjectURL(blob),
          durationSeconds: (Date.now() - startedAtRef.current) / 1000,
        });
      };

      recorderRef.current = recorder;
      startedAtRef.current = Date.now();
      recorder.start();
      setStream(mediaStream);
      setStatus("recording");
    } catch (err) {
      releaseStream();
      setStream(null);
      setStatus("idle");
      setError(
        err instanceof DOMException && err.name === "NotAllowedError"
          ? "Microphone permission was denied."
          : "Couldn't access the microphone.",
      );
    }
  }, []);

  const stop = useCallback(() => {
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  }, []);

  useEffect(() => {
    unmountedRef.current = false;

    return () => {
      unmountedRef.current = true;
      // Drops a recording still in progress instead of delivering it after unmount
      if (recorderRef.current) recorderRef.current.onstop = null;
      releaseStream();
    };
  }, []);

  return { status, error, stream, start, stop };
}

export type AudioRecorder = ReturnType<typeof useAudioRecorder>;
