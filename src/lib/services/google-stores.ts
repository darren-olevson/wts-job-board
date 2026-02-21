import { ApplicationStore } from "@/lib/services/application-store";
import { JobStore } from "@/lib/services/job-store";

/**
 * Phase 2 hook:
 * Replace local stores with Google Drive + Google Sheets adapters.
 */
export const googleJobStore: JobStore = {
  async list() {
    throw new Error("TODO: Implement Google Sheets job listing sync.");
  },
  async add() {
    throw new Error("TODO: Implement Google Sheets job creation sync.");
  },
  async remove() {
    throw new Error("TODO: Implement Google Sheets job removal sync.");
  },
};

/**
 * Phase 2 hook:
 * Drive upload + Sheets append for applicant submissions.
 */
export const googleApplicationStore: ApplicationStore = {
  async add() {
    throw new Error(
      "TODO: Implement Drive upload and Sheets append for applications.",
    );
  },
  async list() {
    throw new Error("TODO: Implement Google Sheets submission listing.");
  },
};
