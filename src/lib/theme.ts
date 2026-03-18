/**
 * Theme mode: user preference stored in localStorage.
 * Effective theme is computed from system preference when mode is 'system'.
 */
export type ThemeMode = 'system' | 'light' | 'dark';
export type EffectiveTheme = 'light' | 'dark';

const STORAGE_KEY = 'nutrimaxxing-theme';

/** Single seed color – change this to update hue across the entire app (light + dark). */
const SEED_COLOR = '#626200';

let colorThemeCache: { theme: unknown; applyTheme: (theme: unknown, opts: { target: HTMLElement; dark: boolean }) => void } | null = null;

async function loadColorTheme() {
	if (colorThemeCache) return colorThemeCache;
	const m = (await import('@material/material-color-utilities')) as {
		argbFromHex: (hex: string) => number;
		themeFromSourceColor: (source: number) => unknown;
		applyTheme: (theme: unknown, opts: { target: HTMLElement; dark: boolean }) => void;
	};
	colorThemeCache = {
		theme: m.themeFromSourceColor(m.argbFromHex(SEED_COLOR)),
		applyTheme: m.applyTheme
	};
	return colorThemeCache;
}

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

export async function setThemeMode(mode: ThemeMode): Promise<void> {
	if (typeof window === 'undefined') return;
	localStorage.setItem(STORAGE_KEY, mode);
	await loadColorTheme(); // Ensure theme is loaded (e.g. if settings opened before initTheme completed)
	applyEffectiveTheme(getEffectiveTheme(mode));
}

export function applyEffectiveTheme(theme: EffectiveTheme): void {
	if (typeof document === 'undefined') return;
	document.documentElement.setAttribute('data-theme', theme);
	document.documentElement.style.colorScheme = theme;
	if (colorThemeCache) {
		colorThemeCache.applyTheme(colorThemeCache.theme, {
			target: document.documentElement,
			dark: theme === 'dark'
		});
	}
}

/** Call once on client to init theme from storage and listen for system changes. */
export async function initTheme(): Promise<void> {
	await loadColorTheme();
	const mode = getStoredThemeMode();
	applyEffectiveTheme(getEffectiveTheme(mode));

	window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
		const m = getStoredThemeMode();
		applyEffectiveTheme(getEffectiveTheme(m));
	});
}
