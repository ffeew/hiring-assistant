"use client";

import { useTheme } from "../hooks/use-theme";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Monitor } from "lucide-react";

export function ThemeToggle() {
	const { theme, cycleTheme, getThemeLabel, isDark, mounted } = useTheme();

	if (!mounted) {
		// Return a placeholder to avoid hydration mismatch
		return (
			<Button variant="outline" size="sm" disabled>
				<div className="w-4 h-4 animate-pulse bg-muted rounded mr-2" />
				<span className="hidden sm:inline">Theme</span>
			</Button>
		);
	}

	const getIcon = () => {
		if (theme === "system") {
			return <Monitor className="h-4 w-4" />;
		} else if (isDark) {
			return <Moon className="h-4 w-4" />;
		} else {
			return <Sun className="h-4 w-4" />;
		}
	};

	return (
		<Button
			variant="outline"
			size="sm"
			onClick={cycleTheme}
			className="transition-all hover:scale-105 active:scale-95"
			title={`Current theme: ${getThemeLabel()}. Click to cycle through themes.`}
			aria-label={`Switch theme. Current: ${getThemeLabel()}`}
		>
			<div className="transition-transform duration-300 hover:rotate-12">
				{getIcon()}
			</div>
			<span className="text-sm font-medium hidden sm:inline ml-2">
				{getThemeLabel()}
			</span>
		</Button>
	);
}
