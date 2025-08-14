# Theme System Documentation

## Overview

This application implements a sophisticated theme system using `next-themes` with Tailwind CSS v4, providing comprehensive light/dark mode support with system preference detection and shadcn/ui compatibility.

## Key Features

- ✅ **Light/Dark/System themes** - Three theme modes with seamless switching via cycle button
- ✅ **System preference detection** - Automatically follows OS theme settings with `prefers-color-scheme`
- ✅ **Persistent theme selection** - Remembers user preference across sessions via localStorage
- ✅ **Smooth transitions** - 300ms animated theme changes with CSS transitions
- ✅ **SSR-friendly** - No hydration mismatches with proper mounting checks
- ✅ **Accessibility-first** - ARIA labels, keyboard navigation, and high contrast support
- ✅ **shadcn/ui integration** - Full compatibility with shadcn/ui design tokens
- ✅ **Tailwind CSS v4** - Modern @theme syntax with CSS custom properties
- ✅ **Performance optimized** - Minimal re-renders and efficient CSS-only transitions

## Usage

### Theme Toggle Component

The `ThemeToggle` component provides an elegant cycling button with icons and labels:

- **☀️ Light** → **🌙 Dark** → **🖥️ System** → repeat

**Features:**
- Dynamic icons (Sun/Moon/Monitor) with hover animations
- Responsive text labels (hidden on mobile)
- Loading state to prevent hydration issues
- ARIA labels for accessibility
- Smooth hover effects with scale transforms

```tsx
import { ThemeToggle } from "@/app/components/theme-toggle";

export function Header() {
	return (
		<header className="flex items-center justify-between p-4">
			<h1 className="text-2xl font-bold">Hiring Assistant</h1>
			<ThemeToggle />
		</header>
	);
}
```

**Visual States:**
- **Light Mode**: ☀️ Sun icon with "Light" label
- **Dark Mode**: 🌙 Moon icon with "Dark" label  
- **System Mode**: 🖥️ Monitor icon with "System" label
- **Loading**: Pulsing placeholder to prevent flash

### Custom Theme Hook

The custom `useTheme` hook wraps `next-themes` with additional utilities:

```tsx
import { useTheme } from "@/app/hooks/use-theme";

export function ThemeAwareComponent() {
	const { 
		theme,           // "light" | "dark" | "system" | undefined
		resolvedTheme,   // "light" | "dark" | undefined (actual resolved theme)
		systemTheme,     // "light" | "dark" | undefined (OS preference)
		isDark,          // boolean (true if resolved theme is dark)
		mounted,         // boolean (prevents hydration issues)
		cycleTheme,      // () => void (cycles through themes)
		getThemeLabel,   // () => string (returns display label)
		setTheme         // (theme: ThemeMode) => void (directly set theme)
	} = useTheme();

	// Always check mounted state to prevent hydration mismatches
	if (!mounted) {
		return <div className="animate-pulse">Loading theme...</div>;
	}

	return (
		<div className="p-4 border rounded-lg">
			<h3>Theme Information</h3>
			<ul className="space-y-1 text-sm">
				<li>Selected: {getThemeLabel()}</li>
				<li>Resolved: {resolvedTheme}</li>
				<li>System: {systemTheme}</li>
				<li>Dark mode: {isDark ? "Yes" : "No"}</li>
			</ul>
			<div className="mt-3 space-x-2">
				<button onClick={cycleTheme} className="btn">
					Cycle Theme
				</button>
				<button onClick={() => setTheme("light")} className="btn">
					Force Light
				</button>
				<button onClick={() => setTheme("dark")} className="btn">
					Force Dark
				</button>
			</div>
		</div>
	);
}
```

**Hook Properties:**
- **theme**: User's selected theme preference
- **resolvedTheme**: Actual theme being applied (resolves "system" to "light"/"dark")
- **systemTheme**: OS/browser theme preference
- **isDark**: Convenient boolean for conditional rendering
- **mounted**: Prevents hydration mismatches (always check this!)
- **cycleTheme**: Programmatically cycle through themes
- **getThemeLabel**: Human-readable theme name

## Configuration

Theme settings are centralized in `src/lib/theme-config.ts`:

```typescript
export const themeConfig = {
	// HTML attribute for theme - uses 'class' for shadcn/ui compatibility
	attribute: 'class',
	
	// Default theme when user visits for the first time
	defaultTheme: 'system',
	
	// Whether to switch between light and dark based on system theme
	enableSystem: true,
	
	// Enable smooth CSS transitions when switching themes
	disableTransitionOnChange: false,
	
	// localStorage key for persisting user preference
	storageKey: 'hiring-assistant-theme',
	
	// Available themes (order matters for cycling)
	themes: ['light', 'dark', 'system'] as const,
} as const;

export type ThemeMode = (typeof themeConfig.themes)[number];
```

**Key Configuration Details:**
- **attribute: 'class'** - Uses CSS classes (.light/.dark) instead of data attributes for better shadcn/ui compatibility
- **defaultTheme: 'system'** - Respects user's OS preference by default
- **enableSystem: true** - Allows automatic switching based on OS theme changes
- **disableTransitionOnChange: false** - Enables smooth 300ms transitions between themes
- **storageKey** - Unique identifier for localStorage persistence

## CSS Architecture

The theme system uses a sophisticated CSS architecture combining Tailwind CSS v4's @theme syntax with shadcn/ui compatibility.

### Tailwind CSS v4 @theme Configuration

Modern theme definition using Tailwind CSS v4's @theme directive:

```css
@theme {
	/* Typography */
	--font-family-sans: Inter, system-ui, sans-serif;
	--font-family-mono: "Geist Mono", Consolas, monospace;

	/* Colors - Light theme (default) */
	--color-background: #ffffff;
	--color-foreground: #171717;
	--color-card: #ffffff;
	--color-card-foreground: #171717;
	--color-muted: #f8fafc;
	--color-muted-foreground: #64748b;
	--color-border: #e2e8f0;
	--color-primary: #7c3aed;
	--color-primary-hover: #6d28d9;
	--color-secondary: #10b981;
	--color-secondary-hover: #059669;
}
```

### Dark Theme Overrides

Dark theme implemented using CSS class selectors for maximum compatibility:

```css
/* Support both .dark class (next-themes) and [data-theme="dark"] attribute */
[data-theme="dark"],
.dark {
	--color-background: #0a0a0a;
	--color-foreground: #ededed;
	--color-card: #1a1a1a;
	--color-card-foreground: #ededed;
	--color-muted: #262626;
	--color-muted-foreground: #a3a3a3;
	--color-border: #404040;
	--color-primary: #8b5cf6;
	--color-primary-hover: #a78bfa;
	--color-secondary: #10b981;
	--color-secondary-hover: #34d399;
}
```

### System Theme Detection

Automatic system theme detection using CSS media queries:

```css
/* Apply dark theme when system prefers dark AND no explicit theme is set */
@media (prefers-color-scheme: dark) {
	:root:not([data-theme]):not([class*="dark"]):not([class*="light"]) {
		/* Dark theme color variables */
		--color-background: #0a0a0a;
		--color-foreground: #ededed;
		/* ... other dark theme colors */
	}
}
```

### shadcn/ui Integration

Full compatibility with shadcn/ui design tokens:

```css
/* shadcn/ui color variables (maintained for compatibility) */
:root {
	--background: oklch(1 0 0);
	--foreground: oklch(0.145 0 0);
	--card: oklch(1 0 0);
	--card-foreground: oklch(0.145 0 0);
	--primary: oklch(0.205 0 0);
	--muted: oklch(0.97 0 0);
	--border: oklch(0.922 0 0);
	/* ... complete shadcn/ui token set */
}

/* Dark theme overrides for shadcn/ui */
.dark {
	--background: var(--color-background);
	--foreground: var(--color-foreground);
	--card: var(--color-card);
	/* ... map custom colors to shadcn tokens */
}
```

### Design Tokens

Consistent design tokens defined in `design-tokens.ts`:

```typescript
export const cardVariants = {
	feature: "border-2 border-dashed hover:border-primary/50 transition-colors",
	callToAction: "border-2 border-dashed border-primary/20 bg-primary/5",
	primary: "bg-primary/5",
} as const;

export const iconSizes = {
	sm: "h-3 w-3",
	md: "h-4 w-4", 
	lg: "h-5 w-5",
	xl: "h-6 w-6",
} as const;

export const typography = {
	pageTitle: "text-3xl font-bold tracking-tight",
	cardTitle: "text-base",
	description: "text-muted-foreground",
	smallText: "text-sm",
} as const;
```

## ThemeProvider Integration

Theme provider setup in the root layout:

```tsx
// src/app/layout.tsx
import { ThemeProvider } from "next-themes";
import { themeConfig } from "../lib/theme-config";

export default function RootLayout({ children }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body>
				<ThemeProvider
					attribute={themeConfig.attribute}           // 'class'
					defaultTheme={themeConfig.defaultTheme}     // 'system'
					enableSystem={themeConfig.enableSystem}     // true
					disableTransitionOnChange={themeConfig.disableTransitionOnChange} // false
					storageKey={themeConfig.storageKey}         // 'hiring-assistant-theme'
					themes={[...themeConfig.themes]}            // ['light', 'dark', 'system']
				>
					{children}
				</ThemeProvider>
			</body>
		</html>
	);
}
```

**Key Props:**
- **suppressHydrationWarning** - Prevents Next.js warnings during theme resolution
- **attribute="class"** - Uses CSS classes instead of data attributes for better compatibility
- **themes array spread** - Ensures proper array type inference

## Accessibility Features

### WCAG 2.1 AA Compliance
- **Contrast ratios** - All color combinations meet WCAG AA standards (4.5:1 minimum)
- **Focus indicators** - Clear focus rings with `--ring` color for keyboard navigation
- **High contrast mode** - Enhanced contrast ratios in system high contrast mode
- **Color independence** - Information never conveyed by color alone

### Screen Reader Support
- **ARIA labels** - Theme toggle has descriptive `aria-label` and `title` attributes
- **Semantic HTML** - Proper button elements with meaningful text content
- **Live announcements** - Theme changes announced to screen readers via state changes

### Motion & Animation
- **Reduced motion support** - Respects `prefers-reduced-motion: reduce` preference
- **Smooth transitions** - 300ms transitions for non-reduced motion users
- **No flash transitions** - Prevents jarring theme switches

### Keyboard Navigation
- **Tab order** - Theme toggle properly included in tab sequence
- **Enter/Space activation** - Standard button interaction patterns
- **Focus management** - Maintains focus state during theme changes

## Performance Optimizations

### Server-Side Rendering (SSR)
- **SSR-safe implementation** - No flash of unstyled content (FOUC)
- **Hydration-friendly** - Proper mounting checks prevent hydration mismatches
- **suppressHydrationWarning** - Handles expected theme resolution differences
- **Inline styles** - Critical theme styles inlined to prevent FOUC

### Runtime Performance
- **CSS-only transitions** - No JavaScript animation for theme changes
- **Efficient re-renders** - Minimal React re-renders on theme change
- **Cached computations** - Theme resolution cached by next-themes
- **Lightweight bundle** - next-themes adds minimal runtime overhead (~2.3kb)

### CSS Optimizations
- **CSS Custom Properties** - Efficient theme switching via CSS variables
- **Reduced specificity conflicts** - Proper CSS cascade management
- **Optimized selector performance** - Minimal use of complex selectors
- **Tree-shaking friendly** - Unused theme tokens eliminated in production

## Browser Support

### Modern Browser Support
- ✅ **Chrome/Edge 88+** - Full support with modern CSS features
- ✅ **Firefox 87+** - Complete theme system compatibility  
- ✅ **Safari 14+** - System theme detection and CSS variables
- ✅ **Mobile browsers** - iOS Safari 14+, Chrome Mobile 88+

### Feature Detection
- ✅ **CSS Custom Properties** - Required for theme system
- ✅ **prefers-color-scheme** - System theme detection
- ✅ **localStorage** - Theme preference persistence
- ✅ **CSS calc()** - Dynamic radius calculations
- ✅ **OKLCH color space** - Modern color definitions (with fallbacks)

### Graceful Degradation
- **CSS fallbacks** - Hex color fallbacks for OKLCH values
- **No-JS support** - Basic styling without JavaScript theme switching
- **Legacy browser handling** - Graceful fallback to default light theme

## Troubleshooting

### Hydration Mismatch Errors

**Problem**: React hydration errors related to theme state
```
Warning: Text content did not match. Server: "" Client: "Dark"
```

**Solutions**:
```tsx
// ✅ CORRECT - Always check mounted state
const { mounted, theme } = useTheme();
if (!mounted) {
	return <div>Loading...</div>; // or skeleton/placeholder
}
return <div>Current theme: {theme}</div>;

// ❌ WRONG - Direct theme usage without mounted check
const { theme } = useTheme();
return <div>Current theme: {theme}</div>; // Will cause hydration error
```

### Theme Not Persisting

**Problem**: Theme preference resets on page reload

**Common causes**:
1. **localStorage blocked** - Check browser privacy settings
2. **Storage key conflicts** - Ensure unique `storageKey` in config
3. **Incognito/private mode** - localStorage disabled in private browsing

**Solutions**:
```tsx
// Check if localStorage is available
if (typeof window !== 'undefined' && window.localStorage) {
	console.log('Theme stored:', localStorage.getItem('hiring-assistant-theme'));
}

// Use different storage key if conflicts exist
export const themeConfig = {
	storageKey: 'my-unique-app-theme', // Change this
	// ... other config
};
```

### Theme Flickering/FOUC

**Problem**: Flash of wrong theme during page load

**Solutions**:
1. **Ensure suppressHydrationWarning** in html tag:
```tsx
<html lang="en" suppressHydrationWarning>
```

2. **Check CSS loading order** - Ensure theme styles load before content
3. **Verify theme provider placement** - Should wrap entire app

### CSS Styles Not Updating

**Problem**: Components don't reflect theme changes

**Solutions**:
1. **Use CSS custom properties** correctly:
```css
/* ✅ CORRECT */
.my-component {
	background-color: var(--color-background);
	color: var(--color-foreground);
}

/* ❌ WRONG - hard-coded values */
.my-component {
	background-color: #ffffff;
	color: #000000;
}
```

2. **Check CSS specificity** - Ensure theme overrides have higher specificity

### System Theme Not Working

**Problem**: System theme option doesn't respond to OS changes

**Solutions**:
1. **Verify enableSystem is true** in theme config
2. **Check browser support** for `prefers-color-scheme`
3. **Test CSS media query**:
```css
@media (prefers-color-scheme: dark) {
	/* This should apply when OS is in dark mode */
}
```

### Slow Theme Transitions

**Problem**: Theme switching feels sluggish

**Performance optimizations**:
```tsx
// Disable transitions for better performance
<ThemeProvider disableTransitionOnChange={true}>

// Or optimize CSS transitions
body {
	transition: background-color 0.2s ease; /* Faster transition */
}
```

### TypeScript Errors

**Problem**: Type errors with theme values

**Solutions**:
```tsx
// Import proper types
import type { ThemeMode } from '@/lib/theme-config';

// Type-safe theme setting
const setTheme = (newTheme: ThemeMode) => {
	// TypeScript will validate this is 'light' | 'dark' | 'system'
};
```

### Development vs Production Differences

**Problem**: Themes work in development but not production

**Checklist**:
1. **Build optimization** - Ensure CSS variables aren't being purged
2. **Environment variables** - Check if any theme config depends on env vars
3. **CSP headers** - Content Security Policy might block inline styles
4. **Bundle analysis** - Verify theme CSS is included in production build

## File Structure Reference

```
src/
├── lib/
│   └── theme-config.ts          # Theme configuration
├── app/
│   ├── globals.css              # Theme CSS definitions
│   ├── layout.tsx               # ThemeProvider setup
│   ├── components/
│   │   └── theme-toggle.tsx     # Theme switching component
│   ├── hooks/
│   │   └── use-theme.ts         # Custom theme hook
│   └── components/ui/
│       └── design-tokens.ts     # Design token definitions
```

## Best Practices Summary

### Do's ✅
- Always check `mounted` state before rendering theme-dependent content
- Use CSS custom properties for all theme-aware styles
- Test theme switching in both development and production builds
- Include proper ARIA labels for accessibility
- Use the custom `useTheme` hook for consistent theme management
- Implement loading states to prevent hydration issues

### Don'ts ❌
- Don't use hard-coded color values in components
- Don't access theme state on server-side or during initial render
- Don't forget `suppressHydrationWarning` on the html element
- Don't modify theme config without restarting development server
- Don't use complex selectors that might conflict with theme overrides
- Don't assume localStorage is always available
