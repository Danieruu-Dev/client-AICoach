import type { QueryClient } from "@tanstack/react-query";

// Cached data that changes when the user practices or edits their profile/goal.
// Cache entries stay fresh for a minute (see main.tsx), so saves must mark these
// as outdated, or screens keep showing the old numbers.
const PROGRESS_KEYS = [
  "dashboard-metrics",
  "recent-activity",
  "roadmap-summary",
  "roadmap-stages",
  "roadmap-profile",
  "completed-attempts",
  "interviewDetails",
];

// Screens on display reload right away; the rest reload when next opened
export function invalidateProgress(queryClient: QueryClient) {
  for (const key of PROGRESS_KEYS) {
    void queryClient.invalidateQueries({ queryKey: [key] });
  }
}
