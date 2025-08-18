"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
	FileText, 
	BrainCircuit, 
	Mail, 
	Video,
	Database,
	Shield
} from "lucide-react";

const features = [
	{
		icon: FileText,
		title: "Smart Resume Processing",
		description: "Bulk upload PDF/DOCX resumes with AI-powered data extraction using Mistral AI",
		features: [
			"Drag & drop bulk upload",
			"AI-powered OCR extraction", 
			"Duplicate detection",
			"Skills & experience parsing"
		],
		badge: "AI-Powered"
	},
	{
		icon: BrainCircuit,
		title: "Interview Assistant", 
		description: "Generate intelligent interview questions tailored to each candidate and role",
		features: [
			"Role-specific questions",
			"Candidate-tailored queries",
			"Follow-up suggestions",
			"Interview preparation"
		],
		badge: "Groq AI"
	},
	{
		icon: Video,
		title: "Live Interview Support",
		description: "Real-time transcription and AI assistance during interviews",
		features: [
			"Speech-to-text transcription",
			"Dynamic question suggestions", 
			"Session recording",
			"Interview analysis"
		],
		badge: "Real-time"
	},
	{
		icon: Mail,
		title: "Automated Communication",
		description: "Send personalized emails with professional templates and tracking",
		features: [
			"Multiple email templates",
			"Bulk sending with rate limiting",
			"Gmail SMTP integration",
			"Delivery tracking"
		],
		badge: "Template-based"
	},
	{
		icon: Database,
		title: "Candidate Management",
		description: "Complete applicant tracking with status management and pipeline",
		features: [
			"Application status tracking",
			"Candidate database",
			"Job post associations",
			"Activity logging"
		],
		badge: "ATS Features"
	},
	{
		icon: Shield,
		title: "Security & Privacy",
		description: "Enterprise-grade security with data encryption and user isolation",
		features: [
			"AES-256-GCM encryption",
			"Session management",
			"Data isolation",
			"Secure file storage"
		],
		badge: "Enterprise-grade"
	}
];

export function FeatureShowcase() {
	return (
		<section className="space-y-12">
			{/* Section Header */}
			<div className="text-center space-y-4">
				<h2 className="text-3xl md:text-4xl font-bold tracking-tight">
					Everything you need to hire better
				</h2>
				<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
					From resume screening to live interviews, our AI-powered platform automates the tedious parts while keeping the human touch where it matters
				</p>
			</div>

			{/* Features Grid */}
			<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
				{features.map((feature, index) => {
					const Icon = feature.icon;
					return (
						<Card key={index} className="relative overflow-hidden border-muted hover:border-primary/20 transition-all duration-300 hover:shadow-lg">
							<CardHeader className="pb-3">
								<div className="flex items-start justify-between">
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
											<Icon className="w-5 h-5 text-primary" />
										</div>
										<div className="space-y-1">
											<CardTitle className="text-lg">{feature.title}</CardTitle>
											<Badge variant="secondary" className="text-xs">
												{feature.badge}
											</Badge>
										</div>
									</div>
								</div>
								<p className="text-sm text-muted-foreground leading-relaxed">
									{feature.description}
								</p>
							</CardHeader>
							<CardContent className="pt-0">
								<ul className="space-y-2">
									{feature.features.map((item, itemIndex) => (
										<li key={itemIndex} className="flex items-start gap-2 text-sm">
											<div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
											<span className="text-muted-foreground">{item}</span>
										</li>
									))}
								</ul>
							</CardContent>
						</Card>
					);
				})}
			</div>

			{/* Stats Section */}
			<div className="bg-card/50 border border-border rounded-xl p-8 mt-16">
				<div className="grid md:grid-cols-4 gap-8 text-center">
					<div className="space-y-2">
						<div className="text-3xl font-bold text-primary">80%</div>
						<div className="text-sm text-muted-foreground">Time Saved</div>
					</div>
					<div className="space-y-2">
						<div className="text-3xl font-bold text-secondary">100+</div>
						<div className="text-sm text-muted-foreground">Resumes/Hour</div>
					</div>
					<div className="space-y-2">
						<div className="text-3xl font-bold text-purple-500">24/7</div>
						<div className="text-sm text-muted-foreground">AI Assistance</div>
					</div>
					<div className="space-y-2">
						<div className="text-3xl font-bold text-orange-500">$0</div>
						<div className="text-sm text-muted-foreground">Monthly Cost</div>
					</div>
				</div>
			</div>
		</section>
	);
}