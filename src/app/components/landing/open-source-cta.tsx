"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	Github,
	Heart,
	Users,
	Download,
	Star,
	GitBranch,
	Shield,
	DollarSign,
	Unlock,
	ArrowRight,
	Code2,
	Building2,
} from "lucide-react";

const benefits = [
	{
		icon: DollarSign,
		title: "Free Forever",
		description: "No subscription fees, no per-user costs, no hidden charges",
	},
	{
		icon: Unlock,
		title: "No Vendor Lock-in",
		description: "Your data stays with you, migrate anytime, modify as needed",
	},
	{
		icon: Shield,
		title: "Full Control",
		description: "Self-hosted deployment, complete data ownership and privacy",
	},
	{
		icon: Code2,
		title: "Customizable",
		description:
			"Modify the code, add features, integrate with your existing tools",
	},
	{
		icon: Users,
		title: "Community Driven",
		description:
			"Active development, community contributions, shared improvements",
	},
	{
		icon: Building2,
		title: "Enterprise Ready",
		description:
			"Production-grade code, security best practices, scalable architecture",
	},
];

const vsCommercial = [
	{
		feature: "Monthly Cost",
		openSource: "$0",
		commercial: "$50-200/user",
		highlight: true,
	},
	{
		feature: "Setup Time",
		openSource: "30 minutes",
		commercial: "Weeks of sales calls",
	},
	{
		feature: "Data Control",
		openSource: "100% yours",
		commercial: "Vendor controlled",
	},
	{
		feature: "Customization",
		openSource: "Full source access",
		commercial: "Limited API",
	},
	{
		feature: "AI Features",
		openSource: "Latest models",
		commercial: "Behind paywall",
	},
];

export function OpenSourceCTA() {
	return (
		<section className="space-y-12">
			{/* Section Header */}
			<div className="text-center space-y-4">
				<Badge variant="outline" className="px-4 py-2">
					<Heart className="w-4 h-4 mr-2 text-red-500" />
					Open Source & Free
				</Badge>
				<h2 className="text-3xl md:text-4xl font-bold tracking-tight">
					Why choose open source?
				</h2>
				<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
					Break free from expensive ATS platforms. Get enterprise features
					without the enterprise price tag.
				</p>
			</div>

			{/* Benefits Grid */}
			<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
				{benefits.map((benefit, index) => {
					const Icon = benefit.icon;
					return (
						<Card
							key={index}
							className="border-muted hover:border-primary/20 transition-all duration-300"
						>
							<CardContent className="p-6 space-y-3">
								<div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
									<Icon className="w-5 h-5 text-primary" />
								</div>
								<h3 className="font-semibold text-lg">{benefit.title}</h3>
								<p className="text-sm text-muted-foreground leading-relaxed">
									{benefit.description}
								</p>
							</CardContent>
						</Card>
					);
				})}
			</div>

			{/* Comparison Table */}
			<div className="bg-card border rounded-xl overflow-hidden">
				<div className="p-6 border-b bg-muted/20">
					<h3 className="text-xl font-bold text-center">
						Open Source vs Commercial ATS
					</h3>
				</div>
				<div className="divide-y">
					{vsCommercial.map((row, index) => (
						<div
							key={index}
							className={`grid grid-cols-3 gap-4 p-4 ${
								row.highlight ? "bg-primary/5" : ""
							}`}
						>
							<div className="font-medium">{row.feature}</div>
							<div className="text-center">
								<Badge
									variant="default"
									className="bg-primary/10 text-primary border-primary/20"
								>
									{row.openSource}
								</Badge>
							</div>
							<div className="text-center">
								<Badge variant="outline" className="text-muted-foreground">
									{row.commercial}
								</Badge>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* GitHub Stats & CTA */}
			<div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-purple-500/10 rounded-xl p-8">
				<div className="text-center space-y-6">
					<div className="space-y-4">
						<h3 className="text-2xl font-bold">Join the Community</h3>
						<p className="text-muted-foreground max-w-lg mx-auto">
							Star the repository, contribute code, and help shape the future of
							open source hiring tools
						</p>
					</div>

					{/* Mock GitHub Stats */}
					<div className="flex flex-wrap justify-center gap-4 text-sm">
						<div className="flex items-center gap-2 bg-card/50 px-3 py-2 rounded-lg">
							<Star className="w-4 h-4 text-yellow-500" />
							<span className="font-medium">⭐ Star us on GitHub</span>
						</div>
						<div className="flex items-center gap-2 bg-card/50 px-3 py-2 rounded-lg">
							<GitBranch className="w-4 h-4 text-green-500" />
							<span className="font-medium">🍴 Fork & contribute</span>
						</div>
						<div className="flex items-center gap-2 bg-card/50 px-3 py-2 rounded-lg">
							<Users className="w-4 h-4 text-blue-500" />
							<span className="font-medium">👥 Join discussions</span>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
						<a
							href="https://github.com/ffeew/hiring-assistant"
							target="_blank"
							rel="noopener noreferrer"
						>
							<Button size="lg" className="px-8">
								<Github className="w-5 h-5 mr-2" />
								View Source Code
								<ArrowRight className="w-4 h-4 ml-2" />
							</Button>
						</a>
						<a
							href="https://github.com/ffeew/hiring-assistant/archive/main.zip"
							target="_blank"
							rel="noopener noreferrer"
						>
							<Button variant="outline" size="lg" className="px-8">
								<Download className="w-5 h-5 mr-2" />
								Download ZIP
							</Button>
						</a>
					</div>

					<div className="text-xs text-muted-foreground">
						MIT Licensed • No strings attached • Build something amazing
					</div>
				</div>
			</div>
		</section>
	);
}
