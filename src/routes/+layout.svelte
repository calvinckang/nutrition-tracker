<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { initTheme } from '$lib/theme';

	// Material Web components used in layout
	import '@material/web/button/filled-button.js';
	import '@material/web/labs/navigationbar/navigation-bar.js';
	import '@material/web/labs/navigationtab/navigation-tab.js';

	let { children } = $props();

	onMount(() => {
		initTheme();
	});

	const navItems = [
		{ label: 'Today', href: '/' },
		{ label: 'History', href: '/history' },
		{ label: 'Foods', href: '/foods' },
		{ label: 'Settings', href: '/settings' }
	];

	const authPaths = ['/sign-in', '/sign-up', '/forgot-password', '/check-email', '/reset-password'];
	const isAuthRoute = (pathname: string) => authPaths.some((p) => pathname === p || pathname.startsWith(p + '/'));
</script>

<svelte:head>
	<!-- Theme is set in app.html inline script to avoid FOUC -->
</svelte:head>

{#if isAuthRoute($page.url.pathname)}
	{@render children()}
{:else}
<div class="app-shell">
	<header class="top-app-bar">
		<h1 class="top-app-bar__title">Nutrition Tracker</h1>
	</header>

	<main class="main-content">
		{@render children()}
	</main>

	<nav class="bottom-nav">
		<md-navigation-bar class="bottom-nav__bar">
			{#each navItems as item}
				<a href={item.href} class="nav-tab-link" aria-label={item.label} data-sveltekit-preload-data="hover">
					<md-navigation-tab
						label={item.label}
						active={$page.url.pathname === item.href || (item.href !== '/' && $page.url.pathname.startsWith(item.href + '/'))}
					></md-navigation-tab>
				</a>
			{/each}
		</md-navigation-bar>
	</nav>
</div>
{/if}
