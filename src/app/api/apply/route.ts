import { NextResponse } from "next/server";

import { applicationStore } from "@/lib/services";

const ACCEPTED_EXTENSIONS = [".pdf", ".docx"];

function hasAllowedExtension(fileName: string) {
  const normalized = fileName.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => normalized.endsWith(ext));
}

export async function POST(request: Request) {
  const formData = await request.formData();

  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const roleInterest = String(formData.get("roleInterest") ?? "").trim();
  const jobId = String(formData.get("jobId") ?? "").trim();
  const jobTitle = String(formData.get("jobTitle") ?? "").trim();
  const resume = formData.get("resume");

  if (!fullName || !email || !roleInterest || !jobId || !jobTitle) {
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

  await applicationStore.add({
    jobId,
    jobTitle,
    fullName,
    email,
    roleInterest,
    resumeFileName: resume.name,
    resumeFileSize: resume.size,
  });

  return NextResponse.json({ message: "Submission successful." });
}
