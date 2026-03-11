<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { formatNumber } from '$lib/utils/format';
	import '@material/web/button/filled-button.js';
	import '@material/web/button/outlined-button.js';
	import '@material/web/button/text-button.js';
	import '@material/web/dialog/dialog.js';
	import '@material/web/fab/fab.js';

	let { data } = $props();
	const isAdmin = $derived(data?.role === 'admin');
	const foods = $derived(data?.foods ?? []);
	const toast = $derived($page.url.searchParams.get('toast'));

	let deleteTarget = $state<{ id: string; name: string } | null>(null);
	let dialogOpen = $state(false);

	function openDelete(food: { id: string; name: string }) {
		deleteTarget = food;
		dialogOpen = true;
	}
	function closeDelete() {
		deleteTarget = null;
		dialogOpen = false;
	}

	$effect(() => {
		if (toast === 'saved' || toast === 'deleted') {
			const t = setTimeout(() => goto('/foods', { replaceState: true }), 2000);
			return () => clearTimeout(t);
		}
	});
</script>

<svelte:head>
	<title>Foods – Nutrition Tracker</title>
</svelte:head>

<div class="foods-page">
	{#if foods.length === 0}
		<div class="empty-state">
			<p class="empty-state__text">No foods in the list yet.</p>
			{#if isAdmin}
				<a href="/foods/new" data-sveltekit-preload-data="hover">
					<md-filled-button>Add a food</md-filled-button>
				</a>
			{/if}
		</div>
	{:else}
		<ul class="food-list" role="list">
			{#each foods as food}
				<li class="food-item">
					<div class="food-item__main">
						<span class="food-item__name">{food.name}</span>
						{#if food.brand}
							<span class="food-item__brand">{food.brand}</span>
						{/if}
						<span class="food-item__meta">
							{formatNumber(food.servingAmount)} {food.servingUnit ?? 'g'} · {formatNumber(food.caloriesKcal)} kcal
						</span>
					</div>
					{#if isAdmin}
						<div class="food-item__actions">
							<a href="/foods/{food.id}/edit" data-sveltekit-preload-data="hover">
								<md-text-button>Edit</md-text-button>
							</a>
							<md-text-button onclick={() => openDelete({ id: food.id, name: food.name })}>Delete</md-text-button>
						</div>
					{/if}
				</li>
			{/each}
		</ul>
		{#if isAdmin}
			<a href="/foods/new" class="fab-link" data-sveltekit-preload-data="hover" aria-label="Add a food">
				<md-fab label="Add a food" variant="primary"></md-fab>
			</a>
		{/if}
	{/if}
</div>

{#if isAdmin}
	<md-dialog open={dialogOpen} onclosed={() => { dialogOpen = false; deleteTarget = null; }}>
		<div slot="headline">Delete this food?</div>
		<form slot="content" method="dialog">
			<p>You can't undo this. It will stay removed from past meals too.</p>
		</form>
		<div slot="actions">
			<md-text-button type="button" onclick={closeDelete}>Cancel</md-text-button>
			{#if deleteTarget}
				<form method="POST" action="?/delete">
					<input type="hidden" name="id" value={deleteTarget.id} />
					<md-filled-button type="submit">Delete</md-filled-button>
				</form>
			{/if}
		</div>
	</md-dialog>
{/if}

{#if toast === 'saved'}
	<p class="toast" role="status">Food saved.</p>
{:else if toast === 'deleted'}
	<p class="toast" role="status">Deleted.</p>
{/if}

<style>
	.foods-page {
		min-height: 200px;
	}
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
		padding: 32px 16px;
		text-align: center;
	}
	.empty-state__text {
		margin: 0;
		color: var(--md-sys-color-on-surface-variant, #49454f);
	}
	.food-list {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.food-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 12px 0;
		border-bottom: 1px solid var(--md-sys-color-outline-variant, #cac4d0);
	}
	.food-item__main {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}
	.food-item__name {
		font-weight: 500;
	}
	.food-item__brand {
		font-size: 0.875rem;
		color: var(--md-sys-color-on-surface-variant, #49454f);
	}
	.food-item__meta {
		font-size: 0.75rem;
		color: var(--md-sys-color-on-surface-variant, #49454f);
	}
	.food-item__actions {
		display: flex;
		gap: 4px;
		flex-shrink: 0;
	}
	.fab-link {
		position: fixed;
		/* Stay inside the centered 600px app shell on wide screens, and 16px from the edge on small screens */
		right: max(16px, calc((100vw - 600px) / 2 + 16px));
		/* Sit comfortably above the bottom nav */
		bottom: 96px;
		text-decoration: none;
		color: inherit;
	}
	.toast {
		position: fixed;
		bottom: 80px;
		left: 50%;
		transform: translateX(-50%);
		margin: 0;
		padding: 12px 20px;
		background: var(--md-sys-color-inverse-surface, #313033);
		color: var(--md-sys-color-inverse-on-surface, #e6e1e5);
		border-radius: 28px;
		font-size: 0.875rem;
		z-index: 10;
	}
</style>
