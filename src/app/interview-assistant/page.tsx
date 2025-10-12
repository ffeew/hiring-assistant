import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/app/components/layout/dashboard-layout";
import { InterviewAssistantContent } from "./interview-assistant-content";

export default async function InterviewAssistantPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <DashboardLayout>
      <InterviewAssistantContent />
    </DashboardLayout>
  );
}