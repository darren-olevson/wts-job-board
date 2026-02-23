import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/server/admin-auth";
import { jobStore } from "@/lib/services";
import { JOB_CATEGORIES, JobListing } from "@/lib/types";

function isEmploymentType(
  value: string,
): value is JobListing["type"] {
  return ["Full-time", "Part-time", "Contract"].includes(value);
}

export async function POST(request: Request) {
  const isAuthed = await isAdminAuthenticated();
  // #region agent log
  fetch("http://127.0.0.1:7244/ingest/cb7a7420-6cbe-42cf-9e68-68cfb70269ce", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      runId: "admin-create-job-debug",
      hypothesisId: "H4",
      location: "src/app/api/admin/jobs/route.ts:14",
      message: "Admin create route entered",
      data: { isAuthed },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  if (!isAuthed) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json()) as Record<string, string>;
  const title = String(body.title ?? "").trim();
  const team = String(body.team ?? "").trim();
  const type = String(body.type ?? "").trim();
  const summary = String(body.summary ?? "").trim();
  const description = String(body.description ?? "").trim();
  const location = "Remote";

  if (!title || !team || !type || !summary || !description) {
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
    // #region agent log
    fetch(
      "http://127.0.0.1:7244/ingest/cb7a7420-6cbe-42cf-9e68-68cfb70269ce",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          runId: "admin-create-job-debug",
          hypothesisId: "H1",
          location: "src/app/api/admin/jobs/route.ts:46",
          message: "About to add job via configured store",
          data: {
            team,
            type,
            titleLength: title.length,
            summaryLength: summary.length,
            descriptionLength: description.length,
          },
          timestamp: Date.now(),
        }),
      },
    ).catch(() => {});
    // #endregion
    const job = await jobStore.add({
      title,
      team: team as (typeof JOB_CATEGORIES)[number],
      location,
      type,
      summary,
      description,
    });
    return NextResponse.json({ job });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorCode =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      typeof (error as { code?: unknown }).code === "string"
        ? (error as { code: string }).code
        : undefined;
    const errorStatus =
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      typeof (error as { status?: unknown }).status === "number"
        ? (error as { status: number }).status
        : undefined;

    // #region agent log
    fetch("http://127.0.0.1:7244/ingest/cb7a7420-6cbe-42cf-9e68-68cfb70269ce", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        runId: "admin-create-job-debug",
        hypothesisId: "H2",
        location: "src/app/api/admin/jobs/route.ts:63",
        message: "Job create failed in store",
        data: {
          errorCode: errorCode ?? null,
          errorStatus: errorStatus ?? null,
          errorMessage,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

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
