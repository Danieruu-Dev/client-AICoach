import api from "@/api/axios";
import axios from "axios";

export interface SettingsProfile {
  displayName: string | null;
  bio: string | null;
  currentStatus: string | null;
  codingExperience: string | null;
}

export interface SettingsPreparationGoal {
  careerRole: string | null;
  targetIndustry: string | null;
  technologies: string[];
  careerGoal: string | null;
  hasUpcomingInterview: boolean;
  // yyyy-mm-dd
  interviewDate: string | null;
}

export interface Settings {
  account: { email: string; firstName: string | null; lastName: string | null };
  // null until onboarding is finished
  profile: SettingsProfile | null;
  preparationGoal: SettingsPreparationGoal | null;
  legal: {
    acceptedTermsVersion: string | null;
    acceptedPrivacyVersion: string | null;
    acceptedAt: string | null;
  };
}

export interface UpdateProfileRequest {
  displayName: string;
  bio: string;
  currentStatus: string;
  codingExperience: string;
}

export interface UpdateInterviewDateRequest {
  hasUpcomingInterview: boolean;
  interviewDate: string | null;
}

export const fetchSettings = async () =>
  (await api.get<Settings>("/api/settings")).data;

// Both updates return the full settings so the page cache can be replaced directly
export const updateProfile = async (request: UpdateProfileRequest) =>
  (await api.put<Settings>("/api/settings/profile", request)).data;

export const updateInterviewDate = async (request: UpdateInterviewDateRequest) =>
  (await api.put<Settings>("/api/settings/interview-date", request)).data;

// The server's ErrorResponse carries readable messages in `errors`
export function settingsErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as { errors?: string[] } | undefined)?.errors?.[0];
    if (message) return message;
  }
  return fallback;
}
