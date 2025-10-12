import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/app/components/layout/dashboard-layout";
import { JobPostsContent } from "./components/job-posts-content";

export default async function JobPostsRoute() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		redirect("/login");
	}

	return (
		<DashboardLayout>
			<JobPostsContent />
		</DashboardLayout>
	);
}
