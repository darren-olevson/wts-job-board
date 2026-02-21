import { localApplicationStore } from "@/lib/services/local-application-store";
import { localJobStore } from "@/lib/services/local-job-store";

export const jobStore = localJobStore;
export const applicationStore = localApplicationStore;
