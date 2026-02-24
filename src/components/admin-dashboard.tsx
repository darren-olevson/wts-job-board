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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DEFAULT_ABOUT_WTS } from "@/lib/constants/about-wts";
import { JOB_CATEGORIES, JobListing } from "@/lib/types";

type AdminDashboardProps = {
  jobs: JobListing[];
};

const EMPLOYMENT_TYPES: JobListing["type"][] = [
  "Full-time",
  "Part-time",
  "Contract",
];

type EditJobFormState = {
  id: string;
  title: string;
  team: JobListing["team"];
  type: JobListing["type"];
  aboutWts: string;
  aboutRole: string;
};

export function AdminDashboard({ jobs }: AdminDashboardProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [jobPendingEdit, setJobPendingEdit] = useState<EditJobFormState | null>(
    null,
  );
  const [jobPendingRemoval, setJobPendingRemoval] = useState<JobListing | null>(
    null,
  );

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
      aboutWts: String(formData.get("aboutWts") ?? ""),
      aboutRole: String(formData.get("aboutRole") ?? ""),
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
    setIsRemoving(true);
    try {
      const response = await fetch(`/api/admin/jobs/${jobId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        setError(await readApiError(response, "Unable to remove job."));
        return;
      }
      router.refresh();
      setJobPendingRemoval(null);
    } catch {
      setError("Unable to remove job.");
    } finally {
      setIsRemoving(false);
    }
  }

  function openEditDialog(job: JobListing) {
    setError(null);
    setJobPendingEdit({
      id: job.id,
      title: job.title,
      team: job.team,
      type: job.type,
      aboutWts: job.aboutWts || DEFAULT_ABOUT_WTS,
      aboutRole: job.aboutRole,
    });
  }

  async function handleUpdateJob(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!jobPendingEdit) {
      return;
    }
    setError(null);
    setIsUpdating(true);

    try {
      const response = await fetch(`/api/admin/jobs/${jobPendingEdit.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: jobPendingEdit.title,
          team: jobPendingEdit.team,
          type: jobPendingEdit.type,
          aboutWts: jobPendingEdit.aboutWts,
          aboutRole: jobPendingEdit.aboutRole,
        }),
      });

      if (!response.ok) {
        setError(await readApiError(response, "Unable to update job."));
        return;
      }

      setJobPendingEdit(null);
      router.refresh();
    } catch {
      setError("Unable to update job.");
    } finally {
      setIsUpdating(false);
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
              <Label htmlFor="aboutWts">About WTS</Label>
              <Textarea
                id="aboutWts"
                name="aboutWts"
                required
                rows={6}
                defaultValue={DEFAULT_ABOUT_WTS}
                placeholder="This section is pre-populated for all roles, but can be customized per listing."
              />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="aboutRole">About the Role</Label>
              <Textarea
                id="aboutRole"
                name="aboutRole"
                required
                rows={6}
                placeholder="Describe responsibilities, expectations, and what success looks like."
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
              <div className="ml-auto flex items-center gap-2">
                <Button onClick={() => openEditDialog(job)}>Edit</Button>
                <Button
                  variant="destructive"
                  onClick={() => setJobPendingRemoval(job)}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
          {jobs.length === 0 && (
            <p className="text-sm text-muted-foreground">No jobs yet.</p>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(jobPendingEdit)}
        onOpenChange={(open) => {
          if (!open && !isUpdating) {
            setJobPendingEdit(null);
          }
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit listing</DialogTitle>
            <DialogDescription>
              Update the role details and save your changes.
            </DialogDescription>
          </DialogHeader>
          {jobPendingEdit && (
            <form onSubmit={handleUpdateJob} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={jobPendingEdit.title}
                  onChange={(event) =>
                    setJobPendingEdit((prev) =>
                      prev
                        ? {
                            ...prev,
                            title: event.target.value,
                          }
                        : prev,
                    )
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-team">Team</Label>
                <select
                  id="edit-team"
                  className="h-9 rounded-md border bg-transparent px-3 text-sm"
                  value={jobPendingEdit.team}
                  onChange={(event) =>
                    setJobPendingEdit((prev) =>
                      prev
                        ? {
                            ...prev,
                            team: event.target.value as JobListing["team"],
                          }
                        : prev,
                    )
                  }
                >
                  {JOB_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-type">Employment type</Label>
                <select
                  id="edit-type"
                  className="h-9 rounded-md border bg-transparent px-3 text-sm"
                  value={jobPendingEdit.type}
                  onChange={(event) =>
                    setJobPendingEdit((prev) =>
                      prev
                        ? {
                            ...prev,
                            type: event.target.value as JobListing["type"],
                          }
                        : prev,
                    )
                  }
                >
                  {EMPLOYMENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-aboutWts">About WTS</Label>
                <Textarea
                  id="edit-aboutWts"
                  rows={6}
                  value={jobPendingEdit.aboutWts}
                  onChange={(event) =>
                    setJobPendingEdit((prev) =>
                      prev
                        ? {
                            ...prev,
                            aboutWts: event.target.value,
                          }
                        : prev,
                    )
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-aboutRole">About the Role</Label>
                <Textarea
                  id="edit-aboutRole"
                  rows={6}
                  value={jobPendingEdit.aboutRole}
                  onChange={(event) =>
                    setJobPendingEdit((prev) =>
                      prev
                        ? {
                            ...prev,
                            aboutRole: event.target.value,
                          }
                        : prev,
                    )
                  }
                  required
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isUpdating}
                  onClick={() => setJobPendingEdit(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? "Saving..." : "Save changes"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(jobPendingRemoval)}
        onOpenChange={(open) => {
          if (!open && !isRemoving) {
            setJobPendingRemoval(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove this role?</DialogTitle>
            <DialogDescription>
              {jobPendingRemoval
                ? `Are you sure you want to remove "${jobPendingRemoval.title}"? This action cannot be undone.`
                : "Are you sure you want to remove this role?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isRemoving}
              onClick={() => setJobPendingRemoval(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isRemoving || !jobPendingRemoval}
              onClick={() =>
                jobPendingRemoval
                  ? handleRemoveJob(jobPendingRemoval.id)
                  : undefined
              }
            >
              {isRemoving ? "Removing..." : "Remove role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
