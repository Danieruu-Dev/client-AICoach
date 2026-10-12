import api from "@/api/axios";

export interface TranscriptionResponse {
  text: string;
  lowConfidence: boolean;
}

// Temporary stand-in until the transcribe endpoint exists; set VITE_MOCK_TRANSCRIBE=true
const MOCK_TRANSCRIBE = import.meta.env.VITE_MOCK_TRANSCRIBE === "true";

const mockTranscribe = async (): Promise<TranscriptionResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return {
    text: "This is a mock transcript of the recorded answer. Replace it by turning off VITE_MOCK_TRANSCRIBE once the backend is ready.",
    lowConfidence: false,
  };
};

export const transcribeAnswer = async (
  sessionQuestionId: number,
  audio: Blob,
  durationSeconds: number,
) => {
  if (MOCK_TRANSCRIBE) return mockTranscribe();

  const formData = new FormData();
  formData.append(
    "audio",
    audio,
    `answer.${audio.type.includes("mp4") ? "mp4" : "webm"}`,
  );
  formData.append("sessionQuestionId", String(sessionQuestionId));
  formData.append("durationSeconds", String(durationSeconds));

  const { data } = await api.post<TranscriptionResponse>(
    "/api/interview-session/answers/transcribe",
    formData,
  );

  return data;
};
