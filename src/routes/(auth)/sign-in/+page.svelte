<script lang="ts">
	import { goto } from '$app/navigation';
	import { authClient } from '$lib/auth-client';
	import '@material/web/textfield/filled-text-field.js';
	import '@material/web/button/filled-button.js';
	import '@material/web/button/outlined-button.js';

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';
		loading = true;
		const { error: err } = await authClient.signIn.email(
			{ email, password, callbackURL: '/' },
			{
				onError: (ctx) => {
					if (ctx.error?.status === 403) {
						goto(`/check-email?email=${encodeURIComponent(email)}`);
						return;
					}
					error = ctx.error?.message ?? 'Email or password doesn’t look right. Try again.';
				}
			}
		);
		loading = false;
		if (!err) goto('/');
	}
</script>

<div class="auth-page">
	<header class="page-header">
		<h1 class="auth-brand">Nutrimaxxing</h1>
	</header>
	<div class="auth-card">
		<h2 class="auth-heading">Sign in</h2>
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
			id="signin-email"
			label="Email"
			type="email"
			required
			no-asterisk
			value={email}
			oninput={(e) => (email = (e.target as { value: string })?.value ?? '')}
			disabled={loading}
			autocomplete="email"
		></md-filled-text-field>
		<md-filled-text-field
			id="signin-password"
			label="Password"
			type="password"
			required
			no-asterisk
			value={password}
			oninput={(e) => (password = (e.target as { value: string })?.value ?? '')}
			disabled={loading}
			autocomplete="current-password"
		></md-filled-text-field>
		{#if error}
			<p class="auth-error">{error}</p>
		{/if}
		<md-filled-button type="submit" disabled={loading}>
			{loading ? 'Signing in…' : 'Sign in'}
		</md-filled-button>
	</form>
	<div class="auth-links">
		<div><a href="/forgot-password">Forgot password?</a></div>
		<div>Don't have an account? <a href="/sign-up">Sign up</a></div>
	</div>
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
	.auth-form {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	.auth-form :global(md-filled-button) {
		margin-top: 8px;
	}
	.auth-error {
		margin: 0;
		color: var(--md-sys-color-error, #b3261e);
		font-size: 0.875rem;
	}
	.auth-links {
		margin: 24px 0 0;
		font-size: 0.875rem;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.auth-links a {
		color: var(--md-sys-color-primary, #6750a4);
		text-decoration: none;
	}
	.auth-links a:hover {
		text-decoration: underline;
	}
</style>
