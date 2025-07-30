import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { themeConfig } from "../lib/theme-config";
import { QueryProvider } from "./providers/query-provider";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Hiring Assistant",
	description: "AI-powered resume processing and candidate communication tool",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<QueryProvider>
					<ThemeProvider
						attribute={themeConfig.attribute}
						defaultTheme={themeConfig.defaultTheme}
						enableSystem={themeConfig.enableSystem}
						disableTransitionOnChange={themeConfig.disableTransitionOnChange}
						storageKey={themeConfig.storageKey}
						themes={[...themeConfig.themes]}
					>
						{children}
					</ThemeProvider>
				</QueryProvider>
			</body>
		</html>
	);
}
