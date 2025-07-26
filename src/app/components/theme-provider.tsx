"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

type ThemeProviderContextType = {
	theme: Theme;
	setTheme: (theme: Theme) => void;
	actualTheme: "light" | "dark";
};

const ThemeProviderContext = createContext<
	ThemeProviderContextType | undefined
>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const [theme, setTheme] = useState<Theme>("system");
	const [actualTheme, setActualTheme] = useState<"light" | "dark">("light");

	useEffect(() => {
		// Load theme from localStorage
		const stored = localStorage.getItem("theme") as Theme;
		if (stored) {
			setTheme(stored);
		}
	}, []);

	useEffect(() => {
		const root = window.document.documentElement;

		// Remove existing theme classes
		root.removeAttribute("data-theme");

		if (theme === "system") {
			const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
				.matches
				? "dark"
				: "light";
			setActualTheme(systemTheme);
			if (systemTheme === "dark") {
				root.setAttribute("data-theme", "dark");
			}
		} else {
			setActualTheme(theme);
			if (theme === "dark") {
				root.setAttribute("data-theme", "dark");
			}
		}

		// Store theme in localStorage
		localStorage.setItem("theme", theme);
	}, [theme]);

	useEffect(() => {
		// Listen for system theme changes
		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		const handleChange = () => {
			if (theme === "system") {
				const systemTheme = mediaQuery.matches ? "dark" : "light";
				setActualTheme(systemTheme);
				const root = window.document.documentElement;
				root.removeAttribute("data-theme");
				if (systemTheme === "dark") {
					root.setAttribute("data-theme", "dark");
				}
			}
		};

		mediaQuery.addEventListener("change", handleChange);
		return () => mediaQuery.removeEventListener("change", handleChange);
	}, [theme]);

	return (
		<ThemeProviderContext.Provider value={{ theme, setTheme, actualTheme }}>
			{children}
		</ThemeProviderContext.Provider>
	);
}

export function useTheme() {
	const context = useContext(ThemeProviderContext);
	if (context === undefined) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}
	return context;
}
