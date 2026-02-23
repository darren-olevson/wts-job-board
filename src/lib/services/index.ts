import { localApplicationStore } from "@/lib/services/local-application-store";
import { localJobStore } from "@/lib/services/local-job-store";
import {
  googleApplicationStore,
  googleJobStore,
  isGoogleDriveConfigured,
} from "@/lib/services/google-stores";

const useGoogleDriveStore = isGoogleDriveConfigured();

// #region agent log
fetch("http://127.0.0.1:7244/ingest/cb7a7420-6cbe-42cf-9e68-68cfb70269ce", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    runId: "admin-create-job-debug",
    hypothesisId: "H1",
    location: "src/lib/services/index.ts:9",
    message: "Store selection at runtime",
    data: {
      useGoogleDriveStore,
      hasGoogleProjectId: Boolean(process.env.GOOGLE_PROJECT_ID),
      hasGoogleClientEmail: Boolean(process.env.GOOGLE_CLIENT_EMAIL),
      hasGooglePrivateKey: Boolean(process.env.GOOGLE_PRIVATE_KEY),
      hasGoogleDriveFolderId: Boolean(process.env.GOOGLE_DRIVE_FOLDER_ID),
    },
    timestamp: Date.now(),
  }),
}).catch(() => {});
// #endregion

export const jobStore = useGoogleDriveStore ? googleJobStore : localJobStore;
export const applicationStore = useGoogleDriveStore
  ? googleApplicationStore
  : localApplicationStore;
