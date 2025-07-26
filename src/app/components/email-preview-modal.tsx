"use client";

import { LoadingSpinner } from "./loading-spinner";
import type { ExtractedData } from "../types";
import { EmailTemplate } from "../types";

type EmailPreviewModalProps = {
	emailPreviews: {
		html: string;
		subject: string;
		recipient: ExtractedData;
		template?: EmailTemplate;
	}[];
	isLoading: boolean;
	onClose: () => void;
	onSendEmails: () => void;
};

export function EmailPreviewModal({
	emailPreviews,
	isLoading,
	onClose,
	onSendEmails,
}: EmailPreviewModalProps) {
	if (emailPreviews.length === 0) {
		return null;
	}

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div className="max-w-4xl w-full max-h-[90vh] rounded-lg shadow-2xl flex flex-col bg-card text-card-foreground border border-border">
				{/* Header */}
				<div className="flex justify-between items-center p-6 border-b border-border">
					<h2 className="text-2xl font-semibold flex items-center text-foreground">
						<span className="mr-2">📧</span>
						Email Preview ({emailPreviews.length} recipient
						{emailPreviews.length !== 1 ? "s" : ""})
					</h2>
					<button
						onClick={onClose}
						className="text-2xl hover:opacity-70 transition-opacity text-muted-foreground"
					>
						✕
					</button>
				</div>

				{/* Content */}
				<div className="flex-1 overflow-y-auto p-6">
					<div className="space-y-6">
						{emailPreviews.map((preview, index) => (
							<div
								key={index}
								className="border rounded-lg overflow-hidden border-border"
							>
								{/* Email Header Info */}
								<div className="p-4 border-b bg-muted border-border">
									<div className="grid grid-cols-3 gap-4 text-sm">
										<div>
											<span className="font-medium text-muted-foreground">
												To:
											</span>
											<span className="text-foreground">
												{preview.recipient.firstName}{" "}
												{preview.recipient.lastName} &lt;
												{preview.recipient.email}&gt;
											</span>
										</div>
										<div>
											<span className="font-medium text-muted-foreground">
												Subject:
											</span>
											<span className="text-foreground">{preview.subject}</span>
										</div>
										<div>
											<span className="font-medium text-muted-foreground">
												Template:
											</span>
											<span className="text-foreground inline-flex items-center">
												{(preview.recipient.template ||
													EmailTemplate.SCREENING) ===
												EmailTemplate.SCREENING ? (
													<>🔍 Screening Questions</>
												) : (
													<>📧 Acknowledgment</>
												)}
											</span>
										</div>
									</div>
								</div>

								{/* Email Content */}
								<div
									className="h-96 overflow-y-auto"
									style={{ backgroundColor: "white" }}
								>
									<iframe
										srcDoc={preview.html}
										className="w-full h-full border-0"
										title={`Email preview for ${preview.recipient.firstName} ${preview.recipient.lastName}`}
									/>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Footer */}
				<div className="flex justify-between items-center p-6 border-t border-border">
					<button
						onClick={onClose}
						className="px-6 py-2 font-semibold rounded-full transition-all duration-300 bg-muted text-muted-foreground hover:bg-muted/80"
					>
						Cancel
					</button>

					<button
						onClick={onSendEmails}
						disabled={isLoading}
						className={`px-6 py-2 font-semibold rounded-full transition-all duration-300 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed ${
							isLoading
								? "bg-muted text-muted-foreground"
								: "bg-secondary text-white hover:bg-secondary-hover"
						}`}
					>
						{isLoading && <LoadingSpinner size="w-4 h-4" />}
						<span>📧</span>
						<span>
							{isLoading
								? "Sending..."
								: `Send ${emailPreviews.length} Email${
										emailPreviews.length !== 1 ? "s" : ""
								  }`}
						</span>
					</button>
				</div>
			</div>
		</div>
	);
}
