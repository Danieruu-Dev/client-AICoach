import api from "@/api/axios";

export interface TranscriptionResponse {
  text: string;
  lowConfidence: boolean;
}

export const transcribeAnswer = async (
  sessionQuestionId: number,
  audio: Blob,
  durationSeconds: number,
) => {
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
