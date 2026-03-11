<script lang="ts">
	import { authClient } from '$lib/auth-client';
	import '@material/web/button/filled-button.js';

	let email = $state('');
	let sent = $state(false);
	let error = $state('');
	let loading = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';
		loading = true;
		const { error: err } = await authClient.requestPasswordReset({
			email,
			redirectTo: '/reset-password'
		});
		loading = false;
		if (err) {
			error = 'Something went wrong. Try again.';
			return;
		}
		sent = true;
	}
</script>

<div class="auth-card">
	<h1 class="auth-heading">Forgot password?</h1>
	{#if sent}
		<p class="auth-body">Check your email for the link to reset your password.</p>
		<p class="auth-links"><a href="/sign-in">Back to sign in</a></p>
	{:else}
		<p class="auth-body">Enter your email and we'll send you a link to set a new one.</p>
		<form class="auth-form" onsubmit={handleSubmit}>
			<label class="auth-label" for="forgot-email">Email</label>
			<input id="forgot-email" class="auth-input" type="email" required bind:value={email} disabled={loading} autocomplete="email" />
			{#if error}<p class="auth-error">{error}</p>{/if}
			<md-filled-button type="submit" disabled={loading}>
				{loading ? 'Sending…' : 'Send link'}
			</md-filled-button>
		</form>
		<p class="auth-links"><a href="/sign-in">Back to sign in</a></p>
	{/if}
</div>

<style>
	.auth-card { width: 100%; max-width: 360px; }
	.auth-heading { margin: 0 0 24px; font-size: 1.5rem; font-weight: 500; }
	.auth-body { margin: 0 0 24px; color: var(--md-sys-color-on-surface-variant, #49454f); }
	.auth-form { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }
	.auth-label { display: block; margin-bottom: 4px; font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant, #49454f); }
	.auth-input { width: 100%; padding: 12px 16px; border: 1px solid var(--md-sys-color-outline, #79747e); border-radius: 4px; font-size: 1rem; box-sizing: border-box; }
	.auth-error { margin: 0; color: var(--md-sys-color-error, #b3261e); font-size: 0.875rem; }
	.auth-links { margin: 0; font-size: 0.875rem; }
	.auth-links a { color: var(--md-sys-color-primary, #6750a4); }
</style>
