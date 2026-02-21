import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/server/admin-auth";
import { jobStore } from "@/lib/services";

type Params = {
  params: Promise<{ jobId: string }>;
};

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
