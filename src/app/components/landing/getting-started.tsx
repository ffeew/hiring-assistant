"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	Download,
	Settings,
	Rocket,
	Terminal,
	Copy,
	ExternalLink,
	CheckCircle2,
	Clock,
	Book,
	MessageCircle,
	ArrowRight,
} from "lucide-react";
import { useState } from "react";

const setupSteps = [
	{
		number: "01",
		icon: Download,
		title: "Clone & Install",
		time: "2 minutes",
		description: "Get the code and install dependencies",
		commands: [
			"git clone https://github.com/ffeew/hiring-assistant.git",
			"cd hiring-assistant",
			"npm install",
		],
	},
	{
		number: "02",
		icon: Settings,
		title: "Configure Environment",
		time: "5 minutes",
		description: "Set up API keys and database connection",
		commands: [
			"cp .env.example .env.local",
			"# Add your API keys to .env.local",
			"npx drizzle-kit generate && npx drizzle-kit migrate",
		],
	},
	{
		number: "03",
		icon: Rocket,
		title: "Launch Application",
		time: "1 minute",
		description: "Start the development server",
		commands: [
			"npm run dev",
			"# Open http://localhost:3000",
			"# Sign up and start hiring! 🎉",
		],
	},
];

const requirements = [
	{ name: "Node.js 18+", icon: "⚡", required: true },
	{ name: "Gmail Account", icon: "✉️", required: false },
	{ name: "Mistral AI API Key", icon: "🤖", required: true },
	{ name: "Groq API Key", icon: "🧠", required: true },
	{ name: "Turso Database", icon: "💾", required: true },
	{ name: "Cloudflare R2", icon: "☁️", required: true },
];

export function GettingStarted() {
	const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text);
		setCopiedCommand(text);
		setTimeout(() => setCopiedCommand(null), 2000);
	};

	return (
		<section className="space-y-12">
			{/* Section Header */}
			<div className="text-center space-y-4">
				<Badge variant="outline" className="px-4 py-2">
					<Rocket className="w-4 h-4 mr-2" />
					Quick Setup
				</Badge>
				<h2 className="text-3xl md:text-4xl font-bold tracking-tight">
					Get started in under 10 minutes
				</h2>
				<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
					Follow our simple setup guide to have your AI hiring assistant running
					locally
				</p>
			</div>

			{/* Prerequisites */}
			<Card className="border-muted">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<CheckCircle2 className="w-5 h-5 text-primary" />
						Prerequisites
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
						{requirements.map((req, index) => (
							<div
								key={index}
								className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
							>
								<span className="text-lg">{req.icon}</span>
								<div className="flex-1">
									<span className="text-sm font-medium">{req.name}</span>
									{req.required && (
										<Badge variant="secondary" className="ml-2 text-xs">
											Required
										</Badge>
									)}
									{!req.required && (
										<Badge variant="outline" className="ml-2 text-xs">
											Optional
										</Badge>
									)}
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Setup Steps */}
			<div className="space-y-6">
				{setupSteps.map((step, index) => {
					const Icon = step.icon;
					return (
						<Card
							key={index}
							className="border-muted hover:border-primary/20 transition-all duration-300"
						>
							<CardContent className="p-6">
								<div className="flex items-start gap-6">
									{/* Step Icon & Number */}
									<div className="flex-shrink-0 space-y-3">
										<div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
											<Icon className="w-6 h-6 text-primary" />
										</div>
										<div className="text-center">
											<div className="text-xs font-mono text-muted-foreground">
												STEP
											</div>
											<div className="text-lg font-bold">{step.number}</div>
										</div>
									</div>

									{/* Step Content */}
									<div className="flex-1 space-y-4">
										<div className="flex items-center gap-3">
											<h3 className="text-xl font-semibold">{step.title}</h3>
											<Badge variant="secondary" className="text-xs">
												<Clock className="w-3 h-3 mr-1" />
												{step.time}
											</Badge>
										</div>

										<p className="text-muted-foreground">{step.description}</p>

										{/* Commands */}
										<div className="space-y-2">
											{step.commands.map((command, cmdIndex) => (
												<div key={cmdIndex} className="group relative">
													<div className="bg-slate-900 text-slate-100 rounded-lg p-3 font-mono text-sm overflow-x-auto">
														<div className="flex items-center justify-between">
															<code className="flex-1">{command}</code>
															{!command.startsWith("#") && (
																<Button
																	variant="ghost"
																	size="sm"
																	className="ml-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-100"
																	onClick={() => copyToClipboard(command)}
																>
																	{copiedCommand === command ? (
																		<CheckCircle2 className="w-3 h-3" />
																	) : (
																		<Copy className="w-3 h-3" />
																	)}
																</Button>
															)}
														</div>
													</div>
												</div>
											))}
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>

			{/* Support Resources */}
			<div className="bg-gradient-to-r from-primary/5 via-secondary/5 to-purple-500/5 rounded-xl p-8">
				<div className="text-center space-y-6">
					<h3 className="text-2xl font-bold">Need help?</h3>
					<p className="text-muted-foreground max-w-lg mx-auto">
						Our comprehensive documentation and community support will get you
						up and running
					</p>

					<div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto">
						<a
							href="https://github.com/ffeew/hiring-assistant/blob/main/README.md"
							target="_blank"
							rel="noopener noreferrer"
							className="group"
						>
							<Card className="border-muted hover:border-primary/20 transition-colors cursor-pointer">
								<CardContent className="p-4 text-center space-y-2">
									<Book className="w-6 h-6 mx-auto text-primary" />
									<div className="font-medium">Documentation</div>
									<div className="text-xs text-muted-foreground">
										Setup guides & API docs
									</div>
									<ExternalLink className="w-3 h-3 mx-auto opacity-0 group-hover:opacity-100 transition-opacity" />
								</CardContent>
							</Card>
						</a>

						<a
							href="https://github.com/ffeew/hiring-assistant/issues"
							target="_blank"
							rel="noopener noreferrer"
							className="group"
						>
							<Card className="border-muted hover:border-primary/20 transition-colors cursor-pointer">
								<CardContent className="p-4 text-center space-y-2">
									<MessageCircle className="w-6 h-6 mx-auto text-secondary" />
									<div className="font-medium">GitHub Issues</div>
									<div className="text-xs text-muted-foreground">
										Report bugs & get help
									</div>
									<ExternalLink className="w-3 h-3 mx-auto opacity-0 group-hover:opacity-100 transition-opacity" />
								</CardContent>
							</Card>
						</a>

						<a
							href="https://github.com/ffeew/hiring-assistant/discussions"
							target="_blank"
							rel="noopener noreferrer"
							className="group"
						>
							<Card className="border-muted hover:border-primary/20 transition-colors cursor-pointer">
								<CardContent className="p-4 text-center space-y-2">
									<Terminal className="w-6 h-6 mx-auto text-purple-500" />
									<div className="font-medium">Community</div>
									<div className="text-xs text-muted-foreground">
										Join discussions
									</div>
									<ExternalLink className="w-3 h-3 mx-auto opacity-0 group-hover:opacity-100 transition-opacity" />
								</CardContent>
							</Card>
						</a>
					</div>

					{/* Final CTA */}
					<div className="pt-4">
						<p className="text-sm text-muted-foreground mb-4">
							Ready to revolutionize your hiring process?
						</p>
						<Button size="lg" asChild>
							<a href="https://github.com/ffeew/hiring-assistant">
								<Download className="w-4 h-4 mr-2" />
								Get Started Now
								<ArrowRight className="w-4 h-4 ml-2" />
							</a>
						</Button>
					</div>
				</div>
			</div>
		</section>
	);
}
