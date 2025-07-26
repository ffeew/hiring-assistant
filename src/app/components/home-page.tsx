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
		isExtracting,
		isPreviewingEmails,
		isSendingEmails,
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
