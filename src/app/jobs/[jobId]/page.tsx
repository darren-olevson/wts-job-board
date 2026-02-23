import { notFound } from "next/navigation";
import { ReactNode } from "react";

import { JobDetailLayout } from "@/components/job-detail-layout";
import { DEFAULT_ABOUT_WTS, LEGACY_ABOUT_WTS } from "@/lib/constants/about-wts";
import { jobStore } from "@/lib/services";

type JobDetailPageProps = {
  params: Promise<{ jobId: string }>;
};

const ABOUT_WTS_BULLET_LABELS = new Set([
  "High impact",
  "Cross-functional",
  "Practical builders",
  "Mission-driven",
  "High ownership, high impact",
  "Cross-functional by default",
]);

function renderAboutWts(aboutWts: string) {
  const lines = aboutWts
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const nodes: ReactNode[] = [];
  const bulletItems: Array<{ label: string; body: string }> = [];

  const flushBulletItems = () => {
    if (bulletItems.length === 0) {
      return;
    }
    nodes.push(
      <ul key={`list-${nodes.length}`} className="list-disc space-y-1 pl-6">
        {bulletItems.map((item, index) => (
          <li key={`${item.label}-${index}`}>
            <strong>{item.label}:</strong> {item.body}
          </li>
        ))}
      </ul>,
    );
    bulletItems.splice(0, bulletItems.length);
  };

  for (const line of lines) {
    const normalized = line.replace(/^[*-]\s*/, "");
    const markdownBulletMatch = normalized.match(/^\*\*(.+?)\*\*:\s*(.+)$/);
    if (markdownBulletMatch) {
      bulletItems.push({
        label: markdownBulletMatch[1],
        body: markdownBulletMatch[2],
      });
      continue;
    }

    const colonIndex = normalized.indexOf(":");
    if (colonIndex > 0) {
      const label = normalized.slice(0, colonIndex).trim();
      const body = normalized.slice(colonIndex + 1).trim();
      if (ABOUT_WTS_BULLET_LABELS.has(label) && body) {
        bulletItems.push({ label, body });
        continue;
      }
    }

    flushBulletItems();
    nodes.push(<p key={`p-${nodes.length}`}>{normalized}</p>);
  }

  flushBulletItems();
  return nodes;
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { jobId } = await params;
  const jobs = await jobStore.list();
  const job = jobs.find((item) => item.id === jobId);

  if (!job) {
    notFound();
  }

  const savedAboutWts = job.aboutWts?.trim() ?? "";
  const aboutWts =
    !savedAboutWts || savedAboutWts === LEGACY_ABOUT_WTS
      ? DEFAULT_ABOUT_WTS
      : savedAboutWts;
  const aboutTeam = job.aboutTeam?.trim() || job.summary?.trim() || "";
  const aboutRole = job.aboutRole?.trim() || job.description?.trim() || "";

  return (
    <JobDetailLayout job={job} activeTab="description">
      <article className="space-y-10 text-sm leading-7 text-foreground/90">
        <section className="space-y-3">
          <h3 className="text-2xl font-semibold text-foreground">About WTS</h3>
          <div className="space-y-4">{renderAboutWts(aboutWts)}</div>
        </section>

        <section className="space-y-3">
          <h3 className="text-2xl font-semibold text-foreground">About the Team</h3>
          <p className="whitespace-pre-line">{aboutTeam}</p>
        </section>

        <section className="space-y-3">
          <h3 className="text-2xl font-semibold text-foreground">About the Role</h3>
          <p className="whitespace-pre-line">{aboutRole}</p>
        </section>
      </article>
    </JobDetailLayout>
  );
}
