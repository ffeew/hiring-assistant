"use client";

import { DashboardLayout } from "@/app/components/dashboard-layout";
import { ProfilePageContent } from "./profile-page-content";

export default function ProfilePage() {
	return (
		<DashboardLayout>
			<ProfilePageContent />
		</DashboardLayout>
	);
}