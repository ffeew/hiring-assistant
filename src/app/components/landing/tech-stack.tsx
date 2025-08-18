"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
	Code2, 
	Database, 
	Shield, 
	Zap,
	Palette,
	Bot,
	Cloud
} from "lucide-react";

const techCategories = [
	{
		icon: Code2,
		title: "Modern Frontend",
		description: "Built with the latest React and Next.js technologies",
		techs: [
			{ name: "Next.js 15", description: "App Router with React Server Components" },
			{ name: "React 19", description: "Latest React with concurrent features" },
			{ name: "TypeScript 5", description: "Type-safe development" },
			{ name: "Tailwind CSS v4", description: "Utility-first styling" }
		],
		color: "text-blue-500"
	},
	{
		icon: Database,
		title: "Robust Backend",
		description: "Type-safe database operations with modern ORM",
		techs: [
			{ name: "Drizzle ORM", description: "Type-safe SQL toolkit" },
			{ name: "Turso/LibSQL", description: "Serverless SQLite database" },
			{ name: "Better Auth", description: "Secure authentication system" },
			{ name: "Zod Validation", description: "Runtime type validation" }
		],
		color: "text-green-500"
	},
	{
		icon: Bot,
		title: "AI Integration",
		description: "Cutting-edge AI models for intelligent automation",
		techs: [
			{ name: "Mistral AI", description: "Resume parsing and OCR" },
			{ name: "Groq AI", description: "Interview question generation" },
			{ name: "Web Speech API", description: "Real-time transcription" },
			{ name: "AI SDK", description: "Unified AI interface" }
		],
		color: "text-purple-500"
	},
	{
		icon: Palette,
		title: "Design System",
		description: "Accessible, beautiful UI components",
		techs: [
			{ name: "shadcn/ui", description: "High-quality component library" },
			{ name: "Radix UI", description: "Accessible UI primitives" },
			{ name: "Lucide Icons", description: "Beautiful icon system" },
			{ name: "next-themes", description: "Dark/light mode support" }
		],
		color: "text-pink-500"
	},
	{
		icon: Shield,
		title: "Security & Privacy",
		description: "Enterprise-grade security measures",
		techs: [
			{ name: "AES-256-GCM", description: "Data encryption at rest" },
			{ name: "PBKDF2", description: "Secure key derivation" },
			{ name: "Session Management", description: "Secure user sessions" },
			{ name: "Data Isolation", description: "User-specific data access" }
		],
		color: "text-red-500"
	},
	{
		icon: Cloud,
		title: "Cloud Infrastructure",
		description: "Scalable storage and communication services",
		techs: [
			{ name: "Cloudflare R2", description: "Resume file storage" },
			{ name: "Gmail SMTP", description: "Reliable email delivery" },
			{ name: "Vercel Ready", description: "Deploy anywhere" },
			{ name: "TanStack Query", description: "Smart data fetching" }
		],
		color: "text-orange-500"
	}
];

export function TechStack() {
	return (
		<section className="space-y-12">
			{/* Section Header */}
			<div className="text-center space-y-4">
				<Badge variant="outline" className="px-4 py-2">
					<Code2 className="w-4 h-4 mr-2" />
					Built with Modern Tech
				</Badge>
				<h2 className="text-3xl md:text-4xl font-bold tracking-tight">
					Enterprise-grade technology stack
				</h2>
				<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
					Built on proven technologies that scale from prototype to production, with security and performance in mind
				</p>
			</div>

			{/* Tech Grid */}
			<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
				{techCategories.map((category, index) => {
					const Icon = category.icon;
					return (
						<Card key={index} className="border-muted hover:border-primary/20 transition-all duration-300 hover:shadow-lg">
							<CardHeader className="pb-3">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center">
										<Icon className={`w-5 h-5 ${category.color}`} />
									</div>
									<div>
										<CardTitle className="text-lg">{category.title}</CardTitle>
									</div>
								</div>
								<p className="text-sm text-muted-foreground">
									{category.description}
								</p>
							</CardHeader>
							<CardContent className="pt-0 space-y-3">
								{category.techs.map((tech, techIndex) => (
									<div key={techIndex} className="flex items-start gap-3 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
										<div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
										<div className="space-y-1">
											<div className="text-sm font-medium">{tech.name}</div>
											<div className="text-xs text-muted-foreground">{tech.description}</div>
										</div>
									</div>
								))}
							</CardContent>
						</Card>
					);
				})}
			</div>

			{/* Performance Highlights */}
			<div className="bg-gradient-to-r from-primary/5 via-secondary/5 to-purple-500/5 rounded-xl p-8">
				<div className="text-center space-y-6">
					<h3 className="text-2xl font-bold">Performance & Reliability</h3>
					
					<div className="grid md:grid-cols-4 gap-6">
						<div className="space-y-2">
							<div className="w-12 h-12 mx-auto bg-blue-500/10 rounded-lg flex items-center justify-center">
								<Zap className="w-6 h-6 text-blue-500" />
							</div>
							<div className="text-lg font-semibold">Type Safe</div>
							<div className="text-sm text-muted-foreground">End-to-end TypeScript</div>
						</div>
						
						<div className="space-y-2">
							<div className="w-12 h-12 mx-auto bg-green-500/10 rounded-lg flex items-center justify-center">
								<Database className="w-6 h-6 text-green-500" />
							</div>
							<div className="text-lg font-semibold">Scalable</div>
							<div className="text-sm text-muted-foreground">Serverless architecture</div>
						</div>
						
						<div className="space-y-2">
							<div className="w-12 h-12 mx-auto bg-purple-500/10 rounded-lg flex items-center justify-center">
								<Bot className="w-6 h-6 text-purple-500" />
							</div>
							<div className="text-lg font-semibold">AI-First</div>
							<div className="text-sm text-muted-foreground">Built for automation</div>
						</div>
						
						<div className="space-y-2">
							<div className="w-12 h-12 mx-auto bg-red-500/10 rounded-lg flex items-center justify-center">
								<Shield className="w-6 h-6 text-red-500" />
							</div>
							<div className="text-lg font-semibold">Secure</div>
							<div className="text-sm text-muted-foreground">Enterprise encryption</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}