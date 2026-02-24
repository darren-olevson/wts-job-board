"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
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
      const response = await fetch("/api/apply", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

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
      setMessage(
        payload.message ??
          "Your submission was successful. If you are selected, someone from our team will contact you.",
      );
      router.refresh();
    } catch (error) {
      const details =
        error instanceof DOMException && error.name === "AbortError"
          ? "request timed out"
          : error instanceof Error
            ? error.message
            : "unknown network error";
      setError(`Unable to submit right now (${details}). Please try again.`);
    } finally {
      clearTimeout(timeoutId);
      setIsSubmitting(false);
    }
  }

  return (
    <section className="max-w-2xl space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Apply for {jobTitle}
        </h2>
        <p className="text-sm text-muted-foreground">
          Complete the application below and upload your resume.
        </p>
      </div>

      <form className="grid gap-4" onSubmit={handleSubmit}>
        <div className="grid gap-2">
          <Label htmlFor="fullName">Full name *</Label>
          <Input id="fullName" name="fullName" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email *</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="currentCompany">Current company *</Label>
          <Input id="currentCompany" name="currentCompany" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="currentLocation">Current location *</Label>
          <Input id="currentLocation" name="currentLocation" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="referredBy">Referred by</Label>
          <Input id="referredBy" name="referredBy" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="linkedinUrl">LinkedIn</Label>
          <Input
            id="linkedinUrl"
            name="linkedinUrl"
            type="url"
            placeholder="https://linkedin.com/in/username"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="githubUrl">GitHub</Label>
          <Input
            id="githubUrl"
            name="githubUrl"
            type="url"
            placeholder="https://github.com/username"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="portfolioUrl">Portfolio</Label>
          <Input
            id="portfolioUrl"
            name="portfolioUrl"
            type="url"
            placeholder="https://your-portfolio.com"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="roleInterest">Why are you interested in this role? *</Label>
          <Textarea id="roleInterest" name="roleInterest" rows={5} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="resume">Resume (.pdf or .docx) *</Label>
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
    </section>
  );
}
