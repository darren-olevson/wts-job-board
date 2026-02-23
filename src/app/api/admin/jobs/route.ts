import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/server/admin-auth";
import { jobStore } from "@/lib/services";
import { JOB_CATEGORIES, JobListing } from "@/lib/types";

const DEFAULT_ABOUT_WTS =
  "WTS builds the operational and technology backbone that powers modern fintech. We partner with product, engineering, compliance, and operations teams to launch and scale financial products-turning complex workflows (accounts, money movement, reconciliation, reporting, risk) into reliable platforms and tools.\n\n**We move fast, sweat the details, and build systems that are secure and built to last.**\n\n**What it's like to work here**\n\n**High ownership, high impact:** Small teams, real responsibility, measurable outcomes\n**Cross-functional by default:** Frequent collaboration with engineering, ops, and business stakeholders\n**Practical builders:** We favor solutions that are simple, scalable, and easy to operate\n**Mission-driven:** We help bring better financial products to market-safely and efficiently";

function isEmploymentType(
  value: string,
): value is JobListing["type"] {
  return ["Full-time", "Part-time", "Contract"].includes(value);
}

export async function POST(request: Request) {
  const isAuthed = await isAdminAuthenticated();
  if (!isAuthed) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json()) as Record<string, string>;
  const title = String(body.title ?? "").trim();
  const team = String(body.team ?? "").trim();
  const type = String(body.type ?? "").trim();
  const aboutWts = String(body.aboutWts ?? "").trim() || DEFAULT_ABOUT_WTS;
  const aboutTeam = String(body.aboutTeam ?? "").trim();
  const aboutRole = String(body.aboutRole ?? "").trim();
  const location = "Remote";

  if (!title || !team || !type || !aboutTeam || !aboutRole) {
    return NextResponse.json(
      { error: "All fields are required." },
      { status: 400 },
    );
  }

  if (!JOB_CATEGORIES.includes(team as (typeof JOB_CATEGORIES)[number])) {
    return NextResponse.json({ error: "Invalid team." }, { status: 400 });
  }

  if (!isEmploymentType(type)) {
    return NextResponse.json(
      { error: "Invalid employment type." },
      { status: 400 },
    );
  }

  try {
    const job = await jobStore.add({
      title,
      team: team as (typeof JOB_CATEGORIES)[number],
      location,
      type,
      aboutWts,
      aboutTeam,
      aboutRole,
    });
    return NextResponse.json({ job });
  } catch (error) {
    const errorCode =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      typeof (error as { code?: unknown }).code === "string"
        ? (error as { code: string }).code
        : undefined;

    if (errorCode === "EROFS" || errorCode === "EPERM") {
      return NextResponse.json(
        {
          error:
            "Job storage is read-only in this environment. Use persistent storage (DB/KV) or run locally.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { error: "Unable to save job right now. Please try again." },
      { status: 500 },
    );
  }
}
