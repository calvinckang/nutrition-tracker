<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { authClient } from '$lib/auth-client';
	import '@material/web/button/filled-button.js';

	let newPassword = $state('');
	let error = $state('');
	let loading = $state(false);

	const token = $derived($page.url.searchParams.get('token'));
	const tokenError = $derived($page.url.searchParams.get('error') === 'INVALID_TOKEN');

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!token) return;
		error = '';
		loading = true;
		const { error: err } = await authClient.resetPassword({ newPassword, token });
		loading = false;
		if (err) {
			error = 'Something went wrong. Try again.';
			return;
		}
		goto('/');
	}
</script>

<div class="auth-card">
	<h1 class="auth-heading">Set new password</h1>
	{#if tokenError}
		<p class="auth-error">This link is invalid or has expired. Request a new one from the sign-in page.</p>
		<p class="auth-links">
			<a href="/forgot-password">Request new link</a>
			·
			<a href="/sign-in">Sign in</a>
		</p>
	{:else if token}
		<form class="auth-form" onsubmit={handleSubmit}>
			<label class="auth-label" for="reset-password">New password</label>
			<input id="reset-password" class="auth-input" type="password" required bind:value={newPassword} disabled={loading} autocomplete="new-password" />
			{#if error}
				<p class="auth-error">{error}</p>
			{/if}
			<md-filled-button type="submit" disabled={loading}>
				{loading ? 'Saving…' : 'Set password'}
			</md-filled-button>
		</form>
	{:else}
		<p class="auth-body">Use the link from your email to reset your password.</p>
		<p class="auth-links">
			<a href="/sign-in">Back to sign in</a>
		</p>
	{/if}
</div>

<style>
	.auth-card {
		width: 100%;
		max-width: 360px;
	}
	.auth-heading {
		margin: 0 0 24px;
		font-size: 1.5rem;
		font-weight: 500;
	}
	.auth-body {
		margin: 0 0 24px;
		color: var(--md-sys-color-on-surface-variant, #49454f);
	}
	.auth-form {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	.auth-label { display: block; margin-bottom: 4px; font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant, #49454f); }
	.auth-input { width: 100%; padding: 12px 16px; border: 1px solid var(--md-sys-color-outline, #79747e); border-radius: 4px; font-size: 1rem; box-sizing: border-box; }
	.auth-error {
		margin: 0;
		color: var(--md-sys-color-error, #b3261e);
		font-size: 0.875rem;
	}
	.auth-links {
		margin: 24px 0 0;
		font-size: 0.875rem;
	}
	.auth-links a {
		color: var(--md-sys-color-primary, #6750a4);
	}
</style>
