"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
	BrainCircuit,
	FileText,
	Mail,
	Github,
	ArrowRight,
	Sparkles,
	Users,
	Clock,
} from "lucide-react";
import Link from "next/link";

export function HeroSection() {
	return (
		<section className="text-center space-y-8 py-12">
			{/* Badge */}
			<div className="flex justify-center">
				<Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
					<Sparkles className="w-4 h-4 mr-2" />
					Free & Open Source
				</Badge>
			</div>

			{/* Main Headline */}
			<div className="space-y-4 max-w-4xl mx-auto">
				<h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
					AI-Powered Hiring Assistant
				</h1>
				<p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
					Automate resume processing, generate intelligent interview questions,
					and streamline candidate communication with AI
				</p>
			</div>

			{/* Key Benefits */}
			<div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
				<div className="flex items-center gap-2">
					<Clock className="w-4 h-4 text-primary" />
					<span>Save 80% of screening time</span>
				</div>
				<div className="flex items-center gap-2">
					<Users className="w-4 h-4 text-secondary" />
					<span>Process 100+ resumes in minutes</span>
				</div>
				<div className="flex items-center gap-2">
					<BrainCircuit className="w-4 h-4 text-purple-500" />
					<span>AI-powered insights</span>
				</div>
			</div>

			{/* CTA Buttons */}
			<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
				<Link href="/signup">
					<Button size="lg" className="px-8 py-6 text-lg font-semibold">
						Get Started Free
						<ArrowRight className="w-5 h-5 ml-2" />
					</Button>
				</Link>
				<a
					href="https://github.com/ffeew/hiring-assistant"
					target="_blank"
					rel="noopener noreferrer"
				>
					<Button variant="outline" size="lg" className="px-8 py-6 text-lg">
						<Github className="w-5 h-5 mr-2" />
						View on GitHub
					</Button>
				</a>
			</div>

			{/* Feature Preview Cards */}
			<div className="grid md:grid-cols-3 gap-6 mt-16 max-w-5xl mx-auto">
				<Card className="border-primary/20 hover:border-primary/40 transition-colors">
					<CardContent className="p-6 text-center space-y-3">
						<div className="w-12 h-12 mx-auto bg-primary/10 rounded-lg flex items-center justify-center">
							<FileText className="w-6 h-6 text-primary" />
						</div>
						<h3 className="font-semibold">Smart Resume Processing</h3>
						<p className="text-sm text-muted-foreground">
							Upload bulk resumes and extract candidate data with AI-powered OCR
						</p>
					</CardContent>
				</Card>

				<Card className="border-secondary/20 hover:border-secondary/40 transition-colors">
					<CardContent className="p-6 text-center space-y-3">
						<div className="w-12 h-12 mx-auto bg-secondary/10 rounded-lg flex items-center justify-center">
							<BrainCircuit className="w-6 h-6 text-secondary" />
						</div>
						<h3 className="font-semibold">AI Interview Assistant</h3>
						<p className="text-sm text-muted-foreground">
							Generate relevant questions and get real-time interview assistance
						</p>
					</CardContent>
				</Card>

				<Card className="border-purple-500/20 hover:border-purple-500/40 transition-colors">
					<CardContent className="p-6 text-center space-y-3">
						<div className="w-12 h-12 mx-auto bg-purple-500/10 rounded-lg flex items-center justify-center">
							<Mail className="w-6 h-6 text-purple-500" />
						</div>
						<h3 className="font-semibold">Automated Communication</h3>
						<p className="text-sm text-muted-foreground">
							Send personalized emails with customizable templates
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Demo Hint */}
			<div className="pt-8">
				<p className="text-sm text-muted-foreground">
					No credit card required • Self-hosted • Open source
				</p>
			</div>
		</section>
	);
}
