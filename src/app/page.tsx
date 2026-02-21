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
            Wedbush Technology Services (WTS) builds and runs the technology
            powering the next generation of B2B fintech. We partner with
            financial institutions and fintechs to launch and scale modern
            investing, banking, and money movement products--combining secure
            infrastructure, compliance-first operations, and product craft.
            Join us to build the future of fintech alongside a fast-moving
            team, shipping real products with real impact.
          </p>
        </section>

        <section className="space-y-4">
          <JobBoard jobs={jobs} />
        </section>
      </main>
    </div>
  );
}
