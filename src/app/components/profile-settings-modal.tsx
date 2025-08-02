"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Session } from "@/lib/auth";
import { useUpdateProfileMutation } from "@/app/hooks/use-api-mutations";
import type { ProfileUpdateData } from "@/app/types";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Mail, Building, AlertCircle, CheckCircle, X } from "lucide-react";

type User = Session["user"];

const profileSchema = z.object({
	gmailAddress: z.string().email("Please enter a valid email address"),
	gmailAppPassword: z.string().min(1, "App password is required"),
	companyName: z.string().optional(),
	jobTitle: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileSettingsModalProps {
	isOpen: boolean;
	onClose: () => void;
	user: User;
	onUpdate: (updatedUser: User) => void;
}

export function ProfileSettingsModal({
	isOpen,
	onClose,
	user,
	onUpdate,
}: ProfileSettingsModalProps) {
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	// React Query mutation
	const updateProfileMutation = useUpdateProfileMutation();

	const form = useForm<ProfileFormData>({
		resolver: zodResolver(profileSchema),
		defaultValues: {
			gmailAddress: user.gmailAddress || "",
			gmailAppPassword: "",
			companyName: user.companyName || "",
			jobTitle: user.jobTitle || "",
		},
	});

	useEffect(() => {
		if (isOpen) {
			form.reset({
				gmailAddress: user.gmailAddress || "",
				gmailAppPassword: user.gmailAppPassword === "****" ? "" : user.gmailAppPassword || "",
				companyName: user.companyName || "",
				jobTitle: user.jobTitle || "",
			});
			setError("");
			setSuccess("");
		}
	}, [isOpen, user, form]);

	const onSubmit = async (data: ProfileFormData) => {
		setError("");
		setSuccess("");

		try {
			const payload: ProfileUpdateData = {
				gmailAddress: data.gmailAddress,
				gmailAppPassword: data.gmailAppPassword,
				companyName: data.companyName || undefined,
				jobTitle: data.jobTitle || undefined,
			};

			const updatedUser = await updateProfileMutation.mutateAsync(payload);
			onUpdate(updatedUser as User);
			setSuccess("Profile updated successfully!");
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<User className="h-5 w-5" />
						Profile Settings
					</DialogTitle>
					<DialogDescription>
						Update your email configuration and company details
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						{/* Email Configuration Section */}
						<div className="space-y-4">
							<div className="space-y-2">
								<h3 className="text-lg font-medium flex items-center gap-2">
									<Mail className="h-4 w-4" />
									Email Configuration
								</h3>
								<Separator />
							</div>

							<FormField
								control={form.control}
								name="gmailAddress"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Gmail Address *</FormLabel>
										<FormControl>
											<Input
												placeholder="your.email@gmail.com"
												type="email"
												disabled={updateProfileMutation.isPending}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="gmailAppPassword"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Gmail App Password *</FormLabel>
										<FormControl>
											<Input
												placeholder="16-character app password"
												type="password"
												disabled={updateProfileMutation.isPending}
												{...field}
											/>
										</FormControl>
										<p className="text-xs text-muted-foreground">
											Generate an app password in your Google Account settings. Your
											password is encrypted and stored securely.
										</p>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						{/* Company Details Section */}
						<div className="space-y-4">
							<div className="space-y-2">
								<h3 className="text-lg font-medium flex items-center gap-2">
									<Building className="h-4 w-4" />
									Company Details
								</h3>
								<Separator />
							</div>

							<FormField
								control={form.control}
								name="companyName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Company Name</FormLabel>
										<FormControl>
											<Input
												placeholder="Your Company Name"
												disabled={updateProfileMutation.isPending}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="jobTitle"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Your Job Title</FormLabel>
										<FormControl>
											<Input
												placeholder="Hiring Manager, HR Director, etc."
												disabled={updateProfileMutation.isPending}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						{/* Error and Success Messages */}
						{error && (
							<Alert variant="destructive">
								<AlertCircle className="h-4 w-4" />
								<AlertDescription>{error}</AlertDescription>
							</Alert>
						)}

						{success && (
							<Alert className="border-green-500/20 bg-green-500/10">
								<CheckCircle className="h-4 w-4 text-green-600" />
								<AlertDescription className="text-green-600">{success}</AlertDescription>
							</Alert>
						)}

						{/* Action Buttons */}
						<div className="flex items-center justify-end gap-3 pt-4">
							<Button
								type="button"
								variant="outline"
								onClick={onClose}
								disabled={updateProfileMutation.isPending}
							>
								<X className="h-4 w-4 mr-2" />
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={updateProfileMutation.isPending}
							>
								{updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
