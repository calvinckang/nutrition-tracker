<script lang="ts">
	import { goto } from '$app/navigation';
	import { authClient } from '$lib/auth-client';
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
					error =
						msg && msg.toLowerCase().includes('already')
							? 'That email is already in use. Try signing in or use another email.'
							: msg || 'Something went wrong. Try again.';
				}
			}
		);
		loading = false;
		if (!err) goto(`/check-email?email=${encodeURIComponent(email)}`);
	}
</script>

<div class="auth-card">
	<h1 class="auth-heading">Sign up</h1>
	<form class="auth-form" onsubmit={handleSubmit}>
		<label class="auth-label" for="signup-name">Name</label>
		<input id="signup-name" class="auth-input" type="text" required bind:value={name} disabled={loading} autocomplete="name" />
		<label class="auth-label" for="signup-email">Email</label>
		<input id="signup-email" class="auth-input" type="email" required bind:value={email} disabled={loading} autocomplete="email" />
		<label class="auth-label" for="signup-password">Password</label>
		<input id="signup-password" class="auth-input" type="password" required bind:value={password} disabled={loading} autocomplete="new-password" />
		{#if error}
			<p class="auth-error">{error}</p>
		{/if}
		<md-filled-button type="submit" disabled={loading}>
			{loading ? 'Creating account…' : 'Sign up'}
		</md-filled-button>
	</form>
	<p class="auth-links">
		<a href="/sign-in">Already have an account? Sign in</a>
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
