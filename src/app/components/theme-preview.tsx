"use client";

import { useTheme } from "../hooks/use-theme";

export function ThemePreview() {
	const { theme, setTheme, getThemeLabel, isDark, mounted } = useTheme();

	if (!mounted) return null;

	return (
		<div className="fixed bottom-4 right-4 p-4 rounded-lg border bg-card border-border shadow-lg z-50">
			<div className="text-sm font-medium mb-2 text-foreground">
				Theme Preview
			</div>
			<div className="flex space-x-2">
				{(["light", "dark", "system"] as const).map((themeOption) => (
					<button
						key={themeOption}
						onClick={() => setTheme(themeOption)}
						className={`px-3 py-1 text-xs rounded-md transition-all duration-200 ${
							theme === themeOption
								? "ring-2 ring-primary bg-primary text-white"
								: "bg-muted text-muted-foreground hover:bg-muted/80"
						}`}
					>
						{themeOption === "light" && "☀️"}
						{themeOption === "dark" && "🌙"}
						{themeOption === "system" && "🖥️"}
						{themeOption.charAt(0).toUpperCase() + themeOption.slice(1)}
					</button>
				))}
			</div>
			<div className="text-xs mt-2 text-muted-foreground">
				Current: {getThemeLabel()} {isDark ? "(Dark)" : "(Light)"}
			</div>
		</div>
	);
}
