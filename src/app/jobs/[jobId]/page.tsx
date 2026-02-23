import { notFound } from "next/navigation";

import { JobDetailLayout } from "@/components/job-detail-layout";
import { DEFAULT_ABOUT_WTS, LEGACY_ABOUT_WTS } from "@/lib/constants/about-wts";
import { jobStore } from "@/lib/services";

type JobDetailPageProps = {
  params: Promise<{ jobId: string }>;
};

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
          <p className="whitespace-pre-line">{aboutWts}</p>
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
