"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
	type JobPost,
	type CreateJobPostData,
	EXPERIENCE_LEVELS,
	EMPLOYMENT_TYPES,
} from "@/app/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Plus, X, Save, XCircle } from "lucide-react";

const jobPostSchema = z.object({
	title: z.string().min(1, "Job title is required"),
	department: z.string().optional(),
	location: z.string().optional(),
	employmentType: z.enum(EMPLOYMENT_TYPES).optional(),
	experienceLevel: z.enum(EXPERIENCE_LEVELS).optional(),
	description: z.string().min(1, "Job description is required"),
	requirements: z.array(z.object({ value: z.string().min(1) })).optional(),
	responsibilities: z.array(z.object({ value: z.string().min(1) })).optional(),
	benefits: z.array(z.object({ value: z.string().min(1) })).optional(),
	salaryRange: z.string().optional(),
});

type JobPostFormData = z.infer<typeof jobPostSchema>;

interface JobPostFormProps {
	jobPost?: JobPost | null;
	onSave: (data: CreateJobPostData) => void;
	onCancel: () => void;
}

export function JobPostForm({ jobPost, onSave, onCancel }: JobPostFormProps) {
	const [isLoading, setIsLoading] = useState(false);

	const form = useForm<JobPostFormData>({
		resolver: zodResolver(jobPostSchema),
		defaultValues: {
			title: jobPost?.title || "",
			department: jobPost?.department || "",
			location: jobPost?.location || "",
			employmentType: jobPost?.employmentType || undefined,
			experienceLevel: jobPost?.experienceLevel || undefined,
			description: jobPost?.description || "",
			requirements: jobPost?.requirements?.map((req) => ({ value: req })) || [{ value: "" }],
			responsibilities: jobPost?.responsibilities?.map((resp) => ({ value: resp })) || [{ value: "" }],
			benefits: jobPost?.benefits?.map((benefit) => ({ value: benefit })) || [{ value: "" }],
			salaryRange: jobPost?.salaryRange || "",
		},
	});

	const {
		fields: requirementFields,
		append: appendRequirement,
		remove: removeRequirement,
	} = useFieldArray({
		control: form.control,
		name: "requirements",
	});

	const {
		fields: responsibilityFields,
		append: appendResponsibility,
		remove: removeResponsibility,
	} = useFieldArray({
		control: form.control,
		name: "responsibilities",
	});

	const {
		fields: benefitFields,
		append: appendBenefit,
		remove: removeBenefit,
	} = useFieldArray({
		control: form.control,
		name: "benefits",
	});

	const onSubmit = async (data: JobPostFormData) => {
		setIsLoading(true);
		try {
			const formattedData: CreateJobPostData = {
				title: data.title,
				department: data.department || undefined,
				location: data.location || undefined,
				employmentType: data.employmentType || undefined,
				experienceLevel: data.experienceLevel || undefined,
				description: data.description,
				requirements: data.requirements?.filter(req => req.value.trim()).map(req => req.value) || [],
				responsibilities: data.responsibilities?.filter(resp => resp.value.trim()).map(resp => resp.value) || [],
				benefits: data.benefits?.filter(benefit => benefit.value.trim()).map(benefit => benefit.value) || [],
				salaryRange: data.salaryRange || undefined,
			};
			onSave(formattedData);
		} catch (error) {
			console.error("Error submitting job post:", error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Card className="max-w-4xl mx-auto">
			<CardHeader>
				<CardTitle>{jobPost ? "Edit Job Post" : "Create New Job Post"}</CardTitle>
				<CardDescription>
					{jobPost ? "Update job posting details" : "Fill in the details for your new job posting"}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						{/* Basic Information */}
						<div className="space-y-4">
							<div className="space-y-2">
								<h3 className="text-lg font-medium">Basic Information</h3>
								<Separator />
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="title"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Job Title *</FormLabel>
											<FormControl>
												<Input placeholder="e.g., Software Engineer" disabled={isLoading} {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="department"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Department</FormLabel>
											<FormControl>
												<Input placeholder="e.g., Engineering" disabled={isLoading} {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="location"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Location</FormLabel>
											<FormControl>
												<Input placeholder="e.g., San Francisco, CA / Remote" disabled={isLoading} {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="salaryRange"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Salary Range</FormLabel>
											<FormControl>
												<Input placeholder="e.g., $80,000 - $120,000" disabled={isLoading} {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="employmentType"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Employment Type</FormLabel>
											<Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select employment type" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="full-time">Full-time</SelectItem>
													<SelectItem value="part-time">Part-time</SelectItem>
													<SelectItem value="contract">Contract</SelectItem>
													<SelectItem value="internship">Internship</SelectItem>
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="experienceLevel"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Experience Level</FormLabel>
											<Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select experience level" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="entry">Entry Level</SelectItem>
													<SelectItem value="mid">Mid Level</SelectItem>
													<SelectItem value="senior">Senior Level</SelectItem>
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</div>

						{/* Job Description */}
						<div className="space-y-4">
							<div className="space-y-2">
								<h3 className="text-lg font-medium">Job Description</h3>
								<Separator />
							</div>

							<FormField
								control={form.control}
								name="description"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Description *</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Describe the role, company culture, and what makes this position exciting..."
												className="min-h-[120px] resize-none"
												disabled={isLoading}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						{/* Requirements */}
						<div className="space-y-4">
							<div className="space-y-2">
								<h3 className="text-lg font-medium">Requirements</h3>
								<Separator />
								<p className="text-sm text-muted-foreground">
									List the key qualifications and skills required for this position
								</p>
							</div>

							<div className="space-y-3">
								{requirementFields.map((field, index) => (
									<div key={field.id} className="flex gap-2">
										<FormField
											control={form.control}
											name={`requirements.${index}.value`}
											render={({ field }) => (
												<FormItem className="flex-1">
													<FormControl>
														<Input
															placeholder={`Requirement ${index + 1}`}
															disabled={isLoading}
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={() => removeRequirement(index)}
											disabled={isLoading || requirementFields.length <= 1}
											className="shrink-0"
										>
											<X className="h-4 w-4" />
										</Button>
									</div>
								))}
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => appendRequirement({ value: "" })}
									disabled={isLoading}
									className="w-full"
								>
									<Plus className="h-4 w-4 mr-2" />
									Add Requirement
								</Button>
							</div>
						</div>

						{/* Responsibilities */}
						<div className="space-y-4">
							<div className="space-y-2">
								<h3 className="text-lg font-medium">Responsibilities</h3>
								<Separator />
								<p className="text-sm text-muted-foreground">
									Outline the key duties and responsibilities for this role
								</p>
							</div>

							<div className="space-y-3">
								{responsibilityFields.map((field, index) => (
									<div key={field.id} className="flex gap-2">
										<FormField
											control={form.control}
											name={`responsibilities.${index}.value`}
											render={({ field }) => (
												<FormItem className="flex-1">
													<FormControl>
														<Input
															placeholder={`Responsibility ${index + 1}`}
															disabled={isLoading}
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={() => removeResponsibility(index)}
											disabled={isLoading || responsibilityFields.length <= 1}
											className="shrink-0"
										>
											<X className="h-4 w-4" />
										</Button>
									</div>
								))}
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => appendResponsibility({ value: "" })}
									disabled={isLoading}
									className="w-full"
								>
									<Plus className="h-4 w-4 mr-2" />
									Add Responsibility
								</Button>
							</div>
						</div>

						{/* Benefits */}
						<div className="space-y-4">
							<div className="space-y-2">
								<h3 className="text-lg font-medium">Benefits & Perks</h3>
								<Separator />
								<p className="text-sm text-muted-foreground">
									Highlight the benefits and perks that come with this position
								</p>
							</div>

							<div className="space-y-3">
								{benefitFields.map((field, index) => (
									<div key={field.id} className="flex gap-2">
										<FormField
											control={form.control}
											name={`benefits.${index}.value`}
											render={({ field }) => (
												<FormItem className="flex-1">
													<FormControl>
														<Input
															placeholder={`Benefit ${index + 1}`}
															disabled={isLoading}
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={() => removeBenefit(index)}
											disabled={isLoading || benefitFields.length <= 1}
											className="shrink-0"
										>
											<X className="h-4 w-4" />
										</Button>
									</div>
								))}
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => appendBenefit({ value: "" })}
									disabled={isLoading}
									className="w-full"
								>
									<Plus className="h-4 w-4 mr-2" />
									Add Benefit
								</Button>
							</div>
						</div>

						{/* Action Buttons */}
						<div className="flex items-center justify-end gap-3 pt-6 border-t">
							<Button
								type="button"
								variant="outline"
								onClick={onCancel}
								disabled={isLoading}
							>
								<XCircle className="h-4 w-4 mr-2" />
								Cancel
							</Button>
							<Button type="submit" disabled={isLoading}>
								<Save className="h-4 w-4 mr-2" />
								{isLoading ? "Saving..." : jobPost ? "Update Job Post" : "Create Job Post"}
							</Button>
						</div>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}