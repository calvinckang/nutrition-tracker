<script lang="ts">
	import { goto } from '$app/navigation';
	import { authClient } from '$lib/auth-client';
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
					// #region agent log
					const errData = { status: ctx.error?.status, message: ctx.error?.message, hypothesisId: 'H3-H5' };
					fetch('http://127.0.0.1:7583/ingest/e7e4ebaa-41fd-47cb-b68d-1ef6657021b9', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '726253' }, body: JSON.stringify({ sessionId: '726253', location: 'sign-in onError', message: 'signIn error', data: errData, timestamp: Date.now() }) }).catch(() => {});
					// #endregion
					error = ctx.error?.message ?? 'Email or password doesn’t look right. Try again.';
					if (ctx.error?.status === 403) {
						error = 'Please verify your email first. Check your inbox for the link.';
					}
				}
			}
		);
		loading = false;
		if (!err) goto('/');
	}
</script>

<div class="auth-card">
	<h1 class="auth-heading">Sign in</h1>
	<form class="auth-form" onsubmit={handleSubmit}>
		<label class="auth-label" for="signin-email">Email</label>
		<input
			id="signin-email"
			class="auth-input"
			type="email"
			required
			bind:value={email}
			disabled={loading}
			autocomplete="email"
		/>
		<label class="auth-label" for="signin-password">Password</label>
		<input
			id="signin-password"
			class="auth-input"
			type="password"
			required
			bind:value={password}
			disabled={loading}
			autocomplete="current-password"
		/>
		{#if error}
			<p class="auth-error">{error}</p>
		{/if}
		<md-filled-button type="submit" disabled={loading}>
			{loading ? 'Signing in…' : 'Sign in'}
		</md-filled-button>
	</form>
	<p class="auth-links">
		<a href="/forgot-password">Forgot password?</a>
		·
		<a href="/sign-up">Sign up</a>
	</p>
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
