"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
	Upload, 
	BrainCircuit, 
	MessageSquare, 
	ArrowRight,
	CheckCircle2
} from "lucide-react";

const steps = [
	{
		number: "01",
		icon: Upload,
		title: "Upload & Extract",
		description: "Drag and drop resumes in bulk. Our AI automatically extracts candidate information, skills, and experience.",
		details: [
			"Support for PDF and DOCX files",
			"Mistral AI-powered data extraction",
			"Automatic duplicate detection",
			"Structured candidate profiles"
		],
		color: "text-primary"
	},
	{
		number: "02", 
		icon: MessageSquare,
		title: "Review & Communicate",
		description: "Preview and send personalized emails to candidates with professional templates.",
		details: [
			"Multiple email templates",
			"Personalized content per candidate",
			"Bulk sending with rate limiting",
			"Delivery tracking and analytics"
		],
		color: "text-secondary"
	},
	{
		number: "03",
		icon: BrainCircuit,
		title: "Interview & Decide",
		description: "Generate AI-powered interview questions and conduct live interviews with real-time assistance.",
		details: [
			"Role-specific question generation",
			"Live speech transcription",
			"Dynamic follow-up suggestions", 
			"Interview session recording"
		],
		color: "text-purple-500"
	}
];

export function HowItWorks() {
	return (
		<section className="space-y-12">
			{/* Section Header */}
			<div className="text-center space-y-4">
				<Badge variant="outline" className="px-4 py-2">
					Simple 3-Step Process
				</Badge>
				<h2 className="text-3xl md:text-4xl font-bold tracking-tight">
					From resume to hire in minutes
				</h2>
				<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
					Our streamlined workflow automates the repetitive tasks while keeping you in control of the important decisions
				</p>
			</div>

			{/* Steps */}
			<div className="space-y-8 md:space-y-0 md:grid md:grid-cols-3 md:gap-8">
				{steps.map((step, index) => {
					const Icon = step.icon;
					const isLast = index === steps.length - 1;
					
					return (
						<div key={index} className="relative">
							{/* Connector Line - Hidden on mobile, shown on desktop */}
							{!isLast && (
								<div className="hidden md:block absolute top-16 left-full w-8 h-0.5 bg-border z-0">
									<ArrowRight className="absolute -top-2 right-0 w-4 h-4 text-muted-foreground" />
								</div>
							)}

							<Card className="relative z-10 border-muted hover:border-primary/20 transition-all duration-300 hover:shadow-lg">
								<CardContent className="p-6 space-y-6">
									{/* Step Header */}
									<div className="flex items-center gap-4">
										<div className={`w-12 h-12 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl flex items-center justify-center`}>
											<Icon className={`w-6 h-6 ${step.color}`} />
										</div>
										<div className="space-y-1">
											<div className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
												Step {step.number}
											</div>
											<h3 className="text-xl font-semibold">{step.title}</h3>
										</div>
									</div>

									{/* Description */}
									<p className="text-muted-foreground leading-relaxed">
										{step.description}
									</p>

									{/* Feature List */}
									<ul className="space-y-2">
										{step.details.map((detail, detailIndex) => (
											<li key={detailIndex} className="flex items-start gap-2 text-sm">
												<CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
												<span className="text-muted-foreground">{detail}</span>
											</li>
										))}
									</ul>
								</CardContent>
							</Card>
						</div>
					);
				})}
			</div>

			{/* Bottom CTA */}
			<div className="text-center pt-8">
				<div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-purple-500/10 rounded-xl p-8 space-y-4">
					<h3 className="text-2xl font-bold">Ready to streamline your hiring?</h3>
					<p className="text-muted-foreground max-w-lg mx-auto">
						Join the revolution of AI-powered hiring and save hours of manual work
					</p>
					<div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
						<Badge variant="secondary" className="px-3 py-1">
							✨ No setup fees
						</Badge>
						<Badge variant="secondary" className="px-3 py-1">
							🔒 Self-hosted
						</Badge>
						<Badge variant="secondary" className="px-3 py-1">
							🚀 Open source
						</Badge>
					</div>
				</div>
			</div>
		</section>
	);
}