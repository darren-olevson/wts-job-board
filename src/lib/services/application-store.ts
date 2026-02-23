import { JobApplication } from "@/lib/types";

export type CreateApplicationInput = {
  jobId: string;
  jobTitle: string;
  fullName: string;
  email: string;
  currentCompany: string;
  currentLocation: string;
  referredBy?: string;
  roleInterest: string;
  resumeFileName: string;
  resumeFileSize: number;
  // Runtime-only fields used by storage implementations that persist actual files.
  resumeMimeType?: string;
  resumeBuffer?: Buffer;
};

export interface ApplicationStore {
  add: (application: CreateApplicationInput) => Promise<JobApplication>;
  list: () => Promise<JobApplication[]>;
}
