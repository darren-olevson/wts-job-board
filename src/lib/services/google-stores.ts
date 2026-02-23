import { JWT } from "google-auth-library";
import { drive_v3, google } from "googleapis";

import { seedJobs } from "@/lib/data/jobs.seed";
import {
  ApplicationStore,
  CreateApplicationInput,
} from "@/lib/services/application-store";
import { JobStore } from "@/lib/services/job-store";
import { JobApplication, JobListing } from "@/lib/types";

/**
 * Google Drive-backed persistence for Vercel deployments.
 * Stores jobs and submissions as JSON files in a shared Drive folder.
 */
const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive";
const DEFAULT_JOBS_FILE_NAME = "jobs.json";
const DEFAULT_SUBMISSIONS_FILE_NAME = "submissions.json";

let cachedDriveClient: drive_v3.Drive | null = null;

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required Google env var: ${name}`);
  }
  return value;
}

function getAuthConfig() {
  const projectId = getRequiredEnv("GOOGLE_PROJECT_ID");
  const clientEmail = getRequiredEnv("GOOGLE_CLIENT_EMAIL");
  const privateKey = getRequiredEnv("GOOGLE_PRIVATE_KEY").replace(/\\n/g, "\n");
  const folderId = getRequiredEnv("GOOGLE_DRIVE_FOLDER_ID");

  return {
    projectId,
    clientEmail,
    privateKey,
    folderId,
  };
}

export function isGoogleDriveConfigured() {
  return Boolean(
    process.env.GOOGLE_PROJECT_ID &&
      process.env.GOOGLE_CLIENT_EMAIL &&
      process.env.GOOGLE_PRIVATE_KEY &&
      process.env.GOOGLE_DRIVE_FOLDER_ID,
  );
}

function getDrive() {
  if (cachedDriveClient) {
    return cachedDriveClient;
  }

  const { projectId, clientEmail, privateKey } = getAuthConfig();
  // #region agent log
  fetch("http://127.0.0.1:7244/ingest/cb7a7420-6cbe-42cf-9e68-68cfb70269ce", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      runId: "admin-create-job-debug",
      hypothesisId: "H2",
      location: "src/lib/services/google-stores.ts:58",
      message: "Initializing Google Drive client",
      data: {
        projectId,
        clientEmailDomain: clientEmail.split("@")[1] ?? "unknown",
        privateKeyLength: privateKey.length,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  const auth = new JWT({
    email: clientEmail,
    key: privateKey,
    scopes: [DRIVE_SCOPE],
    projectId,
  });

  cachedDriveClient = google.drive({
    version: "v3",
    auth,
  });

  return cachedDriveClient;
}

function getJobsFileName() {
  return process.env.GOOGLE_JOBS_FILE_NAME || DEFAULT_JOBS_FILE_NAME;
}

function getSubmissionsFileName() {
  return process.env.GOOGLE_SUBMISSIONS_FILE_NAME || DEFAULT_SUBMISSIONS_FILE_NAME;
}

async function findFileIdByName(fileName: string) {
  const drive = getDrive();
  const { folderId } = getAuthConfig();
  const escapedName = fileName.replace(/'/g, "\\'");
  const query = `'${folderId}' in parents and name='${escapedName}' and trashed=false`;

  const response = await drive.files.list({
    q: query,
    fields: "files(id,name)",
    includeItemsFromAllDrives: true,
    supportsAllDrives: true,
    pageSize: 1,
  });
  // #region agent log
  fetch("http://127.0.0.1:7244/ingest/cb7a7420-6cbe-42cf-9e68-68cfb70269ce", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      runId: "admin-create-job-debug",
      hypothesisId: "H3",
      location: "src/lib/services/google-stores.ts:95",
      message: "Drive file lookup completed",
      data: {
        fileName,
        folderIdPrefix: folderId.slice(0, 6),
        matches: response.data.files?.length ?? 0,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  return response.data.files?.[0]?.id ?? null;
}

async function createJsonFile<T>(fileName: string, data: T) {
  const drive = getDrive();
  const { folderId } = getAuthConfig();
  const json = JSON.stringify(data, null, 2);

  const response = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [folderId],
      mimeType: "application/json",
    },
    media: {
      mimeType: "application/json",
      body: Buffer.from(json, "utf-8"),
    },
    supportsAllDrives: true,
    fields: "id",
  });

  return response.data.id ?? null;
}

async function readJsonFile<T>(fileName: string, fallback: T): Promise<T> {
  const drive = getDrive();
  const fileId = await findFileIdByName(fileName);

  if (!fileId) {
    // #region agent log
    fetch("http://127.0.0.1:7244/ingest/cb7a7420-6cbe-42cf-9e68-68cfb70269ce", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        runId: "admin-create-job-debug",
        hypothesisId: "H3",
        location: "src/lib/services/google-stores.ts:127",
        message: "Drive JSON file missing, creating fallback file",
        data: { fileName },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    await createJsonFile(fileName, fallback);
    return fallback;
  }

  const response = await drive.files.get(
    {
      fileId,
      alt: "media",
      supportsAllDrives: true,
    },
    { responseType: "text" },
  );

  const raw = String(response.data ?? "");
  if (!raw.trim()) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJsonFile<T>(fileName: string, data: T): Promise<void> {
  const drive = getDrive();
  const json = JSON.stringify(data, null, 2);
  const existingId = await findFileIdByName(fileName);
  // #region agent log
  fetch("http://127.0.0.1:7244/ingest/cb7a7420-6cbe-42cf-9e68-68cfb70269ce", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      runId: "admin-create-job-debug",
      hypothesisId: "H5",
      location: "src/lib/services/google-stores.ts:156",
      message: "Persisting JSON file to Drive",
      data: {
        fileName,
        hasExistingId: Boolean(existingId),
        payloadSize: json.length,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  if (existingId) {
    await drive.files.update({
      fileId: existingId,
      media: {
        mimeType: "application/json",
        body: Buffer.from(json, "utf-8"),
      },
      supportsAllDrives: true,
    });
    return;
  }

  await createJsonFile(fileName, data);
}

function makeJobId(team: string, title: string) {
  const clean = `${team}-${title}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${clean}-${Date.now()}`;
}

function makeSubmissionId(jobId: string) {
  return `${jobId}-${Date.now()}`;
}

export const googleJobStore: JobStore = {
  async list() {
    const jobs = await readJsonFile<JobListing[]>(getJobsFileName(), seedJobs);
    return jobs.sort((a, b) => +new Date(b.postedAt) - +new Date(a.postedAt));
  },
  async add(job) {
    const jobs = await readJsonFile<JobListing[]>(getJobsFileName(), seedJobs);
    const nextJob: JobListing = {
      ...job,
      id: makeJobId(job.team, job.title),
      postedAt: new Date().toISOString(),
    };
    jobs.push(nextJob);
    await writeJsonFile(getJobsFileName(), jobs);
    return nextJob;
  },
  async remove(jobId) {
    const jobs = await readJsonFile<JobListing[]>(getJobsFileName(), seedJobs);
    const nextJobs = jobs.filter((job) => job.id !== jobId);
    const removed = nextJobs.length !== jobs.length;
    if (removed) {
      await writeJsonFile(getJobsFileName(), nextJobs);
    }
    return removed;
  },
};

export const googleApplicationStore: ApplicationStore = {
  async add(application: CreateApplicationInput): Promise<JobApplication> {
    const submissions = await readJsonFile<JobApplication[]>(
      getSubmissionsFileName(),
      [],
    );
    const next: JobApplication = {
      ...application,
      id: makeSubmissionId(application.jobId),
      submittedAt: new Date().toISOString(),
    };
    submissions.push(next);
    await writeJsonFile(getSubmissionsFileName(), submissions);
    return next;
  },
  async list() {
    const submissions = await readJsonFile<JobApplication[]>(
      getSubmissionsFileName(),
      [],
    );
    return submissions.sort(
      (a, b) => +new Date(b.submittedAt) - +new Date(a.submittedAt),
    );
  },
};
