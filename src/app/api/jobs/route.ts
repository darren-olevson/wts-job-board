import { NextResponse } from "next/server";

import { jobStore } from "@/lib/services";

export async function GET() {
  const jobs = await jobStore.list();
  return NextResponse.json({ jobs });
}
