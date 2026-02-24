import { JobListing } from "@/lib/types";

export interface JobStore {
  list: () => Promise<JobListing[]>;
  add: (job: Omit<JobListing, "id" | "postedAt">) => Promise<JobListing>;
  update: (
    jobId: string,
    job: Omit<JobListing, "id" | "postedAt">,
  ) => Promise<JobListing | null>;
  remove: (jobId: string) => Promise<boolean>;
}
