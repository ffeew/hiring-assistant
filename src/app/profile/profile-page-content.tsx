"use client";

import { useState } from "react";
import { useProfile as useProfileQuery } from "@/app/profile/queries/use-profile";
import { ProfileSettingsModal } from "@/app/components/profile-settings-modal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingSpinner } from "@/app/components/loading-spinner";
import { 
	User, 
	Mail, 
	Calendar, 
	Settings, 
	AlertCircle, 
	CheckCircle,
	Shield,
	Clock
} from "lucide-react";

export function ProfilePageContent() {
	const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
	const { data: profile, isLoading, error, refetch } = useProfileQuery();

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<LoadingSpinner />
			</div>
		);
	}

	if (error) {
		return (
			<Alert variant="destructive" className="max-w-2xl mx-auto">
				<AlertCircle className="h-4 w-4" />
				<AlertDescription>
					Failed to load profile information. Please try refreshing the page.
				</AlertDescription>
			</Alert>
		);
	}

	if (!profile) {
		return (
			<Alert variant="destructive" className="max-w-2xl mx-auto">
				<AlertCircle className="h-4 w-4" />
				<AlertDescription>
					Profile information not available.
				</AlertDescription>
			</Alert>
		);
	}

	const hasEmailConfiguration = !!(profile.gmailAddress && profile.gmailAppPassword);
	const isEmailConfigured = hasEmailConfiguration;

	const handleProfileUpdate = () => {
		refetch();
		setIsSettingsModalOpen(false);
	};

	return (
		<div className="max-w-4xl mx-auto space-y-6 p-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Profile Settings</h1>
					<p className="text-muted-foreground mt-1">
						Manage your account information and preferences
					</p>
				</div>
				<Button onClick={() => setIsSettingsModalOpen(true)}>
					<Settings className="h-4 w-4 mr-2" />
					Edit Profile
				</Button>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Left Column - Main Profile Info */}
				<div className="lg:col-span-2 space-y-6">
					{/* Basic Information */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<User className="h-5 w-5" />
								Basic Information
							</CardTitle>
							<CardDescription>
								Your personal account details
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div>
									<label className="text-sm font-medium text-muted-foreground">Name</label>
									<p className="mt-1 text-sm">{profile.name || "Not provided"}</p>
								</div>
								<div>
									<label className="text-sm font-medium text-muted-foreground">Email</label>
									<p className="mt-1 text-sm">{profile.email || "Not provided"}</p>
								</div>
							</div>
							<Separator />
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div>
									<label className="text-sm font-medium text-muted-foreground">Company</label>
									<p className="mt-1 text-sm">{profile.companyName || "Not provided"}</p>
								</div>
								<div>
									<label className="text-sm font-medium text-muted-foreground">Job Title</label>
									<p className="mt-1 text-sm">{profile.jobTitle || "Not provided"}</p>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Email Configuration */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Mail className="h-5 w-5" />
								Email Configuration
								{isEmailConfigured ? (
									<Badge variant="default" className="ml-2">
										<CheckCircle className="h-3 w-3 mr-1" />
										Configured
									</Badge>
								) : (
									<Badge variant="outline" className="ml-2">
										<AlertCircle className="h-3 w-3 mr-1" />
										Not Configured
									</Badge>
								)}
							</CardTitle>
							<CardDescription>
								Gmail configuration for sending automated emails to candidates
							</CardDescription>
						</CardHeader>
						<CardContent>
							{isEmailConfigured ? (
								<div className="space-y-3">
									<div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
										<div className="flex items-center gap-3">
											<CheckCircle className="h-5 w-5 text-green-600" />
											<div>
												<p className="text-sm font-medium">Email service is active</p>
												<p className="text-xs text-muted-foreground">
													Gmail: {profile.gmailAddress}
												</p>
											</div>
										</div>
									</div>
									<p className="text-sm text-muted-foreground">
										Your Gmail credentials are securely encrypted and ready to use for sending 
										automated emails to candidates.
									</p>
								</div>
							) : (
								<div className="space-y-3">
									<Alert>
										<AlertCircle className="h-4 w-4" />
										<AlertDescription>
											Email functionality is not available. Configure your Gmail address and 
											app password to enable automated email sending.
										</AlertDescription>
									</Alert>
									<Button 
										variant="outline" 
										onClick={() => setIsSettingsModalOpen(true)}
										className="w-full sm:w-auto"
									>
										<Settings className="h-4 w-4 mr-2" />
										Configure Email
									</Button>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Account Security */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Shield className="h-5 w-5" />
								Account Security
							</CardTitle>
							<CardDescription>
								Security and privacy settings for your account
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
								<div className="flex items-center gap-3">
									<Shield className="h-5 w-5 text-blue-600" />
									<div>
										<p className="text-sm font-medium">Data Encryption</p>
										<p className="text-xs text-muted-foreground">
											All sensitive data is encrypted at rest
										</p>
									</div>
								</div>
								<Badge variant="default">Active</Badge>
							</div>
							
							<div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
								<div className="flex items-center gap-3">
									<Mail className="h-5 w-5 text-green-600" />
									<div>
										<p className="text-sm font-medium">Gmail App Password</p>
										<p className="text-xs text-muted-foreground">
											{profile.gmailAppPassword ? 'Encrypted and stored securely' : 'Not configured'}
										</p>
									</div>
								</div>
								<Badge variant={profile.gmailAppPassword ? "default" : "outline"}>
									{profile.gmailAppPassword ? "Secured" : "Not Set"}
								</Badge>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Right Column - Quick Stats & Actions */}
				<div className="space-y-6">
					{/* Account Overview */}
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Account Overview</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
								<Calendar className="h-5 w-5 text-blue-600" />
								<div className="flex-1">
									<p className="text-sm font-medium">Member Since</p>
									<p className="text-xs text-muted-foreground">
										{profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "Unknown"}
									</p>
								</div>
							</div>

							<div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
								<Clock className="h-5 w-5 text-orange-600" />
								<div className="flex-1">
									<p className="text-sm font-medium">Last Updated</p>
									<p className="text-xs text-muted-foreground">
										{profile.updatedAt ? new Date(profile.updatedAt).toLocaleDateString() : "Never"}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Quick Actions */}
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Quick Actions</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<Button 
								variant="outline" 
								className="w-full justify-start"
								onClick={() => setIsSettingsModalOpen(true)}
							>
								<Settings className="h-4 w-4 mr-2" />
								Edit Profile
							</Button>
							
							<Button 
								variant="outline" 
								className="w-full justify-start"
								onClick={() => setIsSettingsModalOpen(true)}
							>
								<Mail className="h-4 w-4 mr-2" />
								{isEmailConfigured ? "Update Email Config" : "Setup Email"}
							</Button>

							<Separator />

							<div className="pt-2">
								<p className="text-xs text-muted-foreground mb-2">Profile Status</p>
								<div className="flex items-center gap-2">
									<div className={`h-2 w-2 rounded-full ${
										isEmailConfigured ? 'bg-green-500' : 'bg-yellow-500'
									}`} />
									<span className="text-xs">
										{isEmailConfigured ? 'Fully configured' : 'Needs email setup'}
									</span>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Help & Support */}
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Need Help?</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground mb-3">
								Having trouble with your profile or email configuration?
							</p>
							<Button variant="outline" size="sm" className="w-full" asChild>
								<a 
									href="https://support.google.com/accounts/answer/185833" 
									target="_blank" 
									rel="noopener noreferrer"
								>
									Gmail App Password Guide
								</a>
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Profile Settings Modal */}
			<ProfileSettingsModal
				isOpen={isSettingsModalOpen}
				onClose={() => setIsSettingsModalOpen(false)}
				user={{
					...profile,
					name: profile.name ?? '',
					emailVerified: profile.emailVerified ?? false
				}}
				onUpdate={handleProfileUpdate}
			/>
		</div>
	);
}