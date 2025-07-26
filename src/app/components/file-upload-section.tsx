"use client";

import { useRef, useState } from "react";
import { LoadingSpinner } from "./loading-spinner";

type FileUploadSectionProps = {
	files: File[];
	isLoading: boolean;
	onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	onUpload: () => void;
};

export function FileUploadSection({
	files,
	isLoading,
	onFileChange,
	onUpload,
}: FileUploadSectionProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isDragOver, setIsDragOver] = useState(false);

	const handleButtonClick = () => {
		if (!isLoading) {
			fileInputRef.current?.click();
		}
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		if (!isLoading) {
			setIsDragOver(true);
		}
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		if (!isLoading) {
			setIsDragOver(false);
		}
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragOver(false);

		if (isLoading) return;

		const droppedFiles = Array.from(e.dataTransfer.files).filter(
			(file) => file.type === "application/pdf"
		);

		if (droppedFiles.length > 0 && fileInputRef.current) {
			const dataTransfer = new DataTransfer();
			droppedFiles.forEach((file) => dataTransfer.items.add(file));
			fileInputRef.current.files = dataTransfer.files;

			// Trigger the onChange event
			const event = new Event("change", { bubbles: true });
			fileInputRef.current.dispatchEvent(event);
		}
	};

	return (
		<div className="p-8 rounded-lg shadow-lg mb-8 transition-colors duration-300 bg-card text-card-foreground border border-border">
			<h2 className="text-2xl font-semibold mb-4 flex items-center text-foreground">
				<span className="mr-2">📄</span>
				1. Upload Resumes
			</h2>
			<div className="space-y-4">
				{/* Hidden file input */}
				<input
					ref={fileInputRef}
					type="file"
					multiple
					accept=".pdf,.doc,.docx"
					onChange={onFileChange}
					className="hidden"
				/>

				{/* Drag and drop area */}
				<div
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}
					className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
						isLoading ? "cursor-not-allowed opacity-50" : "cursor-pointer"
					} ${
						isDragOver && !isLoading
							? "border-primary bg-primary/10"
							: "border-muted-foreground/30 hover:border-primary/50"
					}`}
					onClick={handleButtonClick}
				>
					<div className="flex flex-col items-center space-y-3">
						<div className="text-4xl">📁</div>
						<div className="text-lg font-medium text-foreground">
							Drop files here or click to browse
						</div>
						<div className="text-sm text-muted-foreground">
							Supports PDF, DOC, and DOCX files
						</div>
						<button
							type="button"
							disabled={isLoading}
							className={`mt-2 px-4 py-2 rounded-md transition-colors duration-300 ${
								isLoading
									? "bg-muted text-muted-foreground cursor-not-allowed"
									: "bg-primary text-white hover:bg-primary-hover"
							}`}
						>
							Choose Files
						</button>
					</div>
				</div>

				{files.length > 0 && (
					<div className="text-sm px-3 py-2 rounded-md transition-colors duration-300 bg-muted text-muted-foreground">
						📁 {files.length} file{files.length !== 1 ? "s" : ""} selected
					</div>
				)}
				<div className="flex justify-end">
					<button
						onClick={onUpload}
						disabled={files.length === 0 || isLoading}
						className={`px-6 py-2 font-semibold rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 ${
							files.length === 0 || isLoading
								? "bg-muted text-muted-foreground"
								: "bg-primary text-white hover:bg-primary-hover"
						}`}
					>
						{isLoading && <LoadingSpinner size="w-4 h-4" />}
						<span>{isLoading ? "Processing..." : "Extract Data"}</span>
					</button>
				</div>
			</div>
		</div>
	);
}
