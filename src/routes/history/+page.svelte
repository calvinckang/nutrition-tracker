<script lang="ts">
	import { formatNumber } from '$lib/utils/format';

	let { data } = $props();
	const days = $derived(data.days ?? []);
	const today = $derived(data.today as string);
	const startDate = $derived(data.startDate as string);
	const formatDate = (iso: string) =>
		new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
</script>

<svelte:head>
	<title>History – Nutrimaxxing</title>
</svelte:head>

<div class="history-page">
	<header class="page-header history-header">
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
						<p class="day-calories">
							<span class="day-calories-number">{formatNumber(day.totals.caloriesKcal)}</span>
							<span class="day-calories-unit">kcal</span>
						</p>
					</header>
					{#if day.meals.length === 0}
						<p class="day-empty">No meals.</p>
					{:else}
						<ul class="meals-list">
							{#each day.meals as meal}
								<li class="meal-row">
									<div class="meal-main">
										<p class="meal-name">{meal.name || 'Meal'}</p>
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
</div>

<style>
	.history-page {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}
	.history-title {
		margin: 0;
	}
	.history-range {
		margin: 0;
		font-size: var(--md-sys-typescale-body-large-size);
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
		gap: 20px;
	}
	.day-card {
		border-radius: 24px;
		padding: 20px 20px;
		background: var(--md-sys-color-surface-container, #fffbfe);
	}
	.day-header {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		margin-bottom: 24px;
	}
	.day-title {
		margin: 0;
	}
	.day-calories {
		margin: 0;
		display: inline-flex;
		align-items: baseline;
		gap: 4px;
	}
	.day-calories-number {
		font-size: var(--md-sys-typescale-title-medium-size, 1.125rem);
		font-weight: 600;
	}
	.day-calories-unit {
		font-size: 0.8rem;
		color: var(--md-sys-color-on-surface-variant, #49454f);
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
		gap: 24px;
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
		gap: 8px;
		min-width: 0;
		width: 100%;
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
		color: var(--md-sys-color-on-surface-variant, #49454f);
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
</style>
