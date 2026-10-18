// ids must match the server's CurrentStatus / CodingExperience enums.
// Shared by onboarding and the settings page.

export const currentStatusOptions = [
  { id: "STUDENT", name: "Student" },
  { id: "FRESH_GRADUATE", name: "Fresh Graduate" },
  { id: "CAREER_SHIFTER", name: "Career Shifter" },
  { id: "JUNIOR_DEVELOPER", name: "Junior Developer" },
  { id: "UNEMPLOYED", name: "Unemployed" },
  { id: "EMPLOYED_LOOKING", name: "Employed but Looking" },
];

export const codingExperienceOptions = [
  { id: "LESS_THAN_6_MONTHS", name: "Less than 6 months" },
  { id: "SIX_MONTHS_TO_1_YEAR", name: "6 months to 1 year" },
  { id: "ONE_TO_TWO_YEARS", name: "1 to 2 years" },
  { id: "TWO_TO_FOUR_YEARS", name: "2 to 4 years" },
  { id: "FOUR_PLUS_YEARS", name: "4+ years" },
];
