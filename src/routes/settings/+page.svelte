<script lang="ts">
import { goto } from '$app/navigation';
import { authClient } from '$lib/auth-client';
import { getThemeMode, setThemeMode, type ThemeMode } from '$lib/theme';
import '@material/web/button/outlined-button.js';
import '@material/web/select/filled-select.js';
import '@material/web/select/select-option.js';

	let selectedMode = $state<ThemeMode>('system');

	if (typeof window !== 'undefined') {
		selectedMode = getThemeMode();
	}

	function handleThemeChange(event: Event) {
		const target = event.currentTarget as HTMLElement & { value?: string } | null;
		if (!target || !target.value) return;
		const value = target.value as ThemeMode;
		selectedMode = value;
		setThemeMode(value);
	}

	async function signOut() {
		await authClient.signOut();
		goto('/sign-in');
	}
</script>

<div class="settings-page">
	<header class="page-header">
		<h2>Settings</h2>
	</header>

	<section aria-label="Theme" class="settings-section">
		<div class="theme-select-container">
			<md-filled-select
				label="Theme"
				value={selectedMode}
				oninput={handleThemeChange}
			>
				<md-select-option value="system">
					<div slot="headline">System default</div>
				</md-select-option>
				<md-select-option value="light">
					<div slot="headline">Light</div>
				</md-select-option>
				<md-select-option value="dark">
					<div slot="headline">Dark</div>
				</md-select-option>
			</md-filled-select>
		</div>
	</section>

	<section aria-label="Account" class="settings-section">
		<md-outlined-button onclick={signOut} onkeydown={(e: KeyboardEvent) => e.key === 'Enter' && signOut()} role="button" tabindex="0">
			Sign out
		</md-outlined-button>
	</section>
</div>

<style>
	.settings-page {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-height: 0;
		gap: 24px;
	}
	.settings-section {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.theme-select-container {
		height: 100%;
	}
	.theme-select-container md-filled-select {
		width: 100%;
	}
	.settings-section:last-child {
		margin-top: auto;
	}
	.settings-body {
		margin: 0;
		font-size: 0.95rem;
		color: var(--md-sys-color-on-surface-variant);
	}
</style>
