"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { JOB_CATEGORIES, JobListing } from "@/lib/types";

type JobBoardProps = {
  jobs: JobListing[];
};

function getRolePreview(job: JobListing) {
  const source = job.aboutRole || job.description || "";
  if (source.length <= 180) {
    return source;
  }
  return `${source.slice(0, 177)}...`;
}

function getRoleMeta(job: JobListing) {
  return [job.team, job.location, job.type].filter(Boolean).join(" • ");
}

export function JobBoard({ jobs }: JobBoardProps) {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const filteredJobs = useMemo(() => {
    if (activeCategory === "All") {
      return jobs;
    }
    return jobs.filter((job) => job.team === activeCategory);
  }, [activeCategory, jobs]);

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold">
          Current Openings ({filteredJobs.length})
        </h2>
        <p className="text-sm text-muted-foreground">
          {activeCategory === "All"
            ? `Showing all posted roles (${jobs.length} total).`
            : `Showing ${activeCategory} roles.`}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={activeCategory === "All" ? "default" : "outline"}
          onClick={() => setActiveCategory("All")}
          className="h-8"
        >
          All
        </Button>
        {JOB_CATEGORIES.map((category) => (
          <Button
            key={category}
            variant={activeCategory === category ? "default" : "outline"}
            onClick={() => setActiveCategory(category)}
            className="h-8"
          >
            {category}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filteredJobs.map((job) => (
          <Card key={job.id} className="border-l-4 border-l-primary">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-xl">{job.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{getRoleMeta(job)}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{getRolePreview(job)}</p>
              <Button asChild className="w-full">
                <Link href={`/jobs/${job.id}`}>View role</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <Card>
          <CardContent className="flex min-h-24 items-center justify-center text-sm text-muted-foreground">
            No roles in this category right now.
          </CardContent>
        </Card>
      )}
    </section>
  );
}
