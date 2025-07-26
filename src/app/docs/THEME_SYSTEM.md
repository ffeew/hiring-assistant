# Theme System Documentation

## Overview

This application uses `next-themes` for comprehensive light/dark mode support with system preference detection.

## Features

- ✅ **Light/Dark/System themes** - Three theme modes with seamless switching
- ✅ **System preference detection** - Automatically follows OS theme settings
- ✅ **Persistent theme selection** - Remembers user preference across sessions
- ✅ **Smooth transitions** - Animated theme changes without flash
- ✅ **SSR-friendly** - No hydration mismatches
- ✅ **Accessibility-first** - WCAG compliant with proper contrast ratios
- ✅ **Performance optimized** - Minimal re-renders and efficient CSS

## Usage

### Theme Toggle Component

The `ThemeToggle` component cycles through themes:

- **☀️ Light** → **🌙 Dark** → **✅ System** → repeat

```tsx
import { ThemeToggle } from "./components/theme-toggle";

export function Header() {
	return (
		<header>
			<h1>My App</h1>
			<ThemeToggle />
		</header>
	);
}
```

### Custom Theme Hook

Use the custom `useTheme` hook for advanced theme management:

```tsx
import { useTheme } from "./hooks/use-theme";

export function MyComponent() {
	const { theme, isDark, cycleTheme, getThemeLabel, mounted } = useTheme();

	if (!mounted) return <div>Loading...</div>;

	return (
		<div>
			<p>Current theme: {getThemeLabel()}</p>
			<p>Is dark mode: {isDark ? "Yes" : "No"}</p>
			<button onClick={cycleTheme}>Switch Theme</button>
		</div>
	);
}
```

## Configuration

Theme settings are centralized in `src/app/lib/theme-config.ts`:

```typescript
export const themeConfig = {
	attribute: "data-theme", // HTML attribute for theme
	defaultTheme: "system", // Default theme on first visit
	enableSystem: true, // Enable system theme detection
	disableTransitionOnChange: false, // Enable smooth transitions
	storageKey: "hiring-assistant-theme", // localStorage key
	themes: ["light", "dark", "system"] as const,
};
```

## CSS Custom Properties

Themes are implemented using CSS custom properties:

```css
:root {
	--background: #ffffff;
	--foreground: #171717;
	--card-background: #ffffff;
	--primary: #7c3aed;
	/* ... more variables */
}

[data-theme="dark"] {
	--background: #0a0a0a;
	--foreground: #ededed;
	--card-background: #1a1a1a;
	--primary: #8b5cf6;
	/* ... dark theme overrides */
}
```

## Accessibility Features

- **Focus indicators** - Clear focus rings for keyboard navigation
- **High contrast support** - Enhanced contrast in high contrast mode
- **Reduced motion support** - Respects `prefers-reduced-motion`
- **Screen reader support** - Proper ARIA labels and semantic HTML
- **Color scheme detection** - Uses CSS `color-scheme` property

## Performance Optimizations

- **SSR-safe** - No flash of unstyled content (FOUC)
- **Hydration-friendly** - Prevents hydration mismatches
- **Efficient transitions** - Optimized CSS transitions
- **Minimal bundle size** - Using lightweight `next-themes` package

## Browser Support

- ✅ **Modern browsers** - Chrome 88+, Firefox 87+, Safari 14+
- ✅ **Mobile browsers** - iOS Safari 14+, Chrome Mobile 88+
- ✅ **System theme detection** - All browsers with `prefers-color-scheme` support

## Troubleshooting

### Hydration Mismatch

If you see hydration errors, ensure components that depend on theme are properly handling the `mounted` state:

```tsx
const { mounted } = useTheme();
if (!mounted) return <div>Loading...</div>;
```

### Theme Not Persisting

Check that localStorage is available and the `storageKey` is unique to your app.

### Slow Theme Transitions

For better performance, you can disable transitions:

```tsx
<ThemeProvider disableTransitionOnChange={true}>
```
