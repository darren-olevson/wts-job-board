import {
  ApplicationStore,
  CreateApplicationInput,
} from "@/lib/services/application-store";
import { getSubmissions, saveSubmissions } from "@/lib/server/storage";
import { JobApplication } from "@/lib/types";

function createSubmissionId(jobId: string) {
  return `${jobId}-${Date.now()}`;
}

export const localApplicationStore: ApplicationStore = {
  async add(application: CreateApplicationInput): Promise<JobApplication> {
    const submissions = await getSubmissions();
    const next: JobApplication = {
      jobId: application.jobId,
      jobTitle: application.jobTitle,
      fullName: application.fullName,
      email: application.email,
      currentCompany: application.currentCompany,
      currentLocation: application.currentLocation,
      referredBy: application.referredBy,
      roleInterest: application.roleInterest,
      resumeFileName: application.resumeFileName,
      resumeFileSize: application.resumeFileSize,
      id: createSubmissionId(application.jobId),
      submittedAt: new Date().toISOString(),
    };
    submissions.push(next);
    await saveSubmissions(submissions);
    return next;
  },
  async list() {
    const submissions = await getSubmissions();
    return submissions.sort(
      (a, b) => +new Date(b.submittedAt) - +new Date(a.submittedAt),
    );
  },
};
