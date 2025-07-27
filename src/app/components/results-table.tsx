"use client";

import { useState } from "react";
import { LoadingSpinner } from "./loading-spinner";
import type { ExtractedData } from "../types";
import { EmailTemplate } from "../types";

type ResultsTableProps = {
	extractedData: ExtractedData[];
	isPreviewingEmails: boolean;
	isSendingEmails: boolean;
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
	isPreviewingEmails,
	isSendingEmails,
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

	const handleTemplateChange = (rowIndex: number, template: EmailTemplate) => {
		onUpdateData(rowIndex, "template", template);
	};

	// Calculate successful vs failed extractions
	const successfulExtractions = extractedData.filter((data) => !data.error);
	const failedExtractions = extractedData.filter((data) => data.error);

	if (extractedData.length === 0) {
		return null;
	}

	return (
		<div className="p-8 rounded-lg shadow-lg transition-all duration-500 animate-fade-in bg-card text-card-foreground border border-border">
			<h2 className="text-2xl font-semibold mb-4 flex items-center text-foreground">
				<span className="mr-2">✅</span>
				2. Verify Details and Send Emails
			</h2>
			<div className="overflow-x-auto">
				<table className="min-w-full divide-y transition-colors duration-300 border-border">
					<thead className="bg-muted">
						<tr>
							<th
								scope="col"
								className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground"
							>
								File Name & Status
							</th>
							<th
								scope="col"
								className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground"
							>
								First Name ✏️
							</th>
							<th
								scope="col"
								className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground"
							>
								Last Name ✏️
							</th>
							<th
								scope="col"
								className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground"
							>
								Email ✏️
							</th>
							<th
								scope="col"
								className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground"
							>
								Email Template / Error Details
							</th>
						</tr>
					</thead>
					<tbody className="bg-card">
						{extractedData.map((data, index) => (
							<tr
								key={index}
								className={`transition-colors duration-200 hover:bg-opacity-50 border-b border-border ${
									data.error ? "bg-red-50 dark:bg-red-900/20" : ""
								}`}
							>
								<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
									<div className="flex items-center">
										{data.error ? (
											<span
												className="text-red-500 mr-2"
												title="Failed to extract"
											>
												❌
											</span>
										) : (
											<span
												className="text-green-500 mr-2"
												title="Successfully extracted"
											>
												✅
											</span>
										)}
										{data.fileName}
									</div>
								</td>
								<td
									className={`px-6 py-4 whitespace-nowrap text-sm transition-colors text-muted-foreground ${
										data.error ? "" : "cursor-pointer hover:bg-opacity-70"
									}`}
									onClick={() =>
										!data.error &&
										handleCellClick(index, "firstName", data.firstName)
									}
									title={data.error ? "" : "Click to edit"}
								>
									{data.error ? (
										<span className="text-red-500 italic">
											Error extracting
										</span>
									) : editingCell?.row === index &&
									  editingCell?.field === "firstName" ? (
										<input
											type="text"
											value={editValue}
											onChange={(e) => setEditValue(e.target.value)}
											onBlur={handleCellSave}
											onKeyDown={handleKeyDown}
											className="w-full px-2 py-1 rounded border text-sm bg-card text-foreground border-border"
											autoFocus
										/>
									) : (
										<span className="block w-full p-1 rounded hover:bg-opacity-50 bg-transparent">
											{data.firstName}
										</span>
									)}
								</td>
								<td
									className={`px-6 py-4 whitespace-nowrap text-sm transition-colors text-muted-foreground ${
										data.error ? "" : "cursor-pointer hover:bg-opacity-70"
									}`}
									onClick={() =>
										!data.error &&
										handleCellClick(index, "lastName", data.lastName)
									}
									title={data.error ? "" : "Click to edit"}
								>
									{data.error ? (
										<span className="text-red-500 italic">
											Error extracting
										</span>
									) : editingCell?.row === index &&
									  editingCell?.field === "lastName" ? (
										<input
											type="text"
											value={editValue}
											onChange={(e) => setEditValue(e.target.value)}
											onBlur={handleCellSave}
											onKeyDown={handleKeyDown}
											className="w-full px-2 py-1 rounded border text-sm bg-card text-foreground border-border"
											autoFocus
										/>
									) : (
										<span className="block w-full p-1 rounded hover:bg-opacity-50 bg-transparent">
											{data.lastName}
										</span>
									)}
								</td>
								<td
									className={`px-6 py-4 whitespace-nowrap text-sm transition-colors text-muted-foreground ${
										data.error ? "" : "cursor-pointer hover:bg-opacity-70"
									}`}
									onClick={() =>
										!data.error && handleCellClick(index, "email", data.email)
									}
									title={data.error ? "" : "Click to edit"}
								>
									{data.error ? (
										<span className="text-red-500 italic">
											Error extracting
										</span>
									) : editingCell?.row === index &&
									  editingCell?.field === "email" ? (
										<input
											type="email"
											value={editValue}
											onChange={(e) => setEditValue(e.target.value)}
											onBlur={handleCellSave}
											onKeyDown={handleKeyDown}
											className="w-full px-2 py-1 rounded border text-sm bg-card text-foreground border-border"
											autoFocus
										/>
									) : (
										<span className="block w-full p-1 rounded hover:bg-opacity-50 bg-transparent">
											{data.email}
										</span>
									)}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm">
									{data.error ? (
										<div className="text-red-500">
											<span className="text-xs block">❌ Failed</span>
											<span className="text-xs italic">{data.error}</span>
										</div>
									) : (
										<select
											value={data.template || EmailTemplate.ACKNOWLEDGMENT}
											onChange={(e) =>
												handleTemplateChange(
													index,
													e.target.value as EmailTemplate
												)
											}
											className="w-full px-3 py-2 rounded border text-sm transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-card text-foreground border-border"
										>
											<option value={EmailTemplate.ACKNOWLEDGMENT}>
												📧 Acknowledgment
											</option>
											<option value={EmailTemplate.SCREENING}>
												🔍 Screening Questions
											</option>
										</select>
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
			<div className="flex justify-between items-center mt-6">
				<div className="text-sm px-3 py-2 rounded-md bg-muted text-muted-foreground">
					<div className="flex items-center space-x-4">
						<span>✅ {successfulExtractions.length} successful</span>
						{failedExtractions.length > 0 && (
							<span className="text-red-500">
								❌ {failedExtractions.length} failed
							</span>
						)}
					</div>
					<div className="text-xs mt-1 opacity-75">
						💡 Click on fields to edit • Select email template for each
						candidate
						{failedExtractions.length > 0 && " • Failed files cannot be edited"}
					</div>
				</div>
				<div className="flex space-x-3">
					<button
						onClick={onPreviewEmails}
						disabled={isPreviewingEmails || successfulExtractions.length === 0}
						className={`px-6 py-2 font-semibold rounded-full transition-all duration-300 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed border border-border ${
							isPreviewingEmails || successfulExtractions.length === 0
								? "bg-muted text-muted-foreground"
								: "bg-muted text-foreground hover:bg-muted/80"
						}`}
					>
						<span>👁️</span>
						<span>Preview Emails</span>
					</button>
					<button
						onClick={onSendEmails}
						disabled={isSendingEmails || successfulExtractions.length === 0}
						className={`px-6 py-2 font-semibold rounded-full transition-all duration-300 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed ${
							isSendingEmails || successfulExtractions.length === 0
								? "bg-muted text-muted-foreground"
								: "bg-secondary text-white hover:bg-secondary-hover"
						}`}
					>
						{isSendingEmails && <LoadingSpinner size="w-4 h-4" />}
						<span>📧</span>
						<span>{isSendingEmails ? "Sending..." : "Send Emails to All"}</span>
					</button>
				</div>
			</div>
		</div>
	);
}
