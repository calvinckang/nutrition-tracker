/**
 * Theme mode: user preference stored in localStorage.
 * Effective theme is computed from system preference when mode is 'system'.
 */
export type ThemeMode = 'system' | 'light' | 'dark';
export type EffectiveTheme = 'light' | 'dark';

const STORAGE_KEY = 'nutrimaxxing-theme';

function getSystemTheme(): EffectiveTheme {
	if (typeof window === 'undefined') return 'light';
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function getStoredThemeMode(): ThemeMode {
	if (typeof window === 'undefined') return 'system';
	const stored = localStorage.getItem(STORAGE_KEY);
	if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
	return 'system';
}

// Backwards-compatible alias for components that call getThemeMode()
export function getThemeMode(): ThemeMode {
	return getStoredThemeMode();
}

export function getEffectiveTheme(mode: ThemeMode): EffectiveTheme {
	if (mode === 'light') return 'light';
	if (mode === 'dark') return 'dark';
	return getSystemTheme();
}

export function setThemeMode(mode: ThemeMode): void {
	if (typeof window === 'undefined') return;
	localStorage.setItem(STORAGE_KEY, mode);
	applyEffectiveTheme(getEffectiveTheme(mode));
}

export function applyEffectiveTheme(theme: EffectiveTheme): void {
	if (typeof document === 'undefined') return;
	document.documentElement.setAttribute('data-theme', theme);
	document.documentElement.style.colorScheme = theme;
}

/** Call once on client to init theme from storage and listen for system changes. */
export function initTheme(): void {
	const mode = getStoredThemeMode();
	applyEffectiveTheme(getEffectiveTheme(mode));

	window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
		const m = getStoredThemeMode();
		applyEffectiveTheme(getEffectiveTheme(m));
	});
}
