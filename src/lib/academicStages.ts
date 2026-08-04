export type AcademicStage =
  | "junior_secondary"
  | "senior_secondary"
  | "waec_candidate"
  | "jamb_candidate"
  | "undergraduate"
  | "graduate";

export type StageDefinition = {
  key: AcademicStage;
  label: string;
  description: string;
  /** which dashboard this stage lands on */
  dashboard: "core" | "campus";
};

export const ACADEMIC_STAGES: StageDefinition[] = [
  {
    key: "junior_secondary",
    label: "Junior Secondary",
    description: "JSS 1 – JSS 3",
    dashboard: "core",
  },
  {
    key: "senior_secondary",
    label: "Senior Secondary",
    description: "SS 1 – SS 3",
    dashboard: "core",
  },
  {
    key: "waec_candidate",
    label: "WAEC / NECO Candidate",
    description: "Writing O'Level this year",
    dashboard: "core",
  },
  {
    key: "jamb_candidate",
    label: "JAMB Candidate",
    description: "Seeking admission into a higher institution",
    dashboard: "core",
  },
  {
    key: "undergraduate",
    label: "Undergraduate",
    description: "University, polytechnic or college of education",
    dashboard: "campus",
  },
  {
    key: "graduate",
    label: "Graduate",
    description: "NYSC, job hunting or postgraduate",
    dashboard: "campus",
  },
];

export const stageLabel = (stage?: string | null) =>
  ACADEMIC_STAGES.find((s) => s.key === stage)?.label ?? "Not set";

export const isCampusStage = (stage?: string | null) =>
  stage === "undergraduate" || stage === "graduate";

export const STUDY_LEVELS = ["100", "200", "300", "400", "500", "600", "ND1", "ND2", "HND1", "HND2", "NCE", "Postgraduate"];
