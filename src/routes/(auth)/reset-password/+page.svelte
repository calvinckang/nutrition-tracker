<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { authClient } from '$lib/auth-client';
	import '@material/web/textfield/filled-text-field.js';
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

<div class="auth-page">
	<header class="page-header">
		<h1 class="auth-brand">Nutrimaxxing</h1>
	</header>
	<div class="auth-card">
		<h2 class="auth-heading">Set new password</h2>
		{#if tokenError}
			<p class="auth-error">
				This link is invalid or has expired. Request a new one from the sign-in page.
			</p>
			<p class="auth-links">
				<a href="/forgot-password">Request new link</a>
				·
				<a href="/sign-in">Sign in</a>
			</p>
		{:else if token}
			<form
				class="auth-form"
				onsubmit={handleSubmit}
				onkeydown={(e) => {
					if (e.key !== 'Enter') return;
					if (document.activeElement instanceof HTMLTextAreaElement) return;
					e.preventDefault();
					(e.currentTarget as HTMLFormElement).requestSubmit();
				}}
			>
				<md-filled-text-field
					id="reset-password"
					label="New password"
					type="password"
					required
					no-asterisk
					value={newPassword}
					oninput={(e) => (newPassword = (e.target as { value: string })?.value ?? '')}
					disabled={loading}
					autocomplete="new-password"
				></md-filled-text-field>
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
</div>

<style>
	.auth-page {
		width: 100%;
		max-width: 480px;
		display: flex;
		flex-direction: column;
	}
	.auth-brand {
		margin: 0;
		font-size: var(--md-sys-typescale-display-small-size);
		font-weight: 300;
		line-height: var(--md-sys-typescale-display-small-line-height);
	}
	.auth-card {
		width: 100%;
		max-width: 480px;
		padding: 20px;
	}
	.auth-heading {
		margin: 0 0 24px;
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
		text-decoration: none;
	}
	.auth-links a:hover {
		text-decoration: underline;
	}
</style>
