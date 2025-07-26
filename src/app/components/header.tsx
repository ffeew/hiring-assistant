"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/app/utils/auth-client";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./auth/user-menu";
import type { User } from "better-auth/types";

export function Header() {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const getSession = async () => {
			try {
				const { data } = await authClient.getSession();

				if (!data) throw new Error("No session found");

				setUser(data.user);
			} catch (error) {
				console.error("Failed to get session:", error);
			} finally {
				setIsLoading(false);
			}
		};

		getSession();
	}, []);

	return (
		<div className="flex flex-col sm:flex-row justify-between items-center mb-8 space-y-4 sm:space-y-0">
			<h1 className="text-3xl md:text-4xl font-bold text-center flex-1 text-foreground">
				🎯 Hiring Assistant
			</h1>
			<div className="flex items-center space-x-4">
				{!isLoading && (
					<>
						{user ? (
							<UserMenu user={user} />
						) : (
							<div className="flex items-center space-x-2">
								<a
									href="/login"
									className="text-sm text-foreground hover:text-primary transition-colors"
								>
									Sign in
								</a>
								<span className="text-muted-foreground">|</span>
								<a
									href="/signup"
									className="text-sm bg-primary text-primary-foreground px-3 py-1 rounded-md hover:bg-primary/90 transition-colors"
								>
									Sign up
								</a>
							</div>
						)}
					</>
				)}
				<ThemeToggle />
			</div>
		</div>
	);
}
