"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
	BrainCircuit,
	FileText,
	Users,
	CheckCircle,
	AlertCircle,
	Lightbulb,
	Video,
} from "lucide-react";
import { useInterviewAssistant } from "@/app/interview-assistant/mutations/use-generate-interview-questions";
import { invalidateResumeFiles } from "@/app/interview-assistant/queries/use-resume-files";
import { CallToActionCard } from "@/app/components/landing/call-to-action-card";

const generateQuestionsSchema = z.object({
	applicantId: z.string().min(1, "Please select an applicant"),
	jobPostId: z.string().min(1, "Please select a job post"),
	resumeFileId: z.string().min(1, "Please select a resume"),
	questionCount: z.coerce.number().min(1).max(20),
	focusAreas: z
		.array(z.enum(["technical", "experience", "soft_skills", "verification"]))
		.optional(),
});

type GenerateQuestionsForm = z.infer<typeof generateQuestionsSchema>;

interface InterviewAssistantProps {
	applicants: Array<{
		id: string;
		firstName: string;
		lastName: string;
		email: string;
		jobPostId?: string | null;
	}>;
	jobPosts: Array<{
		id: string;
		title: string;
		department?: string | null;
	}>;
	resumeFiles: Array<{
		id: string;
		fileName: string;
		applicantId: string;
		jobPostId?: string | null;
	}>;
}

const focusAreaOptions = [
	{ value: "technical", label: "Technical Skills", icon: BrainCircuit },
	{ value: "experience", label: "Experience", icon: FileText },
	{ value: "soft_skills", label: "Soft Skills", icon: Users },
	{ value: "verification", label: "Verification", icon: CheckCircle },
] as const;

const categoryColors = {
	technical: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
	experience:
		"bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
	soft_skills:
		"bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
	verification:
		"bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
};

export function InterviewAssistant({
	applicants,
	jobPosts,
	resumeFiles,
}: InterviewAssistantProps) {
	const [selectedFocusAreas, setSelectedFocusAreas] = useState<string[]>([]);
	const { generateQuestions, isGenerating, error, data, isSuccess, reset } =
		useInterviewAssistant();

	const form = useForm<GenerateQuestionsForm>({
		resolver: zodResolver(generateQuestionsSchema),
		defaultValues: {
			questionCount: 10,
			focusAreas: [],
		},
	});

	const selectedApplicantId = form.watch("applicantId");
	const selectedJobPostId = form.watch("jobPostId");

	// Filter resumes based on selected applicant and job post
	const availableResumes = resumeFiles.filter(
		(resume) =>
			resume.applicantId === selectedApplicantId &&
			(!selectedJobPostId || resume.jobPostId === selectedJobPostId)
	);

	const onSubmit = (data: GenerateQuestionsForm) => {
		generateQuestions({
			...data,
			focusAreas:
				selectedFocusAreas.length > 0
					? (selectedFocusAreas as (
							| "technical"
							| "experience"
							| "soft_skills"
							| "verification"
					  )[])
					: undefined,
		});
	};

	const handleFocusAreaToggle = (area: string) => {
		setSelectedFocusAreas((prev) =>
			prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
		);
	};

	const handleReset = () => {
		reset();
		form.reset();
		setSelectedFocusAreas([]);
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<BrainCircuit className="h-5 w-5" />
						Interview Assistant
					</CardTitle>
					<CardDescription>
						Generate tailored interview questions based on job requirements and
						candidate resumes
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="applicantId"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Applicant</FormLabel>
											<Select
												onValueChange={field.onChange}
												value={field.value}
											>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select applicant" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{applicants.map((applicant) => (
														<SelectItem key={applicant.id} value={applicant.id}>
															{applicant.firstName} {applicant.lastName} (
															{applicant.email})
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="jobPostId"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Job Post</FormLabel>
											<Select
												onValueChange={(value) => {
													field.onChange(value);
													// Invalidate resume files query to refetch resumes for the new job post
													invalidateResumeFiles();
												}}
												value={field.value}
											>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select job post" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{jobPosts.map((jobPost) => (
														<SelectItem key={jobPost.id} value={jobPost.id}>
															{jobPost.title}
															{jobPost.department && ` - ${jobPost.department}`}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="resumeFileId"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Resume</FormLabel>
											<Select
												onValueChange={field.onChange}
												value={field.value}
												disabled={!selectedApplicantId}
											>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select resume" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{availableResumes.map((resume) => (
														<SelectItem key={resume.id} value={resume.id}>
															{resume.fileName}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="questionCount"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Number of Questions</FormLabel>
											<Select
												onValueChange={(value) => field.onChange(Number(value))}
												value={field.value?.toString()}
											>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select count" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{[5, 8, 10, 12, 15, 20].map((count) => (
														<SelectItem key={count} value={count.toString()}>
															{count} questions
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div>
								<FormLabel>Focus Areas (Optional)</FormLabel>
								<div className="flex flex-wrap gap-2 mt-2">
									{focusAreaOptions.map(({ value, label, icon: Icon }) => (
										<Badge
											key={value}
											variant={
												selectedFocusAreas.includes(value)
													? "default"
													: "outline"
											}
											className="cursor-pointer"
											onClick={() => handleFocusAreaToggle(value)}
										>
											<Icon className="h-3 w-3 mr-1" />
											{label}
										</Badge>
									))}
								</div>
							</div>

							<div className="flex gap-3">
								<Button
									type="submit"
									disabled={isGenerating}
									className="flex items-center gap-2"
								>
									<Lightbulb className="h-4 w-4" />
									{isGenerating ? "Generating..." : "Generate Questions"}
								</Button>
								{(isSuccess || error) && (
									<Button type="button" variant="outline" onClick={handleReset}>
										Reset
									</Button>
								)}
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>

			{error && (
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>{error.message}</AlertDescription>
				</Alert>
			)}

			{isSuccess && data && (
				<Card>
					<CardHeader>
						<CardTitle>Generated Interview Questions</CardTitle>
						<CardDescription>
							Questions for {data.applicant.name} - {data.jobPost.title}
							{data.jobPost.department && ` (${data.jobPost.department})`}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-6">
							{data.questions.map((question, index) => (
								<div key={index} className="border rounded-lg p-4">
									<div className="flex items-start justify-between gap-3 mb-3">
										<h4 className="font-medium text-lg">
											{index + 1}. {question.question}
										</h4>
										<Badge className={categoryColors[question.category]}>
											{question.category.replace("_", " ")}
										</Badge>
									</div>

									<div className="space-y-3 text-sm">
										<div>
											<span className="font-medium text-muted-foreground">
												Reasoning:
											</span>
											<p className="mt-1">{question.reasoning}</p>
										</div>

										<Separator />

										<div>
											<span className="font-medium text-muted-foreground">
												Expected Response:
											</span>
											<p className="mt-1">{question.expectedResponse}</p>
										</div>

										<Separator />

										<div>
											<span className="font-medium text-muted-foreground">
												Example Response:
											</span>
											<p className="mt-1 italic text-muted-foreground/80">{question.exampleResponse}</p>
										</div>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Live Interview Call-to-Action */}
			{data?.questions && data.questions.length > 0 && (
				<CallToActionCard
					title="Ready for the Interview?"
					description="Take your questions to the next level with real-time AI assistance"
					href="/live-interview"
					icon={Video}
					buttonText="Start Live Interview"
					features={[
						"Get real-time question suggestions during the interview",
						"Receive AI-powered conversation analysis",
						"Track interview progress with live transcription",
						"Generate follow-up questions based on candidate responses"
					]}
				/>
			)}
		</div>
	);
}
