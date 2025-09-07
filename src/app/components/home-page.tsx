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
		emailTemplates,
		isExtracting,
		isPreviewingEmails,
		isSendingEmails,
		isLoadingJobPosts,
		isLoadingEmailTemplates,
		emailPreviews,
		showEmailPreview,
		hasTemplateIssues,
		extractionsWithoutTemplates,
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

				{hasTemplateIssues && extractedData.length > 0 && (
					<div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg shadow-sm">
						<h3 className="text-lg font-medium mb-2 text-yellow-800">
							⚠️ Email Templates Required
						</h3>
						<p className="text-sm text-yellow-700 mb-3">
							{extractionsWithoutTemplates} candidate(s) don&apos;t have email templates assigned. 
							You need to create email templates before sending emails.
						</p>
						<div className="flex flex-col sm:flex-row gap-2">
							<a 
								href="/email-templates" 
								className="inline-flex items-center px-3 py-2 text-sm font-medium text-yellow-800 bg-yellow-100 border border-yellow-300 rounded-md hover:bg-yellow-200 transition-colors"
							>
								Create Email Templates
							</a>
							<span className="text-xs text-yellow-600 self-center">
								After creating templates, re-process resumes or select templates manually below
							</span>
						</div>
					</div>
				)}

				<ResultsTable
					extractedData={extractedData}
					emailTemplates={emailTemplates}
					isPreviewingEmails={isPreviewingEmails}
					isSendingEmails={isSendingEmails}
					isLoadingEmailTemplates={isLoadingEmailTemplates}
					onSendEmails={handleSendEmails}
					onPreviewEmails={handlePreviewEmails}
					onUpdateData={updateExtractedData}
				/>
			</div>
		</>
	);
}
