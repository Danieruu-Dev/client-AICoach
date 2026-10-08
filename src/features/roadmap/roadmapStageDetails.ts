export interface RoadmapStageDetails {
  description: string;
  goal: string;
  tips: string[];
}

const STAGE_DETAILS_BY_ORDER: Record<number, RoadmapStageDetails> = {
  1: {
    description:
      "Learn how to introduce your experience clearly and show why you are a strong match for the role.",
    goal:
      "Build a concise, confident career story that connects your background, motivation, and strengths to the opportunity.",
    tips: [
      "Prepare a 60–90 second introduction tailored to the role.",
      "Use specific examples when discussing your impact and motivation.",
      "Be ready to explain your availability, expectations, and next career step.",
    ],
  },
  2: {
    description:
      "Strengthen the engineering concepts and problem-solving habits expected in a technical interview.",
    goal:
      "Explain core engineering concepts accurately, reason through trade-offs, and communicate your approach step by step.",
    tips: [
      "Clarify assumptions before choosing a solution.",
      "Explain trade-offs instead of giving only the final answer.",
      "Connect theory to examples from systems you have built or maintained.",
    ],
  },
  3: {
    description:
      "Practice the technical scenarios, tools, and decisions that are most relevant to your target role.",
    goal:
      "Demonstrate role-specific depth by applying your knowledge to realistic problems and defending your technical choices.",
    tips: [
      "Review the technologies and responsibilities named in the job description.",
      "Structure answers around requirements, constraints, and trade-offs.",
      "Call out edge cases, testing, reliability, and security where relevant.",
    ],
  },
  4: {
    description:
      "Turn your project experience into clear stories about decisions, ownership, challenges, and measurable outcomes.",
    goal:
      "Lead an interviewer through a project in enough depth to show your individual contribution and engineering judgment.",
    tips: [
      "Choose a project where your personal contribution is easy to identify.",
      "Describe the problem, constraints, decisions, and results in a logical sequence.",
      "Prepare for follow-up questions about alternatives, failures, and lessons learned.",
    ],
  },
  5: {
    description:
      "Bring every part of your preparation together in a realistic end-to-end interview practice session.",
    goal:
      "Deliver clear, confident, and well-structured answers under interview conditions while managing your time effectively.",
    tips: [
      "Treat the session like the real interview and answer without notes.",
      "Pause briefly to organize your thoughts before responding.",
      "Review weak answers afterward and repeat them with a clearer structure.",
    ],
  },
};

const STAGE_ORDER_BY_CODE: Record<string, number> = {
  HR_SCREENING: 1,
  CORE_ENGINEERING_FUNDAMENTALS: 2,
  ROLE_SPECIFIC_INTERVIEW: 3,
  PROJECT_DEEP_DIVE: 4,
  MOCK_INTERVIEW: 5,
};

const normalizeStageCode = (value?: string) =>
  value?.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "_");

export function getRoadmapStageDetails(
  stageCode?: string,
  stageNumber?: number,
): RoadmapStageDetails {
  const normalizedCode = normalizeStageCode(stageCode);
  const order =
    (normalizedCode ? STAGE_ORDER_BY_CODE[normalizedCode] : undefined) ??
    stageNumber;

  return (
    (order ? STAGE_DETAILS_BY_ORDER[order] : undefined) ?? {
      description:
        "Prepare for this stage with focused practice and clear, structured answers.",
      goal:
        "Build the knowledge and confidence needed to complete this stage successfully.",
      tips: [
        "Read each question carefully before answering.",
        "Use specific examples to support your response.",
        "Review your answer and note one improvement for next time.",
      ],
    }
  );
}
