"use client";

import { LoadingSpinner } from "./loading-spinner";
import type { EmailPreviewResponse } from "@/lib/api-client";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Mail, Send, User, X } from "lucide-react";

type EmailPreviewModalProps = {
	emailPreviews: EmailPreviewResponse["previews"];
	isLoading: boolean;
	isOpen: boolean;
	onClose: () => void;
	onSendEmails: () => void;
};

export function EmailPreviewModal({
	emailPreviews,
	isLoading,
	isOpen,
	onClose,
	onSendEmails,
}: EmailPreviewModalProps) {
	const getTemplateBadgeVariant = (template: string) => {
		switch (template) {
			case "acknowledgment":
				return "secondary" as const;
			case "screening":
				return "default" as const;
			default:
				return "outline" as const;
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="md:max-w-6xl max-h-[95vh] w-[95vw] flex flex-col">
				<DialogHeader className="flex-shrink-0">
					<DialogTitle className="flex items-center gap-2">
						<Mail className="h-5 w-5" />
						Email Preview ({emailPreviews.length} recipient
						{emailPreviews.length !== 1 ? "s" : ""})
					</DialogTitle>
					<DialogDescription>
						Review the email content before sending to candidates
					</DialogDescription>
				</DialogHeader>

				<div className="flex flex-col gap-4 pr-4 overflow-y-scroll">
					{emailPreviews.map((preview, index) => (
						<Card key={index}>
							<CardHeader>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div className="flex items-center gap-2">
											<User className="h-4 w-4" />
											<CardTitle className="text-base">
												{preview.recipient.firstName}{" "}
												{preview.recipient.lastName}
											</CardTitle>
										</div>
										<Badge variant={getTemplateBadgeVariant(preview.template)}>
											{preview.template}
										</Badge>
									</div>
								</div>
								<CardDescription>
									To: {preview.recipient.email}
									{preview.recipient.jobPosition && (
										<span> • Position: {preview.recipient.jobPosition}</span>
									)}
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="flex flex-col gap-4">
									<div className="flex flex-col">
										<div className="text-sm font-medium text-muted-foreground mb-1">
											Subject
										</div>
										<div className="font-medium">{preview.subject}</div>
									</div>

									<Separator />

									<div className="flex flex-col">
										<div className="text-sm font-medium text-muted-foreground mb-2">
											Email Content
										</div>

										<iframe
											srcDoc={preview.html}
											className="w-full h-[35rem] border-0 rounded-md"
											sandbox="allow-same-origin"
											title={`Email preview for ${preview.recipient.firstName} ${preview.recipient.lastName}`}
										/>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>

				<Separator className="flex-shrink-0" />

				<div className="flex items-center justify-end gap-3 pt-4 flex-shrink-0">
					<Button variant="outline" onClick={onClose} disabled={isLoading}>
						<X className="h-4 w-4" />
						Cancel
					</Button>
					<Button onClick={onSendEmails} disabled={isLoading}>
						{isLoading ? (
							<>
								<LoadingSpinner />
								Sending...
							</>
						) : (
							<>
								<Send className="h-4 w-4" />
								Send All Emails
							</>
						)}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
