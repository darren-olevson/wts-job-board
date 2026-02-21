import Link from "next/link";

import { AdminDashboard } from "@/components/admin-dashboard";
import { AdminLoginForm } from "@/components/admin-login-form";
import { Button } from "@/components/ui/button";
import { isAdminAuthenticated } from "@/lib/server/admin-auth";
import { jobStore } from "@/lib/services";

export default async function AdminPage() {
  const authed = await isAdminAuthenticated();
  const jobs = authed ? await jobStore.list() : [];

  return (
    <main className="mx-auto min-h-screen max-w-4xl space-y-6 px-6 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">WTS Admin</h1>
        <Button variant="outline" asChild>
          <Link href="/">Back to board</Link>
        </Button>
      </div>

      {authed ? <AdminDashboard jobs={jobs} /> : <AdminLoginForm />}
    </main>
  );
}
