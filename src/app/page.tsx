import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { DashboardLayout } from "./components/dashboard-layout";
import { HomePage } from "./components/home-page";
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
			<HomePage />
		</DashboardLayout>
	);
}
