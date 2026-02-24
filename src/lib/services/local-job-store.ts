import { getJobs, saveJobs } from "@/lib/server/storage";
import { JobStore } from "@/lib/services/job-store";
import { JobListing } from "@/lib/types";

function makeId(team: string, title: string) {
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

export const localJobStore: JobStore = {
  async list() {
    const jobs = await getJobs();
    return jobs
      .map((job) => normalizeStoredJob(job as JobListing))
      .filter((job): job is JobListing => Boolean(job))
      .sort((a, b) => +new Date(b.postedAt) - +new Date(a.postedAt));
  },
  async add(job) {
    const jobs = await getJobs();
    const nextJob: JobListing = {
      ...job,
      id: makeId(job.team, job.title),
      postedAt: new Date().toISOString(),
    };
    jobs.push(nextJob);
    await saveJobs(jobs);
    return nextJob;
  },
  async update(jobId, job) {
    const jobs = await getJobs();
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
    await saveJobs(jobs);
    return updated;
  },
  async remove(jobId) {
    const jobs = await getJobs();
    const nextJobs = jobs.filter((job) => job.id !== jobId);
    const removed = nextJobs.length !== jobs.length;
    if (removed) {
      await saveJobs(nextJobs);
    }
    return removed;
  },
};
