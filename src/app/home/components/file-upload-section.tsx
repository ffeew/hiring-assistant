"use client";

import { useRef, useState } from "react";
import { LoadingSpinner } from "@/app/components/shared/loading-spinner";
import { SUPPORTED_FILE_TYPES } from "@/app/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, FolderOpen } from "lucide-react";

type FileUploadSectionProps = {
	files: File[];
	isLoading: boolean;
	onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	onUpload: () => void;
	disabled?: boolean;
};

export function FileUploadSection({
	files,
	isLoading,
	onFileChange,
	onUpload,
	disabled = false,
}: FileUploadSectionProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isDragOver, setIsDragOver] = useState(false);

	const handleButtonClick = () => {
		if (!isLoading && !disabled) {
			fileInputRef.current?.click();
		}
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		if (!isLoading && !disabled) {
			setIsDragOver(true);
		}
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragOver(false);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragOver(false);

		if (isLoading || disabled) return;

		const droppedFiles = Array.from(e.dataTransfer.files);
		const supportedFiles = droppedFiles.filter((file) =>
			SUPPORTED_FILE_TYPES.includes(file.type as typeof SUPPORTED_FILE_TYPES[number])
		);

		if (supportedFiles.length > 0) {
			// Create a fake event to pass to onFileChange
			const fakeEvent = {
				target: {
					files: supportedFiles,
				},
			} as unknown as React.ChangeEvent<HTMLInputElement>;

			onFileChange(fakeEvent);
		}
	};

	return (
		<div className="space-y-4">
			<input
				ref={fileInputRef}
				type="file"
				multiple
				accept={SUPPORTED_FILE_TYPES.join(",")}
				onChange={onFileChange}
				className="hidden"
			/>

			{/* Drag and drop area */}
			<Card 
				className={`transition-all duration-300 ${
					isLoading || disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-accent/50"
				} ${
					isDragOver && !isLoading && !disabled
						? "border-primary bg-primary/10 border-2"
						: "border-dashed border-2"
				}`}
				onClick={handleButtonClick}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
			>
				<CardContent className="flex flex-col items-center justify-center py-12 px-6">
					<div className="flex flex-col items-center space-y-4">
						<div className="rounded-full bg-primary/10 p-4">
							<FolderOpen className="h-8 w-8 text-primary" />
						</div>
						<div className="text-center space-y-2">
							<h3 className="text-lg font-medium">
								{disabled ? "Select a job post first" : "Drop files here or click to browse"}
							</h3>
							<p className="text-sm text-muted-foreground">
								{disabled 
									? "You must select a job post before uploading resumes"
									: "Supports PDF, DOC, and DOCX files"
								}
							</p>
						</div>
						<Button
							type="button"
							disabled={isLoading || disabled}
							variant="default"
							size="sm"
							onClick={(e) => {
								e.stopPropagation();
								handleButtonClick();
							}}
						>
							<Upload className="h-4 w-4 mr-2" />
							{disabled ? "Job Post Required" : "Choose Files"}
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Selected files list and upload button */}
			{files.length > 0 && (
				<div className="space-y-4">
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<Badge variant="secondary" className="flex items-center gap-2">
								<FileText className="h-4 w-4" />
								{files.length} file{files.length !== 1 ? "s" : ""} selected
							</Badge>
						</div>
						
						{/* File list */}
						<div className="max-h-32 overflow-y-auto space-y-2">
							{files.map((file, index) => (
								<div
									key={`${file.name}-${index}`}
									className="flex items-center gap-2 text-sm bg-muted/50 rounded-md px-3 py-2"
								>
									<FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
									<span className="truncate flex-1" title={file.name}>
										{file.name}
									</span>
									<Badge variant="outline" className="text-xs">
										{(file.size / 1024 / 1024).toFixed(1)} MB
									</Badge>
								</div>
							))}
						</div>
					</div>
					
					<Button
						onClick={onUpload}
						disabled={files.length === 0 || isLoading}
						className="w-full flex items-center gap-2"
					>
						{isLoading ? (
							<>
								<LoadingSpinner />
								Processing...
							</>
						) : (
							<>
								<Upload className="h-4 w-4" />
								Upload & Process {files.length} file{files.length !== 1 ? "s" : ""}
							</>
						)}
					</Button>
				</div>
			)}
		</div>
	);
}