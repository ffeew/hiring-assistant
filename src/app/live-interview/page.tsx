import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/app/components/dashboard-layout";
import { LiveInterviewContent } from "./live-interview-content";

export default async function LiveInterviewPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <DashboardLayout>
      <LiveInterviewContent />
    </DashboardLayout>
  );
}