"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authClient } from "@/app/utils/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, ExternalLink } from "lucide-react";
import Link from "next/link";

const signupSchema = z
	.object({
		name: z.string().min(1, "Full name is required"),
		email: z.string().email("Please enter a valid email address"),
		password: z.string().min(6, "Password must be at least 6 characters"),
		confirmPassword: z.string(),
		gmailAddress: z.string().email("Please enter a valid Gmail address"),
		gmailAppPassword: z
			.string()
			.min(16, "Gmail app password must be 16 characters")
			.max(16, "Gmail app password must be 16 characters"),
		companyName: z.string().optional(),
		jobTitle: z.string().optional(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

type SignupFormData = z.infer<typeof signupSchema>;

export function SignUpForm() {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const router = useRouter();

	const form = useForm<SignupFormData>({
		resolver: zodResolver(signupSchema),
		defaultValues: {
			name: "",
			email: "",
			password: "",
			confirmPassword: "",
			gmailAddress: "",
			gmailAppPassword: "",
			companyName: "",
			jobTitle: "",
		},
	});

	const onSubmit = async (data: SignupFormData) => {
		setIsLoading(true);
		setError("");

		try {
			const { data: result, error: authError } = await authClient.signUp.email({
				email: data.email,
				password: data.password,
				name: data.name,
				gmailAddress: data.gmailAddress,
				gmailAppPassword: data.gmailAppPassword,
				companyName: data.companyName || undefined,
				jobTitle: data.jobTitle || undefined,
			});

			if (authError) {
				setError(authError.message || "Failed to create account");
			} else if (result) {
				router.push("/");
				router.refresh();
			}
		} catch (err) {
			console.error("Sign up error:", err);
			setError("An unexpected error occurred");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Card className="max-w-lg mx-auto mt-8">
			<CardHeader className="text-center">
				<CardTitle>Create Your Hiring Assistant Account</CardTitle>
				<CardDescription>
					Set up your account with email credentials to start using the hiring assistant
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
						{error && (
							<Alert variant="destructive">
								<AlertCircle className="h-4 w-4" />
								<AlertDescription>{error}</AlertDescription>
							</Alert>
						)}

						{/* Basic Information */}
						<div className="space-y-4">
							<div className="space-y-2">
								<h3 className="text-lg font-medium">Basic Information</h3>
								<Separator />
							</div>

							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Full Name *</FormLabel>
										<FormControl>
											<Input placeholder="Enter your full name" disabled={isLoading} {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Account Email *</FormLabel>
										<FormControl>
											<Input placeholder="Enter your account email" type="email" disabled={isLoading} {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						{/* Account Security */}
						<div className="space-y-4">
							<div className="space-y-2">
								<h3 className="text-lg font-medium">Account Security</h3>
								<Separator />
							</div>

							<FormField
								control={form.control}
								name="password"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Password *</FormLabel>
										<FormControl>
											<Input placeholder="Enter your password (min 6 characters)" type="password" disabled={isLoading} {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="confirmPassword"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Confirm Password *</FormLabel>
										<FormControl>
											<Input placeholder="Confirm your password" type="password" disabled={isLoading} {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						{/* Email Configuration */}
						<div className="space-y-4">
							<div className="space-y-2">
								<h3 className="text-lg font-medium">Email Configuration</h3>
								<Separator />
								<p className="text-xs text-muted-foreground">
									Required to send automated emails to candidates
								</p>
							</div>

							<FormField
								control={form.control}
								name="gmailAddress"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Gmail Address *</FormLabel>
										<FormControl>
											<Input placeholder="your.email@gmail.com" type="email" disabled={isLoading} {...field} />
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
											<Input placeholder="16-character app password" type="password" disabled={isLoading} {...field} />
										</FormControl>
										<FormMessage />
										<p className="text-xs text-muted-foreground">
											<Link
												href="https://support.google.com/accounts/answer/185833"
												target="_blank"
												rel="noopener noreferrer"
												className="text-primary hover:underline inline-flex items-center gap-1"
											>
												Generate an app password in your Google Account settings
												<ExternalLink className="h-3 w-3" />
											</Link>
										</p>
									</FormItem>
								)}
							/>
						</div>

						{/* Company Details */}
						<div className="space-y-4">
							<div className="space-y-2">
								<h3 className="text-lg font-medium">Company Details</h3>
								<Separator />
								<p className="text-xs text-muted-foreground">
									Optional: Used in email templates to candidates
								</p>
							</div>

							<FormField
								control={form.control}
								name="companyName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Company Name</FormLabel>
										<FormControl>
											<Input placeholder="Your Company Name" disabled={isLoading} {...field} />
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
											<Input placeholder="Hiring Manager, HR Director, etc." disabled={isLoading} {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<Button type="submit" disabled={isLoading} className="w-full">
							{isLoading ? "Creating account..." : "Create Account"}
						</Button>
					</form>
				</Form>

				<div className="mt-4 text-center">
					<span className="text-sm text-muted-foreground">
						Already have an account?{" "}
						<Link href="/login" className="text-primary hover:underline">
							Sign in
						</Link>
					</span>
				</div>
			</CardContent>
		</Card>
	);
}