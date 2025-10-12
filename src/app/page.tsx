import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { DashboardLayout } from "./components/layout/dashboard-layout";
import { HomeContent } from "./home/components/home-content";
import { LandingPage } from "./components/landing/landing-page";

export default async function Home() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	// Show landing page for unauthenticated users
	if (!session) {
		return <LandingPage />;
	}

	// Show dashboard for authenticated users
	return (
		<DashboardLayout>
			<HomeContent />
		</DashboardLayout>
	);
}
