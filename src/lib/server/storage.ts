import { promises as fs } from "node:fs";
import path from "node:path";

import { seedJobs } from "@/lib/data/jobs.seed";
import { JobApplication, JobListing } from "@/lib/types";

const dataDir = path.join(process.cwd(), "data");
const jobsPath = path.join(dataDir, "jobs.json");
const submissionsPath = path.join(dataDir, "submissions.json");

async function ensureDataFiles() {
  await fs.mkdir(dataDir, { recursive: true });

  try {
    await fs.access(jobsPath);
  } catch {
    await fs.writeFile(jobsPath, JSON.stringify(seedJobs, null, 2), "utf-8");
  }

  try {
    await fs.access(submissionsPath);
  } catch {
    await fs.writeFile(submissionsPath, JSON.stringify([], null, 2), "utf-8");
  }
}

async function readJsonFile<T>(filePath: string): Promise<T> {
  await ensureDataFiles();
  const raw = await fs.readFile(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

async function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
  await ensureDataFiles();
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export async function getJobs(): Promise<JobListing[]> {
  return readJsonFile<JobListing[]>(jobsPath);
}

export async function saveJobs(jobs: JobListing[]): Promise<void> {
  await writeJsonFile(jobsPath, jobs);
}

export async function getSubmissions(): Promise<JobApplication[]> {
  return readJsonFile<JobApplication[]>(submissionsPath);
}

export async function saveSubmissions(submissions: JobApplication[]): Promise<void> {
  await writeJsonFile(submissionsPath, submissions);
}
