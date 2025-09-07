"use client";

import { useState } from "react";
import {
	Plus,
	Search,
	Filter,
	Eye,
	Copy,
	Edit,
	Trash2,
	Mail,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DashboardLayout } from "../components/dashboard-layout";
import {
	useEmailTemplates,
	useDeleteEmailTemplate,
	useDuplicateEmailTemplate,
} from "../hooks/use-email-templates";
import { EmailTemplateData, TemplateCategory } from "../types";
import { EmailTemplateEditor } from "./components/email-template-editor";
import { EmailTemplatePreview } from "./components/email-template-preview";

const TEMPLATE_CATEGORIES: {
	value: TemplateCategory;
	label: string;
	description: string;
}[] = [
	{
		value: "acknowledgment",
		label: "Acknowledgment",
		description: "Thank candidates for applying",
	},
	{
		value: "screening",
		label: "Screening",
		description: "Initial screening questions",
	},
	{
		value: "interview",
		label: "Interview",
		description: "Interview invitations and scheduling",
	},
	{
		value: "offer",
		label: "Job Offer",
		description: "Job offer communications",
	},
	{
		value: "rejection",
		label: "Rejection",
		description: "Polite rejection notifications",
	},
	{
		value: "follow_up",
		label: "Follow Up",
		description: "Follow-up communications",
	},
];

export function EmailTemplatesContent() {
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] = useState<
		TemplateCategory | undefined
	>(undefined);
	const [showActiveOnly, setShowActiveOnly] = useState(true);
	const [selectedTemplate, setSelectedTemplate] =
		useState<EmailTemplateData | null>(null);
	const [editorMode, setEditorMode] = useState<"create" | "edit" | null>(null);
	const [previewTemplate, setPreviewTemplate] =
		useState<EmailTemplateData | null>(null);

	const { data, isLoading, error } = useEmailTemplates({
		search: searchTerm || undefined,
		category: selectedCategory,
		isActive: showActiveOnly ? true : undefined,
	});

	const deleteTemplate = useDeleteEmailTemplate();
	const duplicateTemplate = useDuplicateEmailTemplate();

	const templates = data?.data || [];

	const handleDelete = async (template: EmailTemplateData) => {
		if (confirm(`Are you sure you want to delete "${template.name}"?`)) {
			try {
				await deleteTemplate.mutateAsync(template.id);
			} catch (error) {
				console.error("Failed to delete template:", error);
			}
		}
	};

	const handleDuplicate = async (template: EmailTemplateData) => {
		try {
			await duplicateTemplate.mutateAsync({
				id: template.id,
				data: {
					name: `${template.name} (Copy)`,
					category: template.category,
				},
			});
		} catch (error) {
			console.error("Failed to duplicate template:", error);
		}
	};

	const getCategoryInfo = (category: TemplateCategory) => {
		return (
			TEMPLATE_CATEGORIES.find((c) => c.value === category) || {
				value: category,
				label: category,
				description: "",
			}
		);
	};

	const getCategoryBadgeColor = (category: TemplateCategory) => {
		const colors = {
			acknowledgment: "bg-blue-100 text-blue-800",
			screening: "bg-yellow-100 text-yellow-800",
			interview: "bg-green-100 text-green-800",
			offer: "bg-emerald-100 text-emerald-800",
			rejection: "bg-red-100 text-red-800",
			follow_up: "bg-purple-100 text-purple-800",
		};
		return colors[category] || "bg-gray-100 text-gray-800";
	};

	if (editorMode) {
		return (
			<EmailTemplateEditor
				template={editorMode === "edit" ? selectedTemplate : null}
				onClose={() => {
					setEditorMode(null);
					setSelectedTemplate(null);
				}}
				onSave={() => {
					setEditorMode(null);
					setSelectedTemplate(null);
				}}
			/>
		);
	}

	if (previewTemplate) {
		return (
			<EmailTemplatePreview
				template={previewTemplate}
				onClose={() => setPreviewTemplate(null)}
				onEdit={() => {
					setSelectedTemplate(previewTemplate);
					setPreviewTemplate(null);
					setEditorMode("edit");
				}}
			/>
		);
	}

	return (
		<DashboardLayout>
			<div className="space-y-6">
				{/* Page Header */}
				<div className="space-y-2">
					<h1 className="text-3xl font-bold tracking-tight">Email Templates</h1>
					<p className="text-muted-foreground">
						Manage your email communication templates
					</p>
				</div>

				{/* Header Actions */}
				<div className="flex flex-col sm:flex-row gap-4 justify-between">
					<div className="flex flex-col sm:flex-row gap-4 flex-1">
						{/* Search */}
						<div className="relative flex-1 max-w-md">
							<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								placeholder="Search templates..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="pl-10"
							/>
						</div>

						{/* Category Filter */}
						<Select
							value={selectedCategory || "all-categories"}
							onValueChange={(value) =>
								setSelectedCategory(
									value === "all-categories"
										? undefined
										: (value as TemplateCategory)
								)
							}
						>
							<SelectTrigger className="w-full sm:w-48 flex justify-start items-center [&>*:first-child]:flex [&>*:first-child]:items-center [&>*:first-child]:flex-1 [&>svg:last-child]:ml-auto">
								<div className="flex items-center flex-1">
									<Filter className="h-4 w-4 mr-2" />
									<SelectValue
										placeholder="All categories"
										className="text-left"
									/>
								</div>
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all-categories">All categories</SelectItem>
								{TEMPLATE_CATEGORIES.map((category) => (
									<SelectItem key={category.value} value={category.value}>
										{category.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						{/* Active Filter */}
						<Select
							value={showActiveOnly ? "active" : "all"}
							onValueChange={(value) => setShowActiveOnly(value === "active")}
						>
							<SelectTrigger className="w-full sm:w-32">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All</SelectItem>
								<SelectItem value="active">Active only</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Create Button */}
					<Button onClick={() => setEditorMode("create")} className="shrink-0">
						<Plus className="h-4 w-4 mr-2" />
						New Template
					</Button>
				</div>

				{/* Error State */}
				{error && (
					<Alert variant="destructive">
						<AlertDescription>
							Failed to load email templates. Please try again.
						</AlertDescription>
					</Alert>
				)}

				{/* Templates Grid */}
				{!isLoading && templates.length > 0 && (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{templates.map((template) => {
							const categoryInfo = getCategoryInfo(template.category);
							return (
								<Card
									key={template.id}
									className="hover:shadow-md transition-shadow flex flex-col"
								>
									<CardHeader className="pb-3 flex-shrink-0">
										<div className="space-y-3">
											<div className="min-w-0 max-w-full">
												<CardTitle className="text-lg break-words hyphens-auto leading-tight">
													{template.name}
												</CardTitle>
											</div>
											<div className="flex flex-wrap items-center gap-2">
												<Badge
													variant="secondary"
													className={`${getCategoryBadgeColor(
														template.category
													)} text-xs flex-shrink-0`}
												>
													{categoryInfo.label}
												</Badge>
												{template.isDefault && (
													<Badge
														variant="outline"
														className="text-xs flex-shrink-0"
													>
														Default
													</Badge>
												)}
												{!template.isActive && (
													<Badge
														variant="secondary"
														className="text-xs bg-gray-100 text-gray-600 flex-shrink-0"
													>
														Inactive
													</Badge>
												)}
											</div>
										</div>
										<p className="text-sm text-muted-foreground line-clamp-2 mt-2 break-words">
											{template.subject}
										</p>
									</CardHeader>
									<CardContent className="pt-0 flex-1 flex flex-col justify-end">
										<div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
											<span className="truncate">
												Used {template.usageCount} times
											</span>
											<span className="text-xs whitespace-nowrap ml-2">
												{new Date(template.updatedAt).toLocaleDateString()}
											</span>
										</div>

										<div className="flex gap-1.5">
											<Button
												variant="outline"
												size="sm"
												onClick={() => setPreviewTemplate(template)}
												className="flex-1 min-w-0"
											>
												<Eye className="h-4 w-4 mr-1 flex-shrink-0" />
												<span className="truncate">Preview</span>
											</Button>
											<Button
												variant="outline"
												size="sm"
												onClick={() => {
													setSelectedTemplate(template);
													setEditorMode("edit");
												}}
												className="flex-shrink-0"
											>
												<Edit className="h-4 w-4" />
											</Button>
											<Button
												variant="outline"
												size="sm"
												onClick={() => handleDuplicate(template)}
												disabled={duplicateTemplate.isPending}
												className="flex-shrink-0"
											>
												<Copy className="h-4 w-4" />
											</Button>
											<Button
												variant="outline"
												size="sm"
												onClick={() => handleDelete(template)}
												disabled={deleteTemplate.isPending}
												className="text-destructive hover:text-destructive flex-shrink-0"
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</CardContent>
								</Card>
							);
						})}
					</div>
				)}

				{/* Empty State */}
				{!isLoading && templates.length === 0 && (
					<Card>
						<CardContent className="flex flex-col items-center justify-center py-16">
							<Mail className="h-12 w-12 text-muted-foreground mb-4" />
							<h3 className="text-lg font-semibold mb-2">
								No email templates found
							</h3>
							<p className="text-muted-foreground text-center mb-6 max-w-md">
								{searchTerm || selectedCategory
									? "No templates match your current filters. Try adjusting your search criteria."
									: "Get started by creating your first email template to streamline your communication with candidates."}
							</p>
							<Button onClick={() => setEditorMode("create")}>
								<Plus className="h-4 w-4 mr-2" />
								Create Your First Template
							</Button>
						</CardContent>
					</Card>
				)}

				{/* Statistics */}
				{!isLoading && templates.length > 0 && (
					<Card>
						<CardHeader>
							<CardTitle>Template Statistics</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
								<div className="text-center">
									<div className="text-2xl font-bold text-primary">
										{templates.length}
									</div>
									<div className="text-sm text-muted-foreground">
										Total Templates
									</div>
								</div>
								<div className="text-center">
									<div className="text-2xl font-bold text-green-600">
										{templates.filter((t) => t.isActive).length}
									</div>
									<div className="text-sm text-muted-foreground">Active</div>
								</div>
								<div className="text-center">
									<div className="text-2xl font-bold text-blue-600">
										{templates.filter((t) => t.isDefault).length}
									</div>
									<div className="text-sm text-muted-foreground">Default</div>
								</div>
								<div className="text-center">
									<div className="text-2xl font-bold text-purple-600">
										{templates.reduce((sum, t) => sum + t.usageCount, 0)}
									</div>
									<div className="text-sm text-muted-foreground">
										Total Uses
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		</DashboardLayout>
	);
}
