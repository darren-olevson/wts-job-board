import { JWT } from "google-auth-library";
import { drive_v3, google } from "googleapis";
import { Readable } from "node:stream";

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
      body: Readable.from(Buffer.from(json, "utf-8")),
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

  if (existingId) {
    await drive.files.update({
      fileId: existingId,
      media: {
        mimeType: "application/json",
        body: Readable.from(Buffer.from(json, "utf-8")),
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

function normalizeStoredJob(job: JobListing): JobListing | null {
  const legacyTeam = String((job as { team?: unknown }).team ?? "");
  if (legacyTeam === "Operations") {
    return null;
  }
  if (legacyTeam === "Product Management") {
    return {
      ...job,
      team: "Product",
    };
  }
  return job;
}

function makeSubmissionId(jobId: string) {
  return `${jobId}-${Date.now()}`;
}

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
}

async function uploadResumeToDrive(
  application: CreateApplicationInput,
): Promise<{ fileId: string; fileUrl: string } | null> {
  if (!application.resumeBuffer || application.resumeBuffer.length === 0) {
    return null;
  }

  const drive = getDrive();
  const { folderId } = getAuthConfig();
  const uploadedFileName = `${application.jobId}-${Date.now()}-${sanitizeFileName(application.resumeFileName)}`;

  const response = await drive.files.create({
    requestBody: {
      name: uploadedFileName,
      parents: [folderId],
      mimeType: application.resumeMimeType || "application/octet-stream",
    },
    media: {
      mimeType: application.resumeMimeType || "application/octet-stream",
      body: Readable.from(application.resumeBuffer),
    },
    supportsAllDrives: true,
    fields: "id",
  });

  const fileId = response.data.id;
  if (!fileId) {
    throw new Error("Drive upload succeeded without file id.");
  }

  return {
    fileId,
    fileUrl: `https://drive.google.com/file/d/${fileId}/view`,
  };
}

export const googleJobStore: JobStore = {
  async list() {
    const jobs = await readJsonFile<JobListing[]>(getJobsFileName(), seedJobs);
    return jobs
      .map((job) => normalizeStoredJob(job as JobListing))
      .filter((job): job is JobListing => Boolean(job))
      .sort((a, b) => +new Date(b.postedAt) - +new Date(a.postedAt));
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
  async update(jobId, job) {
    const jobs = await readJsonFile<JobListing[]>(getJobsFileName(), seedJobs);
    const index = jobs.findIndex((item) => item.id === jobId);
    if (index === -1) {
      return null;
    }
    const updated: JobListing = {
      ...jobs[index],
      ...job,
      id: jobs[index].id,
      postedAt: jobs[index].postedAt,
    };
    jobs[index] = updated;
    await writeJsonFile(getJobsFileName(), jobs);
    return updated;
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
    const resumeUpload = await uploadResumeToDrive(application);
    const submissions = await readJsonFile<JobApplication[]>(
      getSubmissionsFileName(),
      [],
    );
    const next: JobApplication = {
      jobId: application.jobId,
      jobTitle: application.jobTitle,
      fullName: application.fullName,
      email: application.email,
      currentCompany: application.currentCompany,
      currentLocation: application.currentLocation,
      referredBy: application.referredBy,
      linkedinUrl: application.linkedinUrl,
      githubUrl: application.githubUrl,
      portfolioUrl: application.portfolioUrl,
      roleInterest: application.roleInterest,
      resumeFileName: application.resumeFileName,
      resumeFileSize: application.resumeFileSize,
      resumeDriveFileId: resumeUpload?.fileId,
      resumeDriveFileUrl: resumeUpload?.fileUrl,
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
