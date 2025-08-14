"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Briefcase, FileText, Calendar } from "lucide-react";

const sessionSetupSchema = z.object({
	applicantId: z.string().min(1, "Please select an applicant"),
	jobPostId: z.string().min(1, "Please select a job post"),
	resumeFileId: z.string().optional(),
	title: z.string().min(1, "Interview title is required"),
	interviewType: z.enum(["screening", "technical", "behavioral", "final"]),
});

type SessionSetupForm = z.infer<typeof sessionSetupSchema>;

interface SessionSetupModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (data: SessionSetupForm) => Promise<void>;
	applicants: Array<{
		id: string;
		firstName: string;
		lastName: string;
		email: string;
		jobPostId?: string | null;
	}>;
	jobPosts: Array<{
		id: string;
		title: string;
		department?: string | null;
	}>;
	resumeFiles: Array<{
		id: string;
		fileName: string;
		applicantId: string;
		jobPostId?: string | null;
	}>;
}

const interviewTypeOptions = [
	{ value: "screening", label: "Screening Interview", icon: Users },
	{ value: "technical", label: "Technical Interview", icon: FileText },
	{ value: "behavioral", label: "Behavioral Interview", icon: Users },
	{ value: "final", label: "Final Interview", icon: Briefcase },
];

// Utility function to truncate text safely
const truncateText = (text: string, maxLength: number): string => {
	return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

export function SessionSetupModal({
	isOpen,
	onClose,
	onSubmit,
	applicants,
	jobPosts,
	resumeFiles,
}: SessionSetupModalProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);

	const form = useForm<SessionSetupForm>({
		resolver: zodResolver(sessionSetupSchema),
		defaultValues: {
			applicantId: "",
			jobPostId: "",
			resumeFileId: "",
			title: "",
			interviewType: "screening",
		},
	});

	const selectedApplicantId = form.watch("applicantId");
	const selectedJobPostId = form.watch("jobPostId");
	const selectedInterviewType = form.watch("interviewType");

	// Filter resumes based on selected applicant and job post
	const availableResumes = resumeFiles.filter(
		(resume) =>
			resume.applicantId === selectedApplicantId &&
			(!selectedJobPostId || resume.jobPostId === selectedJobPostId)
	);

	// Auto-generate title based on selections
	const handleApplicantChange = (applicantId: string) => {
		const applicant = applicants.find((a) => a.id === applicantId);
		const jobPost = jobPosts.find((j) => j.id === selectedJobPostId);

		if (applicant && jobPost) {
			const title = `${selectedInterviewType} - ${applicant.firstName} ${applicant.lastName} - ${jobPost.title}`;
			form.setValue("title", title);
		}
	};

	const handleJobPostChange = (jobPostId: string) => {
		const applicant = applicants.find((a) => a.id === selectedApplicantId);
		const jobPost = jobPosts.find((j) => j.id === jobPostId);

		if (applicant && jobPost) {
			const title = `${selectedInterviewType} - ${applicant.firstName} ${applicant.lastName} - ${jobPost.title}`;
			form.setValue("title", title);
		}
	};

	const handleInterviewTypeChange = (type: string) => {
		const applicant = applicants.find((a) => a.id === selectedApplicantId);
		const jobPost = jobPosts.find((j) => j.id === selectedJobPostId);

		if (applicant && jobPost) {
			const title = `${type} - ${applicant.firstName} ${applicant.lastName} - ${jobPost.title}`;
			form.setValue("title", title);
		}
	};

	const handleSubmit = async (data: SessionSetupForm) => {
		setIsSubmitting(true);
		try {
			await onSubmit(data);
			form.reset();
		} catch (error) {
			console.error("Failed to create session:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const selectedApplicant = applicants.find(
		(a) => a.id === selectedApplicantId
	);
	const selectedJobPost = jobPosts.find((j) => j.id === selectedJobPostId);

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-2xl overflow-hidden">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Calendar className="h-5 w-5" />
						Setup New Interview Session
					</DialogTitle>
					<DialogDescription>
						Configure the interview session details to begin real-time
						conversation analysis
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(handleSubmit)}
						className="space-y-6"
					>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-0 overflow-hidden">
							<FormField
								control={form.control}
								name="applicantId"
								render={({ field }) => (
									<FormItem className="min-w-0">
										<FormLabel>Applicant</FormLabel>
										<Select
											onValueChange={(value) => {
												field.onChange(value);
												handleApplicantChange(value);
											}}
											value={field.value}
										>
											<FormControl>
												<SelectTrigger className="min-w-0">
													<SelectValue placeholder="Select applicant" />
												</SelectTrigger>
											</FormControl>
											<SelectContent className="max-w-[280px]">
												{applicants.map((applicant) => {
													const fullName = `${applicant.firstName} ${applicant.lastName}`;
													const truncatedName = truncateText(fullName, 20);
													const truncatedEmail = truncateText(
														applicant.email,
														25
													);

													return (
														<SelectItem key={applicant.id} value={applicant.id}>
															<div className="flex items-center gap-2 min-w-0 max-w-[180px]">
																<Users className="h-4 w-4 flex-shrink-0" />
																<div className="min-w-0 flex-1">
																	<div className="truncate font-medium">
																		{truncatedName}
																	</div>
																	<div className="truncate text-xs text-muted-foreground">
																		{truncatedEmail}
																	</div>
																</div>
															</div>
														</SelectItem>
													);
												})}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="jobPostId"
								render={({ field }) => (
									<FormItem className="min-w-0">
										<FormLabel>Job Post</FormLabel>
										<Select
											onValueChange={(value) => {
												field.onChange(value);
												handleJobPostChange(value);
											}}
											value={field.value}
										>
											<FormControl>
												<SelectTrigger className="min-w-0 max-w-[200px]">
													<SelectValue placeholder="Select job post" />
												</SelectTrigger>
											</FormControl>
											<SelectContent className="max-w-[280px]">
												{jobPosts.map((jobPost) => {
													const truncatedTitle = truncateText(
														jobPost.title,
														30
													);

													return (
														<SelectItem key={jobPost.id} value={jobPost.id}>
															<div className="flex items-center gap-2 min-w-0 max-w-[220px]">
																<Briefcase className="h-4 w-4 flex-shrink-0" />
																<div className="min-w-0 flex-1">
																	<div className="truncate font-medium">
																		{truncatedTitle}
																	</div>
																	{jobPost.department && (
																		<div className="truncate text-xs text-muted-foreground">
																			{jobPost.department}
																		</div>
																	)}
																</div>
															</div>
														</SelectItem>
													);
												})}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="resumeFileId"
								render={({ field }) => (
									<FormItem className="min-w-0">
										<FormLabel>Resume (Optional)</FormLabel>
										<Select
											onValueChange={field.onChange}
											value={field.value}
											disabled={!selectedApplicantId}
										>
											<FormControl>
												<SelectTrigger className="min-w-0">
													<SelectValue placeholder="Select resume" />
												</SelectTrigger>
											</FormControl>
											<SelectContent className="max-w-[280px]">
												{availableResumes.map((resume) => {
													const truncatedFileName = truncateText(
														resume.fileName,
														25
													);

													return (
														<SelectItem key={resume.id} value={resume.id}>
															<div className="flex items-center gap-2 min-w-0 max-w-[180px]">
																<FileText className="h-4 w-4 flex-shrink-0" />
																<div className="min-w-0 flex-1">
																	<div className="truncate font-medium">
																		{truncatedFileName}
																	</div>
																</div>
															</div>
														</SelectItem>
													);
												})}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="interviewType"
								render={({ field }) => (
									<FormItem className="min-w-0">
										<FormLabel>Interview Type</FormLabel>
										<Select
											onValueChange={(value) => {
												field.onChange(value);
												handleInterviewTypeChange(value);
											}}
											value={field.value}
										>
											<FormControl>
												<SelectTrigger className="min-w-0 max-w-[200px]">
													<SelectValue placeholder="Select interview type" />
												</SelectTrigger>
											</FormControl>
											<SelectContent className="max-w-[280px]">
												{interviewTypeOptions.map(
													({ value, label, icon: Icon }) => (
														<SelectItem key={value} value={value}>
															<div className="flex items-center gap-2">
																<Icon className="h-4 w-4" />
																{label}
															</div>
														</SelectItem>
													)
												)}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="title"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Interview Title</FormLabel>
									<FormControl>
										<Input placeholder="Enter interview title" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Preview */}
						{selectedApplicant && selectedJobPost && (
							<div className="rounded-lg border p-4 bg-muted/50">
								<h4 className="font-medium mb-2">Interview Preview</h4>
								<div className="space-y-2 text-sm">
									<div className="flex items-center gap-2">
										<Users className="h-4 w-4" />
										<span>
											Candidate: {selectedApplicant.firstName}{" "}
											{selectedApplicant.lastName}
										</span>
									</div>
									<div className="flex items-center gap-2">
										<Briefcase className="h-4 w-4" />
										<span>Position: {selectedJobPost.title}</span>
										{selectedJobPost.department && (
											<Badge variant="outline">
												{selectedJobPost.department}
											</Badge>
										)}
									</div>
									<div className="flex items-center gap-2">
										<Calendar className="h-4 w-4" />
										<span>
											Type:{" "}
											{
												interviewTypeOptions.find(
													(opt) => opt.value === selectedInterviewType
												)?.label
											}
										</span>
									</div>
									{availableResumes.length > 0 && (
										<div className="flex items-center gap-2">
											<FileText className="h-4 w-4" />
											<span>{availableResumes.length} resume(s) available</span>
										</div>
									)}
								</div>
							</div>
						)}

						<div className="flex justify-end gap-3">
							<Button type="button" variant="outline" onClick={onClose}>
								Cancel
							</Button>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? "Creating..." : "Create Interview Session"}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
