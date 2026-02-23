import Link from "next/link";

import { JobBoard } from "@/components/job-board";
import { Button } from "@/components/ui/button";
import { jobStore } from "@/lib/services";

export default async function Home() {
  const jobs = await jobStore.list();

  return (
    <div className="min-h-screen">
      <header className="border-b bg-card/60 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <p className="text-lg font-semibold text-primary">WTS Careers</p>
          <Button variant="outline" asChild>
            <Link href="/admin">Login</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-6 py-8">
        <section className="rounded-xl border bg-gradient-to-br from-blue-600 to-indigo-600 p-8 text-white shadow-sm">
          <p className="mb-2 text-sm uppercase tracking-wide text-blue-100">
            About WTS
          </p>
          <h1 className="mb-4 text-3xl font-semibold sm:text-4xl">
            Build the future of logistics with us.
          </h1>
          <p className="max-w-3xl text-blue-50">
            At Wedbush Technology Services, we are building the cloud of
            finance: a modern, scalable platform that powers multi-asset
            investing, self-directed and advisory tools, wealth management
            workflows, and the next generation of financial products. Join us
            as we replace legacy systems with real-time, cloud-native
            infrastructure that lets builders move fast and shape the future of
            how money works.
          </p>
        </section>

        <section className="space-y-4">
          <JobBoard jobs={jobs} />
        </section>
      </main>
    </div>
  );
}
