import { SignUpForm } from "@/app/components/auth/signup-form";
import { ThemeToggle } from "@/app/components/theme-toggle";
import { BackgroundPattern } from "@/app/components/background-pattern";

export default function SignUpPage() {
	return (
		<main className="min-h-screen bg-gradient-to-br from-background to-muted text-foreground relative">
			<BackgroundPattern />

			<div className="relative z-10">
				<div className="container mx-auto px-6 py-8">
					<div className="flex justify-between items-center mb-8">
						<a
							href="/"
							className="text-2xl font-bold text-foreground hover:text-primary transition-colors"
						>
							🎯 Hiring Assistant
						</a>
						<ThemeToggle />
					</div>

					<SignUpForm />
				</div>
			</div>
		</main>
	);
}
