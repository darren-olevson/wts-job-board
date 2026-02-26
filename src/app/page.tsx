import Link from "next/link";

import { JobBoard } from "@/components/job-board";
import { SwirlBackground } from "@/components/swirl-background";
import { Button } from "@/components/ui/button";
import { jobStore } from "@/lib/services";

export const dynamic = "force-dynamic";

export default async function Home() {
  const jobs = await jobStore.list();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <p className="text-lg font-semibold tracking-tight text-foreground">
            WTS Careers
          </p>
          <Button variant="outline" asChild>
            <Link href="/admin">Login</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-10 px-6 py-12">
        <section className="relative overflow-hidden border-b pb-8">
          <SwirlBackground />
          <div className="relative z-10 space-y-4">
            <p className="font-mono text-sm font-medium uppercase tracking-[0.18em] text-primary">
              Careers
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Open roles
            </h1>
            <p className="max-w-3xl text-base leading-7 text-muted-foreground">
              We're building a new kind of cloud-for-finance, the kind the
              platform that makes every fintech possible: banking, brokerage,
              crypto, and capital markets on a single, modern stack. If AWS gave
              every developer a data center, WTS gives every financial company an
              entire operational backbone. Come join us!
            </p>
          </div>
        </section>

        <JobBoard jobs={jobs} />
      </main>
    </div>
  );
}
