<script lang="ts">
	import { formatNumber } from '$lib/utils/format';
	import '@material/web/button/filled-button.js';

	let { data } = $props();

	let allDays = $state([...(data.days ?? [])]);
	let hasMore = $state(data.hasMore ?? false);
	let nextCursor = $state(data.nextCursor ?? null);
	let loadingMore = $state(false);

	const formatDate = (iso: string) =>
		new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});

	async function loadMore() {
		if (!nextCursor || loadingMore) return;
		loadingMore = true;
		try {
			const res = await fetch(`/history/load-more?before=${encodeURIComponent(nextCursor)}`);
			if (!res.ok) return;
			const json = await res.json();
			allDays = [...allDays, ...(json.days ?? [])];
			hasMore = json.hasMore ?? false;
			nextCursor = json.nextCursor ?? null;
		} finally {
			loadingMore = false;
		}
	}
</script>

<svelte:head>
	<title>History – Nutrimaxxing</title>
</svelte:head>

<div class="history-page">
	<header class="page-header history-header">
		<h2 class="history-title">History</h2>
	</header>

	{#if allDays.length === 0 && !hasMore}
		<div class="empty-state-wrap">
			<div class="empty-state">
				<span class="empty-state-icon material-symbols-outlined" aria-hidden="true">restaurant</span>
				<p class="empty-text">No meals yet.</p>
			</div>
		</div>
	{:else}
		{#if allDays.length > 0}
			<ul class="days-list">
				{#each allDays as day}
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
										<h4 class="meal-name">{meal.name || 'Meal'}</h4>
										<div class="meal-totals-grid">
											<div class="totals-item">
												<span class="totals-label">Calories</span>
												<div class="meal-totals-value">
													<span class="totals-value-number"
														>{formatNumber(meal.totals.caloriesKcal)}</span
													>
													<span class="totals-value-unit">kcal</span>
												</div>
											</div>
											<div class="totals-item">
												<span class="totals-label">Protein</span>
												<div class="meal-totals-value">
													<span class="totals-value-number"
														>{formatNumber(meal.totals.proteinG)}</span
													>
													<span class="totals-value-unit">g</span>
												</div>
											</div>
											<div class="totals-item">
												<span class="totals-label">Carbs</span>
												<div class="meal-totals-value">
													<span class="totals-value-number"
														>{formatNumber(meal.totals.carbohydrateG)}</span
													>
													<span class="totals-value-unit">g</span>
												</div>
											</div>
											<div class="totals-item">
												<span class="totals-label">Sugars</span>
												<div class="meal-totals-value">
													<span class="totals-value-number"
														>{formatNumber(meal.totals.sugarsG)}</span
													>
													<span class="totals-value-unit">g</span>
												</div>
											</div>
											<div class="totals-item">
												<span class="totals-label">Fat</span>
												<div class="meal-totals-value">
													<span class="totals-value-number"
														>{formatNumber(meal.totals.fatG)}</span
													>
													<span class="totals-value-unit">g</span>
												</div>
											</div>
											<div class="totals-item">
												<span class="totals-label">Saturated</span>
												<div class="meal-totals-value">
													<span class="totals-value-number"
														>{formatNumber(meal.totals.saturatedFatG)}</span
													>
													<span class="totals-value-unit">g</span>
												</div>
											</div>
											<div class="totals-item">
												<span class="totals-label">Fiber</span>
												<div class="meal-totals-value">
													<span class="totals-value-number"
														>{formatNumber(meal.totals.fiberG)}</span
													>
													<span class="totals-value-unit">g</span>
												</div>
											</div>
											<div class="totals-item">
												<span class="totals-label">Salt</span>
												<div class="meal-totals-value">
													<span class="totals-value-number"
														>{formatNumber(meal.totals.saltG)}</span
													>
													<span class="totals-value-unit">g</span>
												</div>
											</div>
										</div>
									</div>
								</li>
							{/each}
						</ul>
					{/if}
				</li>
				{/each}
			</ul>
		{/if}
		{#if hasMore}
			<div class="load-more-wrap">
				<md-filled-button
					disabled={loadingMore}
					onclick={loadMore}
				>
					{loadingMore ? 'Loading…' : 'Load more'}
				</md-filled-button>
			</div>
		{/if}
	{/if}
</div>

<style>
	.history-page {
		display: flex;
		flex-direction: column;
		gap: 24px;
		flex: 1;
		min-height: 0;
	}
	.empty-state-wrap {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		min-height: 0;
	}
	.history-header {
		flex-direction: column;
		align-items: flex-start;
		gap: 4px;
	}
	.history-title {
		margin: 0;
	}
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 16px;
	}
	.empty-state-icon {
		font-size: 48px;
		color: var(--md-sys-color-primary);
		opacity: 0.3;
	}
	.empty-text {
		margin: 0;
		font-size: 0.9rem;
		color: var(--md-sys-color-on-surface-variant);
	}
	.days-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 32px;
	}
	.day-card {
		border-radius: 24px;
		padding: 0;
		background: none;
	}
	.day-header {
		display: flex;
		flex-direction: row;
		align-items: baseline;
		justify-content: space-between;
		margin-bottom: 16px;
	}
	.day-title {
		margin: 0;
	}
	.day-calories {
		margin: 0;
		font-size: var(--md-sys-typescale-headline-small-size);
		color: var(--md-sys-color-on-surface-variant);
	}
	.day-empty {
		margin: 0;
		font-size: 0.9rem;
		color: var(--md-sys-color-on-surface-variant);
	}
	.meals-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 20px;
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
		gap: 16px;
		min-width: 0;
		width: 100%;
		padding: 20px;
		background: var(--md-sys-color-surface-container);
		border-radius: 24px;
	}
	.totals-item {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.meal-name {
		margin: 0;
	}
	.meal-totals-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		column-gap: 16px;
		row-gap: 8px;
		width: 100%;
		font-size: 0.8rem;
	}
	.meal-totals-value {
		display: inline-flex;
		align-items: baseline;
		gap: 4px;
	}
	.meal-totals-grid .totals-value-number {
		font-size: var(--md-sys-typescale-title-medium-size, 1.125rem);
		font-weight: 600;
	}
	.meal-calories {
		margin: 0;
		font-size: 0.9rem;
		font-weight: 500;
	}
	.load-more-wrap {
		width: 100%;
	}
	.load-more-wrap :global(md-filled-button) {
		width: 100%;
	}
</style>
