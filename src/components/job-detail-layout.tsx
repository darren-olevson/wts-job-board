import Link from "next/link";
import { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <main className="mx-auto min-h-screen max-w-4xl space-y-6 px-6 py-8">
      <Button asChild variant="outline">
        <Link href="/">Back to openings</Link>
      </Button>

      <Card className="overflow-hidden">
        <CardHeader className="space-y-4 border-b bg-card/40">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{job.team}</Badge>
              <Badge variant="outline">{job.type}</Badge>
              <Badge variant="outline">{job.location}</Badge>
            </div>
            <CardTitle className="text-2xl sm:text-3xl">{job.title}</CardTitle>
            <p className="text-sm text-muted-foreground">{job.summary}</p>
          </div>

          <div className="flex gap-2 border-b">
            <Link
              href={descriptionHref}
              className={`-mb-px border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
                activeTab === "description"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Job description
            </Link>
            <Link
              href={applicationHref}
              className={`-mb-px border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
                activeTab === "application"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Application
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-6">{children}</CardContent>
      </Card>
    </main>
  );
}
