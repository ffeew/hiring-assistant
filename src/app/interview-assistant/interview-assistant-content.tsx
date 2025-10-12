"use client";

import { InterviewAssistant } from "@/app/components/interview-assistant/interview-assistant";
import { LoadingSpinner } from "@/app/components/loading-spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useApplicants } from "./query/use-applicants";
import { useJobPosts } from "../job-posts/queries/use-job-posts";
import { useResumeFiles } from "./query/use-resume-files";

export function InterviewAssistantContent() {
	const {
		data: applicants,
		isLoading: applicantsLoading,
		error: applicantsError,
	} = useApplicants();

	const {
		data: jobPosts,
		isLoading: jobPostsLoading,
		error: jobPostsError,
	} = useJobPosts();

	const {
		data: resumeFiles,
		isLoading: resumeFilesLoading,
		error: resumeFilesError,
	} = useResumeFiles();

	const isLoading = applicantsLoading || jobPostsLoading || resumeFilesLoading;
	const error = applicantsError || jobPostsError || resumeFilesError;

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<LoadingSpinner />
			</div>
		);
	}

	if (error) {
		return (
			<Alert variant="destructive">
				<AlertCircle className="h-4 w-4" />
				<AlertDescription>
					Failed to load data: {error.message}
				</AlertDescription>
			</Alert>
		);
	}

	if (!applicants || !jobPosts || !resumeFiles) {
		return (
			<Alert variant="destructive">
				<AlertCircle className="h-4 w-4" />
				<AlertDescription>
					No data available. Please ensure you have applicants, job posts, and
					resumes.
				</AlertDescription>
			</Alert>
		);
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">
					Interview Assistant
				</h1>
				<p className="text-muted-foreground">
					Generate tailored interview questions to assess candidates effectively
				</p>
			</div>

			<InterviewAssistant
				applicants={applicants}
				jobPosts={jobPosts}
				resumeFiles={resumeFiles}
			/>
		</div>
	);
}
