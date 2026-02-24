import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/server/admin-auth";
import { jobStore } from "@/lib/services";
import { JOB_CATEGORIES, JobListing } from "@/lib/types";

type Params = {
  params: Promise<{ jobId: string }>;
};

function isEmploymentType(
  value: string,
): value is JobListing["type"] {
  return ["Full-time", "Part-time", "Contract"].includes(value);
}

export async function PATCH(request: Request, { params }: Params) {
  const isAuthed = await isAdminAuthenticated();
  if (!isAuthed) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json()) as Record<string, string>;
  const title = String(body.title ?? "").trim();
  const team = String(body.team ?? "").trim();
  const type = String(body.type ?? "").trim();
  const aboutWts = String(body.aboutWts ?? "").trim();
  const aboutRole = String(body.aboutRole ?? "").trim();
  const location = "Remote";
  const { jobId } = await params;

  if (!title || !team || !type || !aboutWts || !aboutRole) {
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
    const updated = await jobStore.update(jobId, {
      title,
      team: team as (typeof JOB_CATEGORIES)[number],
      type,
      location,
      aboutWts,
      aboutTeam: "",
      aboutRole,
    });

    if (!updated) {
      return NextResponse.json({ error: "Job not found." }, { status: 404 });
    }

    return NextResponse.json({ job: updated });
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
      { error: "Unable to update job right now. Please try again." },
      { status: 500 },
    );
  }
}

export async function DELETE(_: Request, { params }: Params) {
  const isAuthed = await isAdminAuthenticated();
  if (!isAuthed) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { jobId } = await params;
  const removed = await jobStore.remove(jobId);
  if (!removed) {
    return NextResponse.json({ error: "Job not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
