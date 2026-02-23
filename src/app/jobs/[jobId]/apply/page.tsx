import { redirect } from "next/navigation";

type ApplyPageProps = {
  params: Promise<{ jobId: string }>;
};

export default async function ApplyPage({ params }: ApplyPageProps) {
  const { jobId } = await params;
  redirect(`/jobs/${jobId}/application`);
}
