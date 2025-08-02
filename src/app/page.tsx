import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardLayout } from "./components/dashboard-layout";
import { HomePage } from "./components/home-page";

export default async function Home() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		redirect("/login");
	}

	return (
		<DashboardLayout>
			<HomePage />
		</DashboardLayout>
	);
}
