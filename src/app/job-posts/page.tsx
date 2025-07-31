import { JobPostsPage } from "@/app/components/job-posts/job-posts-page";
import { BackgroundPattern } from "@/app/components/background-pattern";

export default function JobPostsRoute() {
	return (
		<main className="min-h-screen bg-gradient-to-br from-background to-muted relative">
			<BackgroundPattern />
			<div className="relative z-10">
				<JobPostsPage />
			</div>
		</main>
	);
}
