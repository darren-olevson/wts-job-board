import { NextResponse } from "next/server";

import { applicationStore, isGoogleDriveConfigured } from "@/lib/services";

const ACCEPTED_EXTENSIONS = [".pdf", ".docx"];

function hasAllowedExtension(fileName: string) {
  const normalized = fileName.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => normalized.endsWith(ext));
}

export async function POST(request: Request) {
  try {
    const usingGoogleStore = isGoogleDriveConfigured();
    const formData = await request.formData();

    const fullName = String(formData.get("fullName") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const currentCompany = String(formData.get("currentCompany") ?? "").trim();
    const currentLocation = String(formData.get("currentLocation") ?? "").trim();
    const roleInterest = String(formData.get("roleInterest") ?? "").trim();
    const jobId = String(formData.get("jobId") ?? "").trim();
    const jobTitle = String(formData.get("jobTitle") ?? "").trim();
    const resume = formData.get("resume");
    // #region agent log
    fetch("http://127.0.0.1:7244/ingest/cb7a7420-6cbe-42cf-9e68-68cfb70269ce", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        runId: "job-apply-debug",
        hypothesisId: "H3",
        location: "src/app/api/apply/route.ts:24",
        message: "Apply route parsed form payload",
        data: {
          hasFullName: Boolean(fullName),
          hasEmail: Boolean(email),
          hasCurrentCompany: Boolean(currentCompany),
          hasCurrentLocation: Boolean(currentLocation),
          hasRoleInterest: Boolean(roleInterest),
          hasJobId: Boolean(jobId),
          hasJobTitle: Boolean(jobTitle),
          resumeIsFile: resume instanceof File,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

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
    // #region agent log
    fetch("http://127.0.0.1:7244/ingest/cb7a7420-6cbe-42cf-9e68-68cfb70269ce", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        runId: "job-apply-debug",
        hypothesisId: "H4",
        location: "src/app/api/apply/route.ts:50",
        message: "Resume file received and inspected",
        data: {
          resumeName: resume.name,
          resumeSize: resume.size,
          allowedExtension: hasAllowedExtension(resume.name),
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    if (!hasAllowedExtension(resume.name)) {
      return NextResponse.json(
        { error: "Resume must be a PDF or DOCX file." },
        { status: 400 },
      );
    }

    const resumeBuffer = Buffer.from(await resume.arrayBuffer());

    // #region agent log
    fetch("http://127.0.0.1:7244/ingest/cb7a7420-6cbe-42cf-9e68-68cfb70269ce", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        runId: "job-apply-debug",
        hypothesisId: "H1",
        location: "src/app/api/apply/route.ts:64",
        message: "About to persist application via configured store",
        data: {
          jobId,
          jobTitleLength: jobTitle.length,
          resumeSize: resume.size,
          resumeMimeType: resume.type || null,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
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

    console.info("[apply-route] submission persisted", {
      hypothesisId: "H9",
      usingGoogleStore,
      resumeSize: resume.size,
      resumeFileName: resume.name,
      hasResumeDriveFileId:
        typeof saved.resumeDriveFileId === "string" &&
        saved.resumeDriveFileId.length > 0,
      resumeDriveFileId: saved.resumeDriveFileId ?? null,
      resumeDriveFileUrl: saved.resumeDriveFileUrl ?? null,
    });

    return NextResponse.json({ message: "Submission successful." });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorCode =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      typeof (error as { code?: unknown }).code === "string"
        ? (error as { code: string }).code
        : undefined;
    // #region agent log
    fetch("http://127.0.0.1:7244/ingest/cb7a7420-6cbe-42cf-9e68-68cfb70269ce", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        runId: "job-apply-debug",
        hypothesisId: "H2",
        location: "src/app/api/apply/route.ts:86",
        message: "Apply route failed",
        data: {
          errorCode: errorCode ?? null,
          errorMessage,
        },
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
