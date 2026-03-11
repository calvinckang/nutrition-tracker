<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { initTheme } from '$lib/theme';

	// Material Web components used in layout
	import '@material/web/button/filled-button.js';

	let { children } = $props();

	onMount(() => {
		initTheme();
	});

	const navItems = [
		{ label: 'Today', href: '/', icon: 'today' },
		{ label: 'History', href: '/history', icon: 'calendar_month' },
		{ label: 'Foods', href: '/foods', icon: 'restaurant' },
		{ label: 'Settings', href: '/settings', icon: 'settings' }
	];

	const authPaths = ['/sign-in', '/sign-up', '/forgot-password', '/check-email', '/reset-password'];
	const isAuthRoute = (pathname: string) => authPaths.some((p) => pathname === p || pathname.startsWith(p + '/'));

	const isNavActive = (href: string, pathname: string) =>
		pathname === href || (href !== '/' && pathname.startsWith(href + '/'));
</script>

<svelte:head>
	<!-- Theme is set in app.html inline script to avoid FOUC -->
</svelte:head>

{#if isAuthRoute($page.url.pathname)}
	{@render children()}
{:else}
<div class="app-shell">
	<header class="top-app-bar">
		<h1 class="top-app-bar__title">Nutrimaxxing</h1>
	</header>

	<main class="main-content">
		{@render children()}
	</main>

	<nav class="bottom-nav">
		<div class="bottom-nav__bar bottom-nav__bar--plain">
			{#each navItems as item}
				<a
					href={item.href}
					class="bottom-nav__link"
					class:bottom-nav__link--active={isNavActive(item.href, $page.url.pathname)}
					aria-label={item.label}
					data-sveltekit-preload-data="hover"
				>
					<span class="material-symbols-outlined bottom-nav__icon">{item.icon}</span>
					<span class="bottom-nav__label">{item.label}</span>
				</a>
			{/each}
		</div>
	</nav>
</div>
{/if}
