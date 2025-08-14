"use client";

import { FileUploadSection } from "./file-upload-section";
import { ResultsTable } from "./results-table";
import { EmailPreviewModal } from "./email-preview-modal";
import { JobPostSelector } from "./job-post-selector";
import { FeatureCard } from "./ui/feature-card";
import { useHiringAssistant } from "../hooks/use-hiring-assistant";
import { Video, BrainCircuit, Zap } from "lucide-react";

export function HomePage() {
	const {
		files,
		extractedData,
		jobPosts,
		selectedJobPost,
		setSelectedJobPost,
		isExtracting,
		isPreviewingEmails,
		isSendingEmails,
		isLoadingJobPosts,
		emailPreviews,
		showEmailPreview,
		handleFileChange,
		handleUpload,
		handleSendEmails,
		handlePreviewEmails,
		updateExtractedData,
		setShowEmailPreview,
	} = useHiringAssistant();

	return (
		<>
			<EmailPreviewModal
				emailPreviews={emailPreviews}
				isLoading={isSendingEmails}
				isOpen={showEmailPreview}
				onClose={() => setShowEmailPreview(false)}
				onSendEmails={handleSendEmails}
			/>
			<div className="flex flex-col gap-6">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">
						Resume Processing
					</h1>
					<p className="text-muted-foreground">
						Upload resumes to extract candidate information and send automated
						emails
					</p>
				</div>

				{/* Quick Access to Other Features */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<FeatureCard
						title="Interview Assistant"
						description="Generate AI-powered questions for your candidates"
						href="/interview-assistant"
						icon={BrainCircuit}
						buttonText="Create Questions"
						variant="default"
					/>

					<FeatureCard
						title="Live Interview"
						description="Conduct interviews with real-time AI assistance"
						href="/live-interview"
						icon={Video}
						buttonText="Start Interview"
						variant="primary"
						additionalIcon={Zap}
					/>
				</div>

				<JobPostSelector
					jobPosts={jobPosts}
					selectedJobPost={selectedJobPost}
					onJobPostSelect={setSelectedJobPost}
					isLoading={isLoadingJobPosts}
					required
				/>

				<FileUploadSection
					files={files}
					isLoading={isExtracting}
					onFileChange={handleFileChange}
					onUpload={handleUpload}
					disabled={!selectedJobPost}
				/>

				{extractedData.length > 0 && selectedJobPost && (
					<div className="p-4 bg-card border rounded-lg shadow-sm">
						<h3 className="text-lg font-medium mb-3">
							📋 Processing Results for: {selectedJobPost.title}
						</h3>
						<p className="text-sm text-muted-foreground">
							All candidates below have been associated with this job post. You
							can now preview and send emails.
						</p>
					</div>
				)}

				<ResultsTable
					extractedData={extractedData}
					isPreviewingEmails={isPreviewingEmails}
					isSendingEmails={isSendingEmails}
					onSendEmails={handleSendEmails}
					onPreviewEmails={handlePreviewEmails}
					onUpdateData={updateExtractedData}
				/>
			</div>
		</>
	);
}
