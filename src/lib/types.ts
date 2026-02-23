export const JOB_CATEGORIES = [
  "Engineering",
  "Product Management",
  "Design",
  "Marketing",
  "Operations",
] as const;

export type JobCategory = (typeof JOB_CATEGORIES)[number];

export type JobListing = {
  id: string;
  title: string;
  team: JobCategory;
  location: string;
  type: "Full-time" | "Part-time" | "Contract";
  summary: string;
  description: string;
  postedAt: string;
};

export type JobApplication = {
  id: string;
  jobId: string;
  jobTitle: string;
  fullName: string;
  email: string;
  currentCompany: string;
  currentLocation: string;
  roleInterest: string;
  resumeFileName: string;
  resumeFileSize: number;
  submittedAt: string;
};
