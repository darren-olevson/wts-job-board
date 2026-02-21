import { JobListing } from "@/lib/types";

export interface JobStore {
  list: () => Promise<JobListing[]>;
  add: (job: Omit<JobListing, "id" | "postedAt">) => Promise<JobListing>;
  remove: (jobId: string) => Promise<boolean>;
}
