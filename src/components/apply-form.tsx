"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ApplyFormProps = {
  jobId: string;
  jobTitle: string;
};

const ACCEPTED_RESUME_TYPES = [".pdf", ".docx"];

export function ApplyForm({ jobId, jobTitle }: ApplyFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.append("jobId", jobId);
    formData.append("jobTitle", jobTitle);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
      // #region agent log
      fetch("http://127.0.0.1:7244/ingest/cb7a7420-6cbe-42cf-9e68-68cfb70269ce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          runId: "job-apply-debug",
          hypothesisId: "H5",
          location: "src/components/apply-form.tsx:40",
          message: "Client submit started",
          data: {
            jobId,
            jobTitleLength: jobTitle.length,
            resumeFieldPresent: formData.get("resume") instanceof File,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      const response = await fetch("/api/apply", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });
      // #region agent log
      fetch("http://127.0.0.1:7244/ingest/cb7a7420-6cbe-42cf-9e68-68cfb70269ce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          runId: "job-apply-debug",
          hypothesisId: "H5",
          location: "src/components/apply-form.tsx:51",
          message: "Client submit received response",
          data: {
            status: response.status,
            ok: response.ok,
            contentType: response.headers.get("content-type") ?? null,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion

      let payload: { message?: string; error?: string } = {};
      const isJsonResponse = response.headers
        .get("content-type")
        ?.includes("application/json");

      if (isJsonResponse) {
        payload = (await response.json()) as { message?: string; error?: string };
      }

      if (!response.ok) {
        setError(payload.error ?? "Unable to submit application right now.");
        return;
      }

      form.reset();
      setMessage(payload.message ?? "Submission successful.");
      router.refresh();
    } catch (error) {
      const details =
        error instanceof DOMException && error.name === "AbortError"
          ? "request timed out"
          : error instanceof Error
            ? error.message
            : "unknown network error";
      // #region agent log
      fetch("http://127.0.0.1:7244/ingest/cb7a7420-6cbe-42cf-9e68-68cfb70269ce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          runId: "job-apply-debug",
          hypothesisId: "H6",
          location: "src/components/apply-form.tsx:80",
          message: "Client submit failed before successful completion",
          data: {
            errorDetails: details,
            errorType:
              error instanceof DOMException
                ? error.name
                : error instanceof Error
                  ? "Error"
                  : typeof error,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      setError(`Unable to submit right now (${details}). Please try again.`);
    } finally {
      clearTimeout(timeoutId);
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Apply for {jobTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" name="fullName" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="currentCompany">Current company</Label>
            <Input id="currentCompany" name="currentCompany" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="currentLocation">Current location</Label>
            <Input id="currentLocation" name="currentLocation" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="roleInterest">
              Why are you interested in this role?
            </Label>
            <Textarea id="roleInterest" name="roleInterest" rows={5} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="resume">Resume (.pdf or .docx)</Label>
            <Input
              id="resume"
              name="resume"
              type="file"
              required
              accept={ACCEPTED_RESUME_TYPES.join(",")}
            />
          </div>

          {message && <p className="text-sm text-emerald-600">{message}</p>}
          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button disabled={isSubmitting} type="submit">
            {isSubmitting ? "Submitting..." : "Submit application"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
