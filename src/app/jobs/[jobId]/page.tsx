import { notFound } from "next/navigation";

import { JobDetailLayout } from "@/components/job-detail-layout";
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

  return (
    <JobDetailLayout job={job} activeTab="description">
      <article className="whitespace-pre-line text-sm leading-7 text-foreground/90">
        {job.description}
      </article>
    </JobDetailLayout>
  );
}
