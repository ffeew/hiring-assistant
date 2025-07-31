"use client";

import { Header } from "./header";
import { BackgroundPattern } from "./background-pattern";
import { FileUploadSection } from "./file-upload-section";
import { ResultsTable } from "./results-table";
import { EmailPreviewModal } from "./email-preview-modal";
import { useHiringAssistant } from "../hooks/use-hiring-assistant";

export function HomePage() {
	const {
		files,
		extractedData,
		jobPosts,
		selectedJobPost,
		setSelectedJobPost,
		customJobPosition,
		setCustomJobPosition,
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
		<main className="flex min-h-screen flex-col items-center p-6 md:p-24 transition-colors duration-300 relative bg-gradient-to-br from-background to-muted text-foreground">
			<BackgroundPattern />

			<div className="w-full max-w-4xl relative z-10">
				<Header />

				<FileUploadSection
					files={files}
					isLoading={isExtracting}
					onFileChange={handleFileChange}
					onUpload={handleUpload}
				/>

				{extractedData.length > 0 && (
					<div className="mb-6 p-4 bg-background border border-border rounded-lg shadow-sm">
						<h3 className="text-lg font-medium text-foreground mb-3">
							📋 Job Position
						</h3>
						<p className="text-sm text-muted-foreground mb-3">
							Select a job post or enter a custom position. This will be used in
							all email templates.
						</p>

						{isLoadingJobPosts ? (
							<div className="flex items-center justify-center py-4">
								<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
								<span className="ml-2 text-sm text-muted-foreground">
									Loading job posts...
								</span>
							</div>
						) : jobPosts.length > 0 ? (
							<div className="space-y-3">
								<div>
									<label
										htmlFor="job-select"
										className="block text-sm font-medium text-foreground mb-1"
									>
										Select Job Post
									</label>
									<select
										id="job-select"
										value={selectedJobPost?.id || ""}
										onChange={(e) => {
											const selected = jobPosts.find(
												(post) => post.id === e.target.value
											);
											setSelectedJobPost(selected || null);
										}}
										className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
									>
										<option value="">Custom position (enter below)</option>
										{jobPosts
											.filter((post) => post.isActive)
											.map((post) => (
												<option key={post.id} value={post.id}>
													{post.title} -{" "}
													{post.department && `${post.department} • `}
													{post.location || "Remote"}
												</option>
											))}
									</select>
								</div>

								{!selectedJobPost && (
									<div>
										<label
											htmlFor="custom-position"
											className="block text-sm font-medium text-foreground mb-1"
										>
											Custom Position
										</label>
										<input
											id="custom-position"
											type="text"
											value={customJobPosition}
											onChange={(e) => setCustomJobPosition(e.target.value)}
											className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
											placeholder="e.g., Software Engineer Intern, Frontend Developer, etc."
										/>
									</div>
								)}
							</div>
						) : (
							<div>
								<input
									type="text"
									value={customJobPosition}
									onChange={(e) => setCustomJobPosition(e.target.value)}
									className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
									placeholder="e.g., Software Engineer Intern, Frontend Developer, etc."
								/>
								<p className="text-xs text-muted-foreground mt-1">
									No job posts found.{" "}
									<a href="/job-posts" className="text-primary hover:underline">
										Create one here
									</a>{" "}
									for better organization.
								</p>
							</div>
						)}
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

				{showEmailPreview && (
					<EmailPreviewModal
						emailPreviews={emailPreviews}
						isLoading={isSendingEmails}
						onClose={() => setShowEmailPreview(false)}
						onSendEmails={handleSendEmails}
					/>
				)}
			</div>
		</main>
	);
}
