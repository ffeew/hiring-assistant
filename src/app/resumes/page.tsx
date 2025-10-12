import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/app/components/layout/dashboard-layout";
import { ResumesContent } from "./resumes-content";

export default async function ResumesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <DashboardLayout>
      <ResumesContent />
    </DashboardLayout>
  );
}