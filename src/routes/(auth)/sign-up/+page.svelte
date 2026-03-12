<script lang="ts">
	import { goto } from '$app/navigation';
	import { authClient } from '$lib/auth-client';
	import '@material/web/textfield/outlined-text-field.js';
	import '@material/web/button/filled-button.js';

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';
		loading = true;
		const { error: err } = await authClient.signUp.email(
			{ name, email, password, callbackURL: '/' },
			{
				onError: (ctx) => {
					const msg = ctx.error?.message ?? '';
					const status = ctx.error?.status;
					error =
						msg && msg.toLowerCase().includes('already')
							? 'That email is already in use. Try signing in or use another email.'
							: msg || (status ? `Error ${status}. Check the Network tab or server logs.` : 'Something went wrong. Try again.');
					console.error('[sign-up]', ctx.error);
				}
			}
		);
		loading = false;
		if (!err) goto(`/check-email?email=${encodeURIComponent(email)}`);
	}
</script>

<div class="auth-page">
	<header class="page-header">
		<h1 class="auth-brand">Nutrimaxxing</h1>
	</header>
	<div class="auth-card">
		<h2 class="auth-heading">Sign up</h2>
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
		<md-outlined-text-field
			id="signup-name"
			label="Name"
			type="text"
			required
			no-asterisk
			value={name}
			oninput={(e) => (name = (e.target as { value: string })?.value ?? '')}
			disabled={loading}
			autocomplete="name"
		></md-outlined-text-field>
		<md-outlined-text-field
			id="signup-email"
			label="Email"
			type="email"
			required
			no-asterisk
			value={email}
			oninput={(e) => (email = (e.target as { value: string })?.value ?? '')}
			disabled={loading}
			autocomplete="email"
		></md-outlined-text-field>
		<md-outlined-text-field
			id="signup-password"
			label="Password"
			type="password"
			required
			no-asterisk
			value={password}
			oninput={(e) => (password = (e.target as { value: string })?.value ?? '')}
			disabled={loading}
			autocomplete="new-password"
		></md-outlined-text-field>
		{#if error}
			<p class="auth-error">{error}</p>
		{/if}
		<md-filled-button type="submit" disabled={loading}>
			{loading ? 'Creating account…' : 'Sign up'}
		</md-filled-button>
	</form>
	<p class="auth-links">
		Already have an account? <a href="/sign-in">Sign in</a>
	</p>
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
	}
	.auth-links a {
		color: var(--md-sys-color-primary, #6750a4);
		text-decoration: none;
	}
	.auth-links a:hover {
		text-decoration: underline;
	}
</style>
