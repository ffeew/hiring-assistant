"use client";

import { useState } from "react";
import { LoadingSpinner } from "@/app/components/shared/loading-spinner";
import type { ExtractedData, EmailTemplateData } from "@/app/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Eye, Send, AlertTriangle, FileText, Edit3 } from "lucide-react";

type ResultsTableProps = {
	extractedData: ExtractedData[];
	emailTemplates: EmailTemplateData[];
	isPreviewingEmails: boolean;
	isSendingEmails: boolean;
	isLoadingEmailTemplates: boolean;
	onSendEmails: () => void;
	onPreviewEmails: () => void;
	onUpdateData: (
		index: number,
		field: keyof ExtractedData,
		value: string
	) => void;
};

export function ResultsTable({
	extractedData,
	emailTemplates,
	isPreviewingEmails,
	isSendingEmails,
	isLoadingEmailTemplates,
	onSendEmails,
	onPreviewEmails,
	onUpdateData,
}: ResultsTableProps) {
	const [editingCell, setEditingCell] = useState<{
		row: number;
		field: keyof ExtractedData;
	} | null>(null);
	const [editValue, setEditValue] = useState("");

	const handleCellClick = (
		rowIndex: number,
		field: keyof ExtractedData,
		currentValue: string
	) => {
		if (field === "fileName" || extractedData[rowIndex].error) return; // Don't allow editing filename or failed extractions
		setEditingCell({ row: rowIndex, field });
		setEditValue(currentValue);
	};

	const handleCellSave = () => {
		if (editingCell) {
			onUpdateData(editingCell.row, editingCell.field, editValue);
			setEditingCell(null);
			setEditValue("");
		}
	};

	const handleCellCancel = () => {
		setEditingCell(null);
		setEditValue("");
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			handleCellSave();
		} else if (e.key === "Escape") {
			handleCellCancel();
		}
	};

	const handleTemplateChange = (rowIndex: number, value: string) => {
		// All values are now templateIds from dynamic templates
		onUpdateData(rowIndex, "templateId", value);
	};

	// Calculate successful vs failed extractions
	const successfulExtractions = extractedData.filter((data) => !data.error);
	const failedExtractions = extractedData.filter((data) => data.error);

	if (extractedData.length === 0) {
		return null;
	}

	return (
		<Card className="transition-all duration-500 animate-fade-in">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<CheckCircle className="h-5 w-5 text-green-600" />
					Verify Details and Send Emails
				</CardTitle>
				<CardDescription>
					Review extracted candidate information and select email templates
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="overflow-x-auto">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-[200px]">
									<div className="flex items-center gap-2">
										<FileText className="h-4 w-4" />
										File & Status
									</div>
								</TableHead>
								<TableHead>
									<div className="flex items-center gap-2">
										<Edit3 className="h-3 w-3" />
										First Name
									</div>
								</TableHead>
								<TableHead>
									<div className="flex items-center gap-2">
										<Edit3 className="h-3 w-3" />
										Last Name
									</div>
								</TableHead>
								<TableHead>
									<div className="flex items-center gap-2">
										<Edit3 className="h-3 w-3" />
										Email
									</div>
								</TableHead>
								<TableHead>Template / Error</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{extractedData.map((data, index) => (
								<TableRow
									key={index}
									className={`transition-colors ${
										data.error ? "bg-destructive/5 hover:bg-destructive/10" : "hover:bg-muted/50"
									}`}
								>
									<TableCell className="font-medium">
										<div className="flex items-center gap-2">
											{data.error ? (
												<XCircle className="h-4 w-4 text-destructive" />
											) : (
												<CheckCircle className="h-4 w-4 text-green-600" />
											)}
											<span className="truncate max-w-[150px]" title={data.fileName}>
												{data.fileName}
											</span>
										</div>
									</TableCell>
									<TableCell
										className={`${
											data.error ? "" : "cursor-pointer hover:bg-accent/50 rounded"
										}`}
										onClick={() =>
											!data.error &&
											handleCellClick(index, "firstName", data.firstName || "")
										}
										title={data.error ? "" : "Click to edit"}
									>
										{data.error ? (
											<Badge variant="destructive" className="text-xs">
												Error
											</Badge>
										) : editingCell?.row === index &&
										  editingCell?.field === "firstName" ? (
											<Input
												type="text"
												value={editValue}
												onChange={(e) => setEditValue(e.target.value)}
												onBlur={handleCellSave}
												onKeyDown={handleKeyDown}
												className="h-8 text-sm"
												autoFocus
											/>
										) : (
											<span className="block w-full p-1 rounded transition-colors hover:bg-accent/30">
												{data.firstName}
											</span>
										)}
									</TableCell>
									<TableCell
										className={`${
											data.error ? "" : "cursor-pointer hover:bg-accent/50 rounded"
										}`}
										onClick={() =>
											!data.error &&
											handleCellClick(index, "lastName", data.lastName || "")
										}
										title={data.error ? "" : "Click to edit"}
									>
										{data.error ? (
											<Badge variant="destructive" className="text-xs">
												Error
											</Badge>
										) : editingCell?.row === index &&
										  editingCell?.field === "lastName" ? (
											<Input
												type="text"
												value={editValue}
												onChange={(e) => setEditValue(e.target.value)}
												onBlur={handleCellSave}
												onKeyDown={handleKeyDown}
												className="h-8 text-sm"
												autoFocus
											/>
										) : (
											<span className="block w-full p-1 rounded transition-colors hover:bg-accent/30">
												{data.lastName}
											</span>
										)}
									</TableCell>
									<TableCell
										className={`${
											data.error ? "" : "cursor-pointer hover:bg-accent/50 rounded"
										}`}
										onClick={() =>
											!data.error && handleCellClick(index, "email", data.email || "")
										}
										title={data.error ? "" : "Click to edit"}
									>
										{data.error ? (
											<Badge variant="destructive" className="text-xs">
												Error
											</Badge>
										) : editingCell?.row === index &&
										  editingCell?.field === "email" ? (
											<Input
												type="email"
												value={editValue}
												onChange={(e) => setEditValue(e.target.value)}
												onBlur={handleCellSave}
												onKeyDown={handleKeyDown}
												className="h-8 text-sm"
												autoFocus
											/>
										) : (
											<span className="block w-full p-1 rounded transition-colors hover:bg-accent/30">
												{data.email}
											</span>
										)}
									</TableCell>
									<TableCell>
										{data.error ? (
											<div className="space-y-1">
												<Badge variant="destructive" className="text-xs">
													Failed
												</Badge>
												<p className="text-xs text-muted-foreground italic">
													{data.error}
												</p>
											</div>
										) : (
											<Select
												value={data.templateId || ""}
												onValueChange={(value) => handleTemplateChange(index, value)}
												disabled={isLoadingEmailTemplates}
											>
												<SelectTrigger className={`h-8 text-sm ${!data.templateId ? 'border-yellow-300 bg-yellow-50' : ''}`}>
													<SelectValue placeholder={
														emailTemplates.length > 0 
															? "Select template..." 
															: "No templates available"
													} />
												</SelectTrigger>
												<SelectContent>
													{emailTemplates.length > 0 ? (
														<>
															{!data.templateId && (
																<div className="px-2 py-2 text-xs text-yellow-700 bg-yellow-50 border-b">
																	⚠️ No template assigned - select one to enable email sending
																</div>
															)}
															{emailTemplates.map((template) => (
																<SelectItem key={template.id} value={template.id}>
																	<div className="flex items-center gap-2">
																		<div 
																			className={`h-2 w-2 rounded-full ${
																				template.isDefault 
																					? 'bg-green-500' 
																					: 'bg-blue-500'
																			}`} 
																		/>
																		<span className="truncate max-w-[200px]">{template.name}</span>
																		<Badge variant="secondary" className="ml-auto text-xs">
																			{template.category}
																		</Badge>
																		{template.isDefault && (
																			<Badge variant="outline" className="text-xs">
																				Default
																			</Badge>
																		)}
																	</div>
																</SelectItem>
															))}
														</>
													) : (
														<div className="px-2 py-4 text-center text-sm text-muted-foreground">
															<div className="mb-2">No email templates found.</div>
															<a 
																href="/email-templates" 
																className="text-blue-600 hover:text-blue-700 text-xs underline"
															>
																Create templates first →
															</a>
														</div>
													)}
												</SelectContent>
											</Select>
										)}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>

				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-6 pt-6 border-t">
					<div className="space-y-2">
						<div className="flex items-center gap-4">
							<Badge variant="secondary" className="flex items-center gap-1">
								<CheckCircle className="h-3 w-3" />
								{successfulExtractions.length} successful
							</Badge>
							{failedExtractions.length > 0 && (
								<Badge variant="destructive" className="flex items-center gap-1">
									<XCircle className="h-3 w-3" />
									{failedExtractions.length} failed
								</Badge>
							)}
						</div>
						<div className="flex items-center gap-1 text-xs text-muted-foreground">
							<AlertTriangle className="h-3 w-3" />
							<span>Click on fields to edit • Select email template for each candidate</span>
							{failedExtractions.length > 0 && <span> • Failed files cannot be edited</span>}
						</div>
					</div>

					<div className="flex gap-3">
						<Button
							variant="outline"
							onClick={onPreviewEmails}
							disabled={isPreviewingEmails || successfulExtractions.length === 0}
							className="flex items-center gap-2"
						>
							<Eye className="h-4 w-4" />
							Preview Emails
						</Button>
						<Button
							onClick={onSendEmails}
							disabled={isSendingEmails || successfulExtractions.length === 0}
							className="flex items-center gap-2"
						>
							{isSendingEmails ? (
								<LoadingSpinner />
							) : (
								<Send className="h-4 w-4" />
							)}
							{isSendingEmails ? "Sending..." : "Send All Emails"}
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
