"use client";

import { useState } from "react";
import { authClient } from "@/app/utils/auth-client";
import { useRouter } from "next/navigation";

export function SignUpForm() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [name, setName] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");

		if (password !== confirmPassword) {
			setError("Passwords do not match");
			setIsLoading(false);
			return;
		}

		try {
			const { data, error } = await authClient.signUp.email({
				email,
				password,
				name,
			});

			if (error) {
				setError(error.message || "Failed to create account");
			} else if (data) {
				router.push("/");
				router.refresh();
			}
		} catch (err) {
			console.error("Sign up error:", err);
			setError("An unexpected error occurred");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="max-w-md mx-auto mt-16 p-6 bg-background border border-border rounded-lg shadow-lg">
			<h2 className="text-2xl font-bold text-center mb-6 text-foreground">
				Create Account
			</h2>

			<form onSubmit={handleSubmit} className="space-y-4">
				{error && (
					<div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
						{error}
					</div>
				)}

				<div>
					<label
						htmlFor="name"
						className="block text-sm font-medium text-foreground mb-1"
					>
						Full Name
					</label>
					<input
						id="name"
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
						required
						className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
						placeholder="Enter your full name"
					/>
				</div>

				<div>
					<label
						htmlFor="email"
						className="block text-sm font-medium text-foreground mb-1"
					>
						Email
					</label>
					<input
						id="email"
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
						className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
						placeholder="Enter your email"
					/>
				</div>

				<div>
					<label
						htmlFor="password"
						className="block text-sm font-medium text-foreground mb-1"
					>
						Password
					</label>
					<input
						id="password"
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
						minLength={6}
						className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
						placeholder="Enter your password (min 6 characters)"
					/>
				</div>

				<div>
					<label
						htmlFor="confirmPassword"
						className="block text-sm font-medium text-foreground mb-1"
					>
						Confirm Password
					</label>
					<input
						id="confirmPassword"
						type="password"
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
						required
						className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
						placeholder="Confirm your password"
					/>
				</div>

				<button
					type="submit"
					disabled={isLoading}
					className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
				>
					{isLoading ? "Creating account..." : "Sign Up"}
				</button>
			</form>

			<div className="mt-4 text-center">
				<span className="text-sm text-muted-foreground">
					Already have an account?{" "}
					<a href="/login" className="text-primary hover:underline">
						Sign in
					</a>
				</span>
			</div>
		</div>
	);
}
