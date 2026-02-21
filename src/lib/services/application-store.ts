import { JobApplication } from "@/lib/types";

export type CreateApplicationInput = Omit<JobApplication, "id" | "submittedAt">;

export interface ApplicationStore {
  add: (application: CreateApplicationInput) => Promise<JobApplication>;
  list: () => Promise<JobApplication[]>;
}
