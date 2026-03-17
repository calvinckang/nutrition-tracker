<script lang="ts">
	import { page } from '$app/stores';
	import { authClient } from '$lib/auth-client';
	import '@material/web/button/filled-button.js';
	import { onMount, tick } from 'svelte';

	let resendLoading = $state(false);
	let resendMessage = $state('');
	let buttonEl: HTMLElement | null = null;

	const email = $derived($page.url.searchParams.get('email') ?? '');

	onMount(async () => {
		// #region agent log
		fetch('http://127.0.0.1:7583/ingest/e7e4ebaa-41fd-47cb-b68d-1ef6657021b9', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-Debug-Session-Id': '690d82'
			},
			body: JSON.stringify({
				sessionId: '690d82',
				runId: 'initial',
				hypothesisId: 'A',
				location: 'check-email/+page.svelte:onMount',
				message: 'check-email mounted',
				data: {
					email,
					resendLoading,
					hasButton: !!buttonEl
				},
				timestamp: Date.now()
			})
		}).catch(() => {});
		// #endregion agent log

		await tick();
		const textContent = buttonEl ? buttonEl.textContent : null;
		const size = buttonEl
			? { width: (buttonEl as HTMLElement).offsetWidth, height: (buttonEl as HTMLElement).offsetHeight }
			: null;

		let labelColor: string | null = null;
		let labelOpacity: string | null = null;
		let buttonBg: string | null = null;

		if (buttonEl instanceof HTMLElement) {
			const anyBtn = buttonEl as any;
			const shadowRoot = anyBtn.shadowRoot as ShadowRoot | null;
			if (shadowRoot) {
				const labelEl = shadowRoot.querySelector('.label') as HTMLElement | null;
				if (labelEl) {
					const cs = getComputedStyle(labelEl);
					labelColor = cs.color;
					labelOpacity = cs.opacity;
				}
				const hostStyles = getComputedStyle(buttonEl);
				buttonBg = hostStyles.backgroundColor;
			}
		}

		// #region agent log
		fetch('http://127.0.0.1:7583/ingest/e7e4ebaa-41fd-47cb-b68d-1ef6657021b9', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-Debug-Session-Id': '690d82'
			},
			body: JSON.stringify({
				sessionId: '690d82',
				runId: 'initial',
				hypothesisId: 'B',
				location: 'check-email/+page.svelte:onMountAfterTick',
				message: 'check-email button after tick',
				data: {
					email,
					resendLoading,
					buttonText: textContent,
					buttonSize: size,
					labelColor,
					labelOpacity,
					buttonBg
				},
				timestamp: Date.now()
			})
		}).catch(() => {});
		// #endregion agent log
	});

	async function resend() {
		if (!email) return;
		resendLoading = true;
		resendMessage = '';
		await authClient.sendVerificationEmail({ email, callbackURL: '/' });
		resendLoading = false;
		resendMessage = 'Sent. Check your inbox.';

		// #region agent log
		fetch('http://127.0.0.1:7583/ingest/e7e4ebaa-41fd-47cb-b68d-1ef6657021b9', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-Debug-Session-Id': '690d82'
			},
			body: JSON.stringify({
				sessionId: '690d82',
				runId: 'initial',
				hypothesisId: 'C',
				location: 'check-email/+page.svelte:resend',
				message: 'resend completed',
				data: {
					email,
					resendLoading,
					resendMessage
				},
				timestamp: Date.now()
			})
		}).catch(() => {});
		// #endregion agent log
	}
</script>

<div class="auth-page">
	<header class="page-header">
		<h1 class="auth-brand">Nutrimaxxing</h1>
	</header>
	<div class="auth-card">
		<h2 class="auth-heading">Check your email</h2>
		<p class="auth-body">
			We’ve sent you a link to confirm your account. Click it and you’re good to go.
		</p>
		<p class="auth-body auth-subtext">Didn’t get it? Check spam or resend.</p>
		<form
			class="auth-form"
			onsubmit={(e) => {
				e.preventDefault();
				resend();
			}}
		>
			<md-filled-button
				type="submit"
				disabled={resendLoading || !email}
				bind:this={buttonEl}
			>
				{resendLoading ? 'Sending…' : 'Resend email'}
			</md-filled-button>
		</form>
		{#if resendMessage}
			<p class="auth-body auth-feedback">{resendMessage}</p>
		{/if}
		<p class="auth-links">
			<a href="/sign-in">Back to sign in</a>
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
	.auth-body {
		margin: 0 0 16px;
		color: var(--md-sys-color-on-surface-variant);
	}
	.auth-subtext {
		margin: 0 0 24px;
	}
	.auth-form {
		display: flex;
		flex-direction: column;
	}
	.auth-form :global(md-filled-button) {
		width: 100%;
		margin-top: 8px;
	}
	.auth-feedback {
		margin: 16px 0 0;
	}
	.auth-links {
		margin: 24px 0 0;
		font-size: 0.875rem;
	}
	.auth-links a {
		color: var(--md-sys-color-primary);
		text-decoration: none;
	}
	.auth-links a:hover {
		text-decoration: underline;
	}
</style>
