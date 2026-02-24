"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { JOB_CATEGORIES, JobListing } from "@/lib/types";

type JobBoardProps = {
  jobs: JobListing[];
};

export function JobBoard({ jobs }: JobBoardProps) {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const availableCategories = useMemo(() => {
    const teamsWithRoles = new Set(jobs.map((job) => job.team));
    return JOB_CATEGORIES.filter((category) => teamsWithRoles.has(category));
  }, [jobs]);

  useEffect(() => {
    if (activeCategory !== "All" && !availableCategories.includes(activeCategory as JobListing["team"])) {
      setActiveCategory("All");
    }
  }, [activeCategory, availableCategories]);

  const filteredJobs = useMemo(() => {
    if (activeCategory === "All") {
      return jobs;
    }
    return jobs.filter((job) => job.team === activeCategory);
  }, [activeCategory, jobs]);

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-3xl font-semibold tracking-tight text-foreground">
          Find open roles
        </h2>
        <p className="text-sm text-muted-foreground">
          {activeCategory === "All"
            ? `Showing all posted roles (${jobs.length} total).`
            : `Showing ${activeCategory} roles.`}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b pb-5">
        <Button
          variant={activeCategory === "All" ? "default" : "outline"}
          onClick={() => setActiveCategory("All")}
          className="h-9 rounded-full px-4"
        >
          All
        </Button>
        {availableCategories.map((category) => (
          <Button
            key={category}
            variant={activeCategory === category ? "default" : "outline"}
            onClick={() => setActiveCategory(category)}
            className="h-9 rounded-full px-4"
          >
            {category}
          </Button>
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <div className="rounded-lg border border-dashed px-6 py-16 text-center text-sm text-muted-foreground">
          No roles in this category right now.
        </div>
      )}

      {filteredJobs.length > 0 && (
        <div className="overflow-hidden rounded-xl border bg-background">
          <div className="hidden grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] gap-4 border-b bg-muted/40 px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground md:grid">
            <p>Role</p>
            <p>Team</p>
            <p>Location</p>
            <p>Type</p>
            <p aria-hidden />
          </div>

          <ul>
            {filteredJobs.map((job) => (
              <li key={job.id} className="border-b last:border-b-0">
                <Link
                  href={`/jobs/${job.id}`}
                  className="group grid gap-3 px-5 py-4 transition-colors hover:bg-muted/70 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] md:items-center"
                >
                  <div className="min-w-0">
                    <p className="text-base font-semibold text-foreground transition-colors group-hover:text-primary">
                      {job.title}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground md:hidden">
                      {job.team} • {job.location} • {job.type}
                    </p>
                  </div>
                  <p className="hidden text-sm text-muted-foreground md:block">
                    {job.team}
                  </p>
                  <p className="hidden text-sm text-muted-foreground md:block">
                    {job.location}
                  </p>
                  <p className="hidden text-sm text-muted-foreground md:block">
                    {job.type}
                  </p>
                  <ChevronRight className="hidden size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary md:block" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
