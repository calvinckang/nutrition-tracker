<script lang="ts">
	import { formatNumber } from '$lib/utils/format';

	let { data } = $props();
	const today = $derived(data.today as string);
	const meals = $derived(data.meals ?? []);
	const dailyTotals = $derived(data.dailyTotals ?? {});
	const foods = $derived(data.foods ?? []);
	const selectedUnits = $state<Record<string, string>>({});
	function handleFoodInput(mealId: string, value: string) {
		const optionLabel = value.trim();
		const food = foods.find((f: any) => {
			const label = f.brand ? `${f.name} – ${f.brand}` : f.name;
			return label === optionLabel;
		});
		selectedUnits[mealId] = food?.servingUnit ?? '';
	}
	const formatDate = (iso: string) =>
		new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
</script>

<svelte:head>
	<title>Today – Nutrimaxxing</title>
</svelte:head>

<div class="today-page">
	<header class="today-header">
		<h2 class="today-title">Today</h2>
		<p class="today-date">{formatDate(today)}</p>
	</header>

	<section class="today-totals" aria-label="Today's totals">
		<div class="totals-row">
			<span class="totals-label">Calories</span>
			<span class="totals-value">{formatNumber(dailyTotals.caloriesKcal)} kcal</span>
		</div>
		<div class="totals-grid">
			<div class="totals-item">
				<span class="totals-label">Protein</span>
				<span class="totals-value">{formatNumber(dailyTotals.proteinG)} g</span>
			</div>
			<div class="totals-item">
				<span class="totals-label">Carbs</span>
				<span class="totals-value">{formatNumber(dailyTotals.carbohydrateG)} g</span>
			</div>
			<div class="totals-item">
				<span class="totals-label">Fat</span>
				<span class="totals-value">{formatNumber(dailyTotals.fatG)} g</span>
			</div>
			<div class="totals-item">
				<span class="totals-label">Saturated</span>
				<span class="totals-value">{formatNumber(dailyTotals.saturatedFatG)} g</span>
			</div>
			<div class="totals-item">
				<span class="totals-label">Sugars</span>
				<span class="totals-value">{formatNumber(dailyTotals.sugarsG)} g</span>
			</div>
			<div class="totals-item">
				<span class="totals-label">Fiber</span>
				<span class="totals-value">{formatNumber(dailyTotals.fiberG)} g</span>
			</div>
			<div class="totals-item">
				<span class="totals-label">Salt</span>
				<span class="totals-value">{formatNumber(dailyTotals.saltG)} g</span>
			</div>
		</div>
	</section>

	<section class="meals-section" aria-label="Meals">
		<header class="meals-header">
			<h3 class="meals-title">Meals</h3>
			<form method="POST" action="?/createMeal">
				<input
					type="text"
					name="name"
					class="form-input meal-name-input"
					placeholder="Meal name (optional)"
					autocomplete="off"
				/>
				<input type="hidden" name="day" value="today" />
				<button type="submit" class="link-button">Add meal</button>
			</form>
		</header>

		{#if meals.length === 0}
			<p class="empty-text">Nothing logged yet today.</p>
		{:else}
			<ul class="meals-list">
				{#each meals as meal}
					<li class="meal-card">
						<header class="meal-header">
							<div>
								<p class="meal-name">{meal.name || 'Meal'}</p>
							</div>
							<form method="POST" action="?/deleteMeal">
								<input type="hidden" name="mealId" value={meal.id} />
								<button
									type="submit"
									class="link-button danger"
									onclick={(e) => {
										if (!confirm('Delete this meal? You can’t undo this.')) e.preventDefault();
									}}
								>
									Delete
								</button>
							</form>
						</header>

						{#if meal.items.length === 0}
							<p class="meal-empty">No items yet.</p>
						{:else}
							<ul class="items-list">
								{#each meal.items as item}
									<li class="item-row">
										<div class="item-main">
											<p class="item-name">
												{item.food ? item.food.name : 'Food removed'}
												{#if item.food?.brand}
													<span class="item-brand">· {item.food.brand}</span>
												{/if}
											</p>
											<p class="item-meta">
												{formatNumber(item.amount)} {item.unit}
											</p>
										</div>
										<form method="POST" action="?/deleteItem">
											<input type="hidden" name="itemId" value={item.id} />
											<button type="submit" class="link-button danger small">Remove</button>
										</form>
									</li>
								{/each}
							</ul>
						{/if}

						<form method="POST" action="?/addItem" class="add-item-form">
							<input type="hidden" name="mealId" value={meal.id} />
							<label class="add-item-label">
								<span>Food</span>
								<input
									name="foodEntryId"
									class="form-input"
									list="foods-datalist"
									required
									placeholder="Start typing a food name"
									autocomplete="off"
									onchange={(e) => handleFoodInput(meal.id, (e.currentTarget as HTMLInputElement).value)}
								/>
							</label>
							<label class="add-item-label">
								<span>Amount{#if selectedUnits[meal.id]} ({selectedUnits[meal.id]}){/if}</span>
								<input
									name="amount"
									class="form-input"
									type="number"
									required
									step="0.01"
									inputmode="decimal"
									min="0.01"
									value="0"
								/>
							</label>
							<button type="submit" class="primary-button">Add item</button>
						</form>
					</li>
				{/each}
			</ul>
		{/if}
	</section>
</div>

<datalist id="foods-datalist">
	{#each foods as food}
		<option value={food.brand ? `${food.name} – ${food.brand}` : food.name}></option>
	{/each}
</datalist>

<style>
	.today-page {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	.today-header {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.today-title {
		margin: 0;
		font-size: 1.5rem;
		font-weight: 500;
	}
	.today-date {
		margin: 0;
		font-size: 0.9rem;
		color: var(--md-sys-color-on-surface-variant, #49454f);
	}
	.today-totals {
		padding: 12px 16px;
		border-radius: 12px;
		background: color-mix(in srgb, var(--md-sys-color-surface-container, #f3edf7), transparent 0%);
	}
	.totals-row {
		display: flex;
		justify-content: space-between;
		margin-bottom: 8px;
	}
	.totals-label {
		font-size: 0.85rem;
		color: var(--md-sys-color-on-surface-variant, #49454f);
	}
	.totals-value {
		font-weight: 500;
	}
	.totals-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 8px;
	}
	.totals-item {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.meals-section {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.meals-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.meals-title {
		margin: 0;
		font-size: 1.1rem;
		font-weight: 500;
	}
	.meal-name-input {
		max-width: 160px;
		margin-right: 8px;
	}
	.link-button {
		border: none;
		padding: 0;
		background: none;
		color: var(--md-sys-color-primary, #6750a4);
		font-size: 0.9rem;
		cursor: pointer;
	}
	.link-button.danger {
		color: var(--md-sys-color-error, #b3261e);
	}
	.link-button.small {
		font-size: 0.8rem;
	}
	.empty-text,
	.meal-empty {
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
		gap: 12px;
	}
	.meal-card {
		border-radius: 12px;
		padding: 12px 12px 8px;
		border: 1px solid var(--md-sys-color-outline-variant, #cac4d0);
	}
	.meal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 8px;
	}
	.meal-name {
		margin: 0;
		font-weight: 500;
	}
	.items-list {
		list-style: none;
		margin: 0 0 8px;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.item-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 8px;
	}
	.item-main {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}
	.item-name {
		margin: 0;
		font-size: 0.95rem;
	}
	.item-brand {
		font-size: 0.85rem;
		color: var(--md-sys-color-on-surface-variant, #49454f);
	}
	.item-meta {
		margin: 0;
		font-size: 0.8rem;
		color: var(--md-sys-color-on-surface-variant, #49454f);
	}
	.add-item-form {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin-top: 8px;
	}
	.add-item-label {
		display: flex;
		flex-direction: column;
		gap: 4px;
		font-size: 0.8rem;
		color: var(--md-sys-color-on-surface-variant, #49454f);
	}
	.form-input {
		width: 100%;
		padding: 8px 10px;
		border-radius: 6px;
		border: 1px solid var(--md-sys-color-outline, #79747e);
		font-size: 0.9rem;
		box-sizing: border-box;
	}
	.primary-button {
		margin-top: 4px;
		padding: 8px 12px;
		border-radius: 999px;
		border: none;
		background: var(--md-sys-color-primary, #6750a4);
		color: var(--md-sys-color-on-primary, #fff);
		font-size: 0.9rem;
		cursor: pointer;
		align-self: flex-end;
	}
</style>
