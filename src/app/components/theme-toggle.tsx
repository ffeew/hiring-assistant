"use client";

import { useTheme } from "../hooks/use-theme";

export function ThemeToggle() {
	const { theme, cycleTheme, getThemeLabel, isDark, mounted } = useTheme();

	if (!mounted) {
		// Return a placeholder to avoid hydration mismatch
		return (
			<div
				className="flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-300
        bg-[var(--card-background)] text-[var(--card-foreground)] 
        border-[var(--border)]"
			>
				<div className="w-5 h-5 animate-pulse bg-[var(--muted-background)] rounded" />
				<span className="text-sm font-medium hidden sm:inline">Theme</span>
			</div>
		);
	}

	const getIcon = () => {
		if (theme === "system") {
			return (
				<svg
					className="h-5 w-5"
					fill="none"
					strokeWidth="2"
					stroke="currentColor"
					viewBox="0 0 24 24"
					aria-hidden="true"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
			);
		} else if (isDark) {
			return (
				<svg
					className="h-5 w-5"
					fill="none"
					strokeWidth="2"
					stroke="currentColor"
					viewBox="0 0 24 24"
					aria-hidden="true"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
					/>
				</svg>
			);
		} else {
			return (
				<svg
					className="h-5 w-5"
					fill="none"
					strokeWidth="2"
					stroke="currentColor"
					viewBox="0 0 24 24"
					aria-hidden="true"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
					/>
				</svg>
			);
		}
	};

	return (
		<button
			onClick={cycleTheme}
			className="flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-300
        bg-[var(--card-background)] text-[var(--card-foreground)] 
        border-[var(--border)] hover:bg-[var(--muted-background)]
        hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
			title={`Current theme: ${getThemeLabel()}. Click to cycle through themes.`}
			aria-label={`Switch theme. Current: ${getThemeLabel()}`}
		>
			<div className="transition-transform duration-300 hover:rotate-12">
				{getIcon()}
			</div>
			<span className="text-sm font-medium hidden sm:inline">
				{getThemeLabel()}
			</span>
		</button>
	);
}
