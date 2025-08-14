"use client";

import { useState } from "react";
import type { EMPLOYMENT_TYPES, EXPERIENCE_LEVELS, JobPost } from "@/app/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Calendar, DollarSign, ChevronDown, ChevronUp } from "lucide-react";

interface JobPostCardProps {
	jobPost: JobPost;
	onEdit: () => void;
	onDelete: () => void;
	onToggleActive: (isActive: boolean) => void;
}

export function JobPostCard({
	jobPost,
	onEdit,
	onDelete,
	onToggleActive,
}: JobPostCardProps) {
	const [isExpanded, setIsExpanded] = useState(false);
	const DESCRIPTION_LIMIT = 150;
	const shouldShowToggle = jobPost.description.length > DESCRIPTION_LIMIT;

	const formatDate = (date: Date) => {
		return new Date(date).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const getEmploymentTypeLabel = (
		type: (typeof EMPLOYMENT_TYPES)[number] | null
	) => {
		switch (type) {
			case "full-time":
				return "Full-time";
			case "part-time":
				return "Part-time";
			case "contract":
				return "Contract";
			case "internship":
				return "Internship";
			default:
				return null;
		}
	};

	const getExperienceLevelLabel = (
		level: (typeof EXPERIENCE_LEVELS)[number] | null
	) => {
		switch (level) {
			case "entry":
				return "Entry Level";
			case "mid":
				return "Mid Level";
			case "senior":
				return "Senior Level";
			default:
				return null;
		}
	};

	return (
		<Card className={`transition-all hover:shadow-md ${
			!jobPost.isActive ? "opacity-75" : ""
		}`}>
			<CardHeader>
				<div className="flex justify-between items-start">
					<div className="flex-1">
						<CardTitle className="text-lg">
							{jobPost.title}
						</CardTitle>
						{jobPost.department && (
							<CardDescription>
								{jobPost.department}
							</CardDescription>
						)}
					</div>
					<div className="flex items-center gap-2">
						<Badge variant={jobPost.isActive ? "default" : "secondary"}>
							{jobPost.isActive ? "Active" : "Inactive"}
						</Badge>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<div className="space-y-3 mb-4">
					{jobPost.location && (
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<MapPin className="h-4 w-4" />
							<span>{jobPost.location}</span>
						</div>
					)}

					<div className="flex flex-wrap gap-2">
						{getEmploymentTypeLabel(jobPost.employmentType) && (
							<Badge variant="secondary">
								{getEmploymentTypeLabel(jobPost.employmentType)}
							</Badge>
						)}
						{getExperienceLevelLabel(jobPost.experienceLevel) && (
							<Badge variant="outline">
								{getExperienceLevelLabel(jobPost.experienceLevel)}
							</Badge>
						)}
					</div>

					{jobPost.salaryRange && (
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<DollarSign className="h-4 w-4" />
							<span>{jobPost.salaryRange}</span>
						</div>
					)}
				</div>

				<div className="mb-4">
					<p className="text-sm text-muted-foreground">
						{isExpanded || !shouldShowToggle
							? jobPost.description
							: `${jobPost.description.substring(0, DESCRIPTION_LIMIT)}...`}
					</p>
					{shouldShowToggle && (
						<button
							onClick={() => setIsExpanded(!isExpanded)}
							className="text-xs text-primary hover:text-primary/80 transition-colors mt-2 flex items-center gap-1"
						>
							{isExpanded ? (
								<>
									<span>Show less</span>
									<ChevronUp className="h-3 w-3" />
								</>
							) : (
								<>
									<span>See more</span>
									<ChevronDown className="h-3 w-3" />
								</>
							)}
						</button>
					)}
				</div>

				<div className="pt-4 border-t space-y-3">
					<div className="flex items-center gap-1 text-xs text-muted-foreground">
						<Calendar className="h-3 w-3" />
						<span>Created {formatDate(jobPost.createdAt)}</span>
					</div>

					<div className="flex flex-wrap items-center gap-2">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => onToggleActive(!jobPost.isActive)}
							className="h-8 px-2 text-xs flex-shrink-0"
						>
							{jobPost.isActive ? "Deactivate" : "Activate"}
						</Button>

						<Button
							variant="ghost"
							size="sm"
							onClick={onEdit}
							className="h-8 px-2 text-xs flex-shrink-0"
						>
							Edit
						</Button>

						<Button
							variant="ghost"
							size="sm"
							onClick={onDelete}
							className="h-8 px-2 text-xs text-destructive hover:text-destructive flex-shrink-0"
						>
							Delete
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
