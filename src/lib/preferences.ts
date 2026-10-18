// Per-browser preferences. Storage can be unavailable (private mode, blocked site data),
// so every read falls back to the default and every write is best-effort.

export type AnswerMode = "voice" | "text";

const ANSWER_MODE_KEY = "preparo-default-answer-mode";

export function getDefaultAnswerMode(): AnswerMode {
  try {
    return localStorage.getItem(ANSWER_MODE_KEY) === "text" ? "text" : "voice";
  } catch {
    return "voice";
  }
}

export function setDefaultAnswerMode(mode: AnswerMode) {
  try {
    localStorage.setItem(ANSWER_MODE_KEY, mode);
  } catch {
    // Preference just won't persist
  }
}
