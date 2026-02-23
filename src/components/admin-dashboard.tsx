"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { JOB_CATEGORIES, JobListing } from "@/lib/types";

type AdminDashboardProps = {
  jobs: JobListing[];
};

export function AdminDashboard({ jobs }: AdminDashboardProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function readApiError(response: Response, fallback: string) {
    try {
      const result = (await response.json()) as { error?: string };
      return result.error ?? fallback;
    } catch {
      return fallback;
    }
  }

  async function handleAddJob(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      title: String(formData.get("title") ?? ""),
      team: String(formData.get("team") ?? ""),
      type: String(formData.get("type") ?? ""),
      summary: String(formData.get("summary") ?? ""),
      description: String(formData.get("description") ?? ""),
    };

    try {
      const response = await fetch("/api/admin/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        setError(await readApiError(response, "Unable to create job."));
        return;
      }
      form.reset();
      router.refresh();
    } catch {
      setError("Unable to create job.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRemoveJob(jobId: string) {
    setError(null);
    try {
      const response = await fetch(`/api/admin/jobs/${jobId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        setError(await readApiError(response, "Unable to remove job."));
        return;
      }
      router.refresh();
    } catch {
      setError("Unable to remove job.");
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">Admin dashboard</h2>
        <Button variant="outline" onClick={logout}>
          Log out
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add new job</CardTitle>
          <CardDescription>Create a listing for the public board.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddJob} className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="team">Team</Label>
              <select
                id="team"
                name="team"
                required
                className="h-9 rounded-md border bg-transparent px-3 text-sm"
                defaultValue=""
              >
                <option value="" disabled>
                  Select team
                </option>
                {JOB_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Employment type</Label>
              <select
                id="type"
                name="type"
                required
                className="h-9 rounded-md border bg-transparent px-3 text-sm"
                defaultValue=""
              >
                <option value="" disabled>
                  Select type
                </option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
              </select>
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="summary">Summary</Label>
              <Input id="summary" name="summary" required />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                required
                rows={8}
                placeholder="Write the full job description that will appear in the Job Description tab."
              />
            </div>
            {error && <p className="text-sm text-destructive md:col-span-2">{error}</p>}
            <Button type="submit" disabled={isSaving} className="md:col-span-2">
              {isSaving ? "Saving..." : "Create listing"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing listings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4"
            >
              <div>
                <p className="font-medium">{job.title}</p>
                <p className="text-sm text-muted-foreground">
                  {job.team} • {job.location}
                </p>
              </div>
              <Button variant="destructive" onClick={() => handleRemoveJob(job.id)}>
                Remove
              </Button>
            </div>
          ))}
          {jobs.length === 0 && (
            <p className="text-sm text-muted-foreground">No jobs yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
