import { writable } from 'svelte/store';
import {
	getStoredThemeMode,
	getEffectiveTheme,
	setThemeMode as setMode,
	type ThemeMode,
	type EffectiveTheme
} from './theme';

function createThemeStore() {
	const mode = writable<ThemeMode>(getStoredThemeMode());
	const effective = writable<EffectiveTheme>(getEffectiveTheme(getStoredThemeMode()));

	return {
		subscribe: mode.subscribe,
		setMode(m: ThemeMode) {
			mode.set(m);
			const e = getEffectiveTheme(m);
			effective.set(e);
			setMode(m);
		},
		effective: { subscribe: effective.subscribe }
	};
}

export const themeStore = createThemeStore();
