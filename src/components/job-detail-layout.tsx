import Link from "next/link";
import { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JobListing } from "@/lib/types";

type JobDetailLayoutProps = {
  job: JobListing;
  activeTab: "description" | "application";
  children: ReactNode;
};

export function JobDetailLayout({
  job,
  activeTab,
  children,
}: JobDetailLayoutProps) {
  const descriptionHref = `/jobs/${job.id}`;
  const applicationHref = `/jobs/${job.id}/application`;

  return (
    <main className="mx-auto min-h-screen max-w-5xl space-y-8 px-6 py-10">
      <Button asChild variant="outline">
        <Link href="/">Back to openings</Link>
      </Button>

      <section className="space-y-5 border-b pb-6">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{job.team}</Badge>
            <Badge variant="outline">{job.type}</Badge>
            <Badge variant="outline">{job.location}</Badge>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {job.title}
          </h1>
        </div>

        <div className="flex gap-6 border-b">
          <Link
            href={descriptionHref}
            className={`-mb-px border-b-2 px-1 pb-3 text-sm font-semibold transition-colors ${
              activeTab === "description"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Overview
          </Link>
          <Link
            href={applicationHref}
            className={`-mb-px border-b-2 px-1 pb-3 text-sm font-semibold transition-colors ${
              activeTab === "application"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Application
          </Link>
        </div>
      </section>

      <section className="pb-8">{children}</section>
    </main>
  );
}
