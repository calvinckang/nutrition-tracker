<script lang="ts">
	import { authClient } from '$lib/auth-client';
	import '@material/web/textfield/filled-text-field.js';
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
				id="forgot-email"
				label="Email"
				type="email"
				required
				no-asterisk
				value={email}
				oninput={(e) => (email = (e.target as { value: string })?.value ?? '')}
				disabled={loading}
				autocomplete="email"
			></md-filled-text-field>
			{#if error}<p class="auth-error">{error}</p>{/if}
			<md-filled-button type="submit" disabled={loading}>
				{loading ? 'Sending…' : 'Send link'}
			</md-filled-button>
		</form>
		<p class="auth-links"><a href="/sign-in">Back to sign in</a></p>
	{/if}
</div>

<style>
	.auth-card { width: 100%; max-width: 480px; padding: 20px; }
	.auth-heading { margin: 0 0 24px; font-size: 1.5rem; font-weight: 500; }
	.auth-body { margin: 0 0 24px; color: var(--md-sys-color-on-surface-variant, #49454f); }
	.auth-form { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }
	.auth-error { margin: 0; color: var(--md-sys-color-error, #b3261e); font-size: 0.875rem; }
	.auth-links { margin: 0; font-size: 0.875rem; }
	.auth-links a { color: var(--md-sys-color-primary, #6750a4); }
</style>
