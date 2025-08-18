"use client";

import { HeroSection } from "./hero-section";
import { FeatureShowcase } from "./feature-showcase";
import { HowItWorks } from "./how-it-works";
import { TechStack } from "./tech-stack";
import { OpenSourceCTA } from "./open-source-cta";
import { GettingStarted } from "./getting-started";
import { BackgroundPattern } from "../background-pattern";
import { ThemeToggle } from "../theme-toggle";
import Link from "next/link";

export function LandingPage() {
	return (
		<main className="min-h-screen bg-gradient-to-br from-background to-muted text-foreground relative">
			<BackgroundPattern />

			<div className="relative z-10">
				{/* Header */}
				<header className="container mx-auto px-6 py-8">
					<div className="flex justify-between items-center">
						<Link
							href="/"
							className="text-2xl font-bold text-foreground hover:text-primary transition-colors"
						>
							🎯 Hiring Assistant
						</Link>
						<div className="flex items-center gap-4">
							<ThemeToggle />
							<Link
								href="/login"
								className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
							>
								Sign In
							</Link>
						</div>
					</div>
				</header>

				{/* Main Content */}
				<div className="container mx-auto px-6 space-y-20 pb-20">
					<HeroSection />
					<FeatureShowcase />
					<HowItWorks />
					<TechStack />
					<OpenSourceCTA />
					<GettingStarted />
				</div>

				{/* Footer */}
				<footer className="border-t border-border/40 bg-card/50 backdrop-blur-sm">
					<div className="container mx-auto px-6 py-12">
						<div className="flex flex-col md:flex-row justify-between items-center gap-4">
							<div className="flex items-center gap-2">
								<span className="text-2xl">🎯</span>
								<span className="font-semibold">Hiring Assistant</span>
								<span className="text-sm text-muted-foreground">
									- Free & Open Source
								</span>
							</div>
							<div className="flex items-center gap-6 text-sm text-muted-foreground">
								<Link
									href="/login"
									className="hover:text-foreground transition-colors"
								>
									Get Started
								</Link>
								<a
									href="https://github.com/ffeew/hiring-assistant"
									target="_blank"
									rel="noopener noreferrer"
									className="hover:text-foreground transition-colors"
								>
									GitHub
								</a>
								<a
									href="https://github.com/ffeew/hiring-assistant/blob/main/README.md"
									target="_blank"
									rel="noopener noreferrer"
									className="hover:text-foreground transition-colors"
								>
									Documentation
								</a>
							</div>
						</div>
					</div>
				</footer>
			</div>
		</main>
	);
}
