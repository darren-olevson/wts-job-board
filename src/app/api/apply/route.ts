import { NextResponse } from "next/server";

import { applicationStore } from "@/lib/services";
import { sendApplicationNotification } from "@/lib/services/email-notifications";
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
    const referredBy = String(formData.get("referredBy") ?? "").trim();
    const linkedinUrl = String(formData.get("linkedinUrl") ?? "").trim();
    const githubUrl = String(formData.get("githubUrl") ?? "").trim();
    const portfolioUrl = String(formData.get("portfolioUrl") ?? "").trim();
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
      referredBy: referredBy || undefined,
      linkedinUrl: linkedinUrl || undefined,
      githubUrl: githubUrl || undefined,
      portfolioUrl: portfolioUrl || undefined,
      roleInterest,
      resumeFileName: resume.name,
      resumeFileSize: resume.size,
      resumeMimeType: resume.type || undefined,
      resumeBuffer,
    });

    await appendApplicationSubmissionRow(saved);
    await sendApplicationNotification(saved).catch(() => {});

    return NextResponse.json({
      message:
        "Your submission was successful. If you are selected, someone from our team will contact you.",
    });
  } catch (error) {
    console.error("Application submission failed", error);
    return NextResponse.json(
      { error: "Unable to submit application right now. Please try again." },
      { status: 500 },
    );
  }
}
