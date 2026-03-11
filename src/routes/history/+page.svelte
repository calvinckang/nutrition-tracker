<script lang="ts">
	import { formatNumber } from '$lib/utils/format';

	let { data } = $props();
	const days = $derived(data.days ?? []);
	const today = $derived(data.today as string);
	const startDate = $derived(data.startDate as string);
	const formatDate = (iso: string) =>
		new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
</script>

<svelte:head>
	<title>History – Nutrimaxxing</title>
</svelte:head>

<div class="history-page">
	<header class="history-header">
		<h2 class="history-title">This week</h2>
		<p class="history-range">
			{formatDate(startDate)} – {formatDate(today)}
		</p>
	</header>

	{#if days.length === 0}
		<p class="empty-text">No meals this week.</p>
	{:else}
		<ul class="days-list">
			{#each days as day}
				<li class="day-card">
					<header class="day-header">
						<h3 class="day-title">
							{formatDate(day.date)}
						</h3>
						<p class="day-calories">{formatNumber(day.totals.caloriesKcal)} kcal</p>
					</header>
					{#if day.meals.length === 0}
						<p class="day-empty">No meals.</p>
					{:else}
						<ul class="meals-list">
							{#each day.meals as meal}
								<li class="meal-row">
									<div class="meal-main">
										<p class="meal-name">{meal.name || 'Meal'}</p>
										<p class="meal-macros">
											<span>{formatNumber(meal.totals.proteinG)} g protein</span>
											<span>{formatNumber(meal.totals.carbohydrateG)} g carbs</span>
											<span>{formatNumber(meal.totals.fatG)} g fat</span>
											<span>{formatNumber(meal.totals.saturatedFatG)} g saturated</span>
											<span>{formatNumber(meal.totals.sugarsG)} g sugars</span>
											<span>{formatNumber(meal.totals.fiberG)} g fiber</span>
											<span>{formatNumber(meal.totals.saltG)} g salt</span>
										</p>
									</div>
									<p class="meal-calories">{formatNumber(meal.totals.caloriesKcal)} kcal</p>
								</li>
							{/each}
						</ul>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.history-page {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	.history-header {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.history-title {
		margin: 0;
		font-size: 1.5rem;
		font-weight: 500;
	}
	.history-range {
		margin: 0;
		font-size: 0.9rem;
		color: var(--md-sys-color-on-surface-variant, #49454f);
	}
	.empty-text {
		margin: 0;
		font-size: 0.9rem;
		color: var(--md-sys-color-on-surface-variant, #49454f);
	}
	.days-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.day-card {
		border-radius: 12px;
		padding: 10px 12px;
		border: 1px solid var(--md-sys-color-outline-variant, #cac4d0);
	}
	.day-header {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		margin-bottom: 6px;
	}
	.day-title {
		margin: 0;
		font-size: 1rem;
		font-weight: 500;
	}
	.day-calories {
		margin: 0;
		font-size: 0.9rem;
		font-weight: 500;
	}
	.day-empty {
		margin: 0;
		font-size: 0.9rem;
		color: var(--md-sys-color-on-surface-variant, #49454f);
	}
	.meals-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.meal-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 8px;
	}
	.meal-main {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}
	.meal-name {
		margin: 0;
		font-size: 0.95rem;
	}
	.meal-macros {
		margin: 0;
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		font-size: 0.8rem;
		color: var(--md-sys-color-on-surface-variant, #49454f);
	}
	.meal-calories {
		margin: 0;
		font-size: 0.9rem;
		font-weight: 500;
	}
</style>
