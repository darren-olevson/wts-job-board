import { notFound } from "next/navigation";

import { ApplyForm } from "@/components/apply-form";
import { JobDetailLayout } from "@/components/job-detail-layout";
import { jobStore } from "@/lib/services";

type JobApplicationPageProps = {
  params: Promise<{ jobId: string }>;
};

export default async function JobApplicationPage({
  params,
}: JobApplicationPageProps) {
  const { jobId } = await params;
  const jobs = await jobStore.list();
  const job = jobs.find((item) => item.id === jobId);

  if (!job) {
    notFound();
  }

  return (
    <JobDetailLayout job={job} activeTab="application">
      <ApplyForm jobId={job.id} jobTitle={job.title} />
    </JobDetailLayout>
  );
}
