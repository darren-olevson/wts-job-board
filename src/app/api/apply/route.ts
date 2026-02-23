import { NextResponse } from "next/server";

import { applicationStore } from "@/lib/services";
import { appendApplicationSubmissionRow } from "@/lib/services/google-sheets-tracker";

const ACCEPTED_EXTENSIONS = [".pdf", ".docx"];

function hasAllowedExtension(fileName: string) {
  const normalized = fileName.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => normalized.endsWith(ext));
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const fullName = String(formData.get("fullName") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const currentCompany = String(formData.get("currentCompany") ?? "").trim();
    const currentLocation = String(formData.get("currentLocation") ?? "").trim();
    const roleInterest = String(formData.get("roleInterest") ?? "").trim();
    const jobId = String(formData.get("jobId") ?? "").trim();
    const jobTitle = String(formData.get("jobTitle") ?? "").trim();
    const resume = formData.get("resume");

    if (
      !fullName ||
      !email ||
      !currentCompany ||
      !currentLocation ||
      !roleInterest ||
      !jobId ||
      !jobTitle
    ) {
      return NextResponse.json(
        { error: "Please complete all required fields." },
        { status: 400 },
      );
    }

    if (!(resume instanceof File) || resume.size === 0) {
      return NextResponse.json(
        { error: "Please upload a resume file." },
        { status: 400 },
      );
    }

    if (!hasAllowedExtension(resume.name)) {
      return NextResponse.json(
        { error: "Resume must be a PDF or DOCX file." },
        { status: 400 },
      );
    }

    const resumeBuffer = Buffer.from(await resume.arrayBuffer());
    const saved = await applicationStore.add({
      jobId,
      jobTitle,
      fullName,
      email,
      currentCompany,
      currentLocation,
      roleInterest,
      resumeFileName: resume.name,
      resumeFileSize: resume.size,
      resumeMimeType: resume.type || undefined,
      resumeBuffer,
    });

    await appendApplicationSubmissionRow(saved);

    return NextResponse.json({ message: "Submission successful." });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    // #region agent log
    fetch("http://127.0.0.1:7244/ingest/cb7a7420-6cbe-42cf-9e68-68cfb70269ce", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        runId: "sheets-tracker-debug",
        hypothesisId: "H5",
        location: "src/app/api/apply/route.ts:74",
        message: "Apply route failed while persisting submission",
        data: { errorMessage: message },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    console.error("Application submission failed", error);
    return NextResponse.json(
      { error: "Unable to submit application right now. Please try again." },
      { status: 500 },
    );
  }
}
