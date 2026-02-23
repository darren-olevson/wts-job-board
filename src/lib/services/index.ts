import { localApplicationStore } from "@/lib/services/local-application-store";
import { localJobStore } from "@/lib/services/local-job-store";
import {
  googleApplicationStore,
  googleJobStore,
  isGoogleDriveConfigured,
} from "@/lib/services/google-stores";

const useGoogleDriveStore = isGoogleDriveConfigured();

export const jobStore = useGoogleDriveStore ? googleJobStore : localJobStore;
export const applicationStore = useGoogleDriveStore
  ? googleApplicationStore
  : localApplicationStore;
