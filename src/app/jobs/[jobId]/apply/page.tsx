import Link from "next/link";
import { notFound } from "next/navigation";

import { ApplyForm } from "@/components/apply-form";
import { Button } from "@/components/ui/button";
import { jobStore } from "@/lib/services";

type ApplyPageProps = {
  params: Promise<{ jobId: string }>;
};

export default async function ApplyPage({ params }: ApplyPageProps) {
  const { jobId } = await params;
  const jobs = await jobStore.list();
  const job = jobs.find((item) => item.id === jobId);

  if (!job) {
    notFound();
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl space-y-6 px-6 py-8">
      <Button asChild variant="outline">
        <Link href="/">Back to openings</Link>
      </Button>
      <ApplyForm jobId={job.id} jobTitle={job.title} />
    </main>
  );
}
