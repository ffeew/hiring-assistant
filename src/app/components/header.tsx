"use client";

import { ThemeToggle } from "./theme-toggle";

export function Header() {
	return (
		<div className="flex flex-col sm:flex-row justify-between items-center mb-8 space-y-4 sm:space-y-0">
			<h1 className="text-3xl md:text-4xl font-bold text-center flex-1 text-foreground">
				🎯 Hiring Assistant
			</h1>
			<ThemeToggle />
		</div>
	);
}
