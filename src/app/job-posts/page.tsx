import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/app/components/dashboard-layout";
import { JobPostsPage } from "@/app/components/job-posts/job-posts-page";

export default async function JobPostsRoute() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		redirect("/login");
	}

	return (
		<DashboardLayout>
			<JobPostsPage />
		</DashboardLayout>
	);
}
