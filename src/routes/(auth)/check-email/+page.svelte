<script lang="ts">
	import { page } from '$app/stores';
	import { authClient } from '$lib/auth-client';
	import '@material/web/button/filled-button.js';

	let resendLoading = $state(false);
	let resendMessage = $state('');

	const email = $derived($page.url.searchParams.get('email') ?? '');

	async function resend() {
		if (!email) return;
		resendLoading = true;
		resendMessage = '';
		await authClient.sendVerificationEmail({ email, callbackURL: '/' });
		resendLoading = false;
		resendMessage = 'Sent. Check your inbox.';
	}
</script>

<div class="auth-card">
	<h1 class="auth-heading">Check your email</h1>
	<p class="auth-body">
		We’ve sent you a link to confirm your account. Click it and you’re good to go.
	</p>
	<p class="auth-subtext">Didn’t get it? Check spam or resend.</p>
	<md-filled-button onclick={resend} onkeydown={(e: KeyboardEvent) => e.key === 'Enter' && resend()} disabled={resendLoading || !email} role="button" tabindex="0">
		{resendLoading ? 'Sending…' : 'Resend email'}
	</md-filled-button>
	{#if resendMessage}
		<p class="auth-feedback">{resendMessage}</p>
	{/if}
	<p class="auth-links">
		<a href="/sign-in">Back to sign in</a>
	</p>
</div>

<style>
	.auth-card {
		width: 100%;
		max-width: 480px;
		padding: 20px;
	}
	.auth-heading {
		margin: 0 0 24px;
		font-size: 1.5rem;
		font-weight: 500;
	}
	.auth-body {
		margin: 0 0 8px;
		color: var(--md-sys-color-on-surface-variant, #49454f);
	}
	.auth-subtext {
		margin: 0 0 24px;
		font-size: 0.875rem;
		color: var(--md-sys-color-on-surface-variant, #49454f);
	}
	.auth-feedback {
		margin: 16px 0 0;
		font-size: 0.875rem;
		color: var(--md-sys-color-primary, #6750a4);
	}
	.auth-links {
		margin: 24px 0 0;
		font-size: 0.875rem;
	}
	.auth-links a {
		color: var(--md-sys-color-primary, #6750a4);
	}
</style>
