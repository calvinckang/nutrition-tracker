<script lang="ts">
	import { formatNumber } from '$lib/utils/format';
	import '@material/web/textfield/outlined-text-field.js';
	import '@material/web/button/filled-button.js';
	import '@material/web/button/outlined-button.js';
	import '@material/web/button/text-button.js';
	import '@material/web/iconbutton/icon-button.js';

	let { data } = $props();
	const today = $derived(data.today as string);
	const meals = $derived(data.meals ?? []);
	const dailyTotals = $derived(data.dailyTotals ?? {});
	const foods = $derived(data.foods ?? []);
	const selectedUnits = $state<Record<string, string>>({});
	const selectedFoodIdByMeal = $state<Record<string, string>>({});
	const foodInputValueByMeal = $state<Record<string, string>>({});
	let openFoodDropdownMealId = $state<string | null>(null);
	let dropdownBlurTimeout: ReturnType<typeof setTimeout> | null = null;

	function foodLabel(food: { name: string; brand?: string | null }) {
		return food.brand ? `${food.name} – ${food.brand}` : food.name;
	}

	function filteredFoodsForMeal(mealId: string) {
		const query = (foodInputValueByMeal[mealId] ?? '').trim().toLowerCase();
		if (!query) return foods;
		return foods.filter((f: any) => foodLabel(f).toLowerCase().includes(query));
	}

	function handleFoodInput(mealId: string, value: string) {
		foodInputValueByMeal[mealId] = value;
		const optionLabel = value.trim();
		const food = foods.find((f: any) => foodLabel(f) === optionLabel);
		selectedUnits[mealId] = food?.servingUnit ?? '';
		selectedFoodIdByMeal[mealId] = food?.id ?? '';
	}

	function selectFood(mealId: string, food: { id: string; name: string; brand?: string | null; servingUnit?: string }) {
		const label = foodLabel(food);
		foodInputValueByMeal[mealId] = label;
		selectedUnits[mealId] = food.servingUnit ?? '';
		selectedFoodIdByMeal[mealId] = food.id;
		openFoodDropdownMealId = null;
	}

	function scheduleCloseDropdown() {
		dropdownBlurTimeout = setTimeout(() => {
			openFoodDropdownMealId = null;
			dropdownBlurTimeout = null;
		}, 150);
	}

	function cancelCloseDropdown() {
		if (dropdownBlurTimeout) {
			clearTimeout(dropdownBlurTimeout);
			dropdownBlurTimeout = null;
		}
	}

	function clearFoodInput(mealId: string) {
		foodInputValueByMeal[mealId] = '';
		selectedFoodIdByMeal[mealId] = '';
		selectedUnits[mealId] = '';
	}

	const formatDate = (iso: string) =>
		new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
</script>

<svelte:head>
	<title>Today – Nutrimaxxing</title>
</svelte:head>

<div class="today-page">
	<header class="page-header today-header">
		<h2 class="today-title">Today</h2>
		<p class="today-date">{formatDate(today)}</p>
	</header>

	<section class="today-totals" aria-label="Today's totals">
		<div class="totals-grid">
			<div class="totals-item">
				<span class="totals-label">Calories</span>
				<span class="totals-value">
					<span class="totals-value-number">{formatNumber(dailyTotals.caloriesKcal)}</span>
					<span class="totals-value-unit">kcal</span>
				</span>
			</div>
			<div class="totals-item">
				<span class="totals-label">Protein</span>
				<span class="totals-value">
					<span class="totals-value-number">{formatNumber(dailyTotals.proteinG)}</span>
					<span class="totals-value-unit">g</span>
				</span>
			</div>
			<div class="totals-item">
				<span class="totals-label">Carbs</span>
				<span class="totals-value">
					<span class="totals-value-number">{formatNumber(dailyTotals.carbohydrateG)}</span>
					<span class="totals-value-unit">g</span>
				</span>
			</div>
			<div class="totals-item">
				<span class="totals-label">Fat</span>
				<span class="totals-value">
					<span class="totals-value-number">{formatNumber(dailyTotals.fatG)}</span>
					<span class="totals-value-unit">g</span>
				</span>
			</div>
			<div class="totals-item">
				<span class="totals-label">Saturated</span>
				<span class="totals-value">
					<span class="totals-value-number">{formatNumber(dailyTotals.saturatedFatG)}</span>
					<span class="totals-value-unit">g</span>
				</span>
			</div>
			<div class="totals-item">
				<span class="totals-label">Sugars</span>
				<span class="totals-value">
					<span class="totals-value-number">{formatNumber(dailyTotals.sugarsG)}</span>
					<span class="totals-value-unit">g</span>
				</span>
			</div>
			<div class="totals-item">
				<span class="totals-label">Fiber</span>
				<span class="totals-value">
					<span class="totals-value-number">{formatNumber(dailyTotals.fiberG)}</span>
					<span class="totals-value-unit">g</span>
				</span>
			</div>
			<div class="totals-item">
				<span class="totals-label">Salt</span>
				<span class="totals-value">
					<span class="totals-value-number">{formatNumber(dailyTotals.saltG)}</span>
					<span class="totals-value-unit">g</span>
				</span>
			</div>
		</div>
	</section>

	<section class="meals-section" aria-label="Meals">
		<header class="meals-header">
			<h3 class="meals-title">Meals</h3>
			<form
				method="POST"
				action="?/createMeal"
				class="meals-create-form"
				onkeydown={(e) => {
					if (e.key !== 'Enter') return;
					if (document.activeElement instanceof HTMLTextAreaElement) return;
					e.preventDefault();
					(e.currentTarget as HTMLFormElement).requestSubmit();
				}}
			>
				<md-outlined-text-field
					name="name"
					class="meal-name-input"
					label="Meal name (optional)"
					autocomplete="off"
				></md-outlined-text-field>
				<input type="hidden" name="day" value="today" />
				<md-outlined-button type="submit">Add meal</md-outlined-button>
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
								<p class="meal-name meal-name--today">{meal.name || 'Meal'}</p>
							</div>
							<form method="POST" action="?/deleteMeal">
								<input type="hidden" name="mealId" value={meal.id} />
								<md-text-button
									onclick={(e) => {
										const form = (e.currentTarget as HTMLElement).closest('form') as HTMLFormElement | null;
										if (!form) return;
										if (!confirm('Delete this meal? You can’t undo this.')) return;
										form.requestSubmit();
									}}
								>
									Delete
								</md-text-button>
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
											<md-icon-button
												type="button"
												aria-label="Remove item"
												onclick={(e) => {
													const form = (e.currentTarget as HTMLElement).closest('form') as HTMLFormElement | null;
													if (!form) return;
													form.requestSubmit();
												}}
											>
												<span class="material-symbols-outlined">close</span>
											</md-icon-button>
										</form>
									</li>
								{/each}
							</ul>
						{/if}

						<form
							method="POST"
							action="?/addItem"
							class="add-item-form"
							onsubmit={(e) => {
								if (!selectedFoodIdByMeal[meal.id]) {
									e.preventDefault();
								}
							}}
							onkeydown={(e) => {
								if (e.key !== 'Enter') return;
								if (document.activeElement instanceof HTMLTextAreaElement) return;
								e.preventDefault();
								(e.currentTarget as HTMLFormElement).requestSubmit();
							}}
						>
							<input type="hidden" name="mealId" value={meal.id} />
							<input type="hidden" name="foodEntryId" value={selectedFoodIdByMeal[meal.id] ?? ''} />
							<div class="add-item-label">
								<span>Food</span>
								<div class="food-input-wrap">
									<input
										type="text"
										placeholder="Start typing a food name"
										autocomplete="off"
										aria-label="Food name"
										aria-expanded={openFoodDropdownMealId === meal.id}
										aria-haspopup="listbox"
										aria-autocomplete="list"
										class="food-name-input"
										required
										value={foodInputValueByMeal[meal.id] ?? ''}
										oninput={(e) => handleFoodInput(meal.id, (e.currentTarget as HTMLInputElement).value)}
										onfocus={() => {
											cancelCloseDropdown();
											openFoodDropdownMealId = meal.id;
										}}
										onblur={scheduleCloseDropdown}
									/>
									{#if (foodInputValueByMeal[meal.id] ?? '').trim()}
										<button
											type="button"
											class="food-name-input-clear"
											aria-label="Clear food"
											onmousedown={(e) => e.preventDefault()}
											onclick={() => clearFoodInput(meal.id)}
										>
											<span class="material-symbols-outlined">close</span>
										</button>
									{/if}
									{#if openFoodDropdownMealId === meal.id}
										<div
											class="food-dropdown"
											role="listbox"
											onmouseenter={cancelCloseDropdown}
											onmouseleave={scheduleCloseDropdown}
										>
											{#each filteredFoodsForMeal(meal.id) as food (food.id)}
												<button
													type="button"
													class="food-dropdown-item"
													role="option"
													onmousedown={(e) => e.preventDefault()}
													onclick={() => selectFood(meal.id, food)}
												>
													<span class="food-dropdown-item__primary">{food.name}</span>
													{#if food.brand}
														<span class="food-dropdown-item__secondary">{food.brand}</span>
													{/if}
												</button>
											{/each}
											{#if filteredFoodsForMeal(meal.id).length === 0}
												<div class="food-dropdown-empty" role="option">No foods match</div>
											{/if}
										</div>
									{/if}
								</div>
							</div>
							<div class="add-item-label">
								<span>Amount{#if selectedUnits[meal.id]}<span class="amount-unit">({selectedUnits[meal.id]})</span>{/if}</span>
								<md-outlined-text-field
									aria-label="Amount"
									name="amount"
									type="number"
									required
									no-asterisk
									step="0.01"
									inputmode="decimal"
									min="0.01"
									value="0"
								></md-outlined-text-field>
							</div>
							<md-filled-button type="submit">Add item</md-filled-button>
						</form>
					</li>
				{/each}
			</ul>
		{/if}
	</section>
</div>

<style>
	.today-page {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}
	.today-title {
		margin: 0;
	}
	.today-date {
		margin: 0;
		font-size: var(--md-sys-typescale-body-large-size);
		color: var(--md-sys-color-on-surface-variant, #49454f);
	}
	.today-totals {
		padding: 20px 20px;
		border-radius: 24px;
		background: color-mix(in srgb, var(--md-sys-color-surface-container, #fffbfe), transparent 0%);
	}
	.totals-row {
		display: flex;
		justify-content: space-between;
		margin-bottom: 8px;
	}
	.totals-label {
		font-size: 0.8rem;
		color: var(--md-sys-color-on-surface-variant, #49454f);
	}
	.totals-value {
		display: inline-flex;
		align-items: baseline;
		gap: 4px;
		font-weight: 600;
	}
	.totals-value-number {
		font-size: 1.4rem;
	}
	.totals-value-unit {
		font-size: 0.8rem;
		color: var(--md-sys-color-on-surface-variant, #49454f);
	}
	.totals-grid {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		column-gap: 16px;
		row-gap: 16px;
	}
	.totals-item {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.meals-section {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}
	.meals-header {
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: flex-start;
		gap: 12px;
	}
	.meals-title {
		margin: 0;
	}
	.meal-name-input {
		width: 100%;
		margin-right: 0px;
		max-width: none;
	}
	.meals-create-form {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 24px;
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
		gap: 16px;
	}
	.meal-card {
		border-radius: 24px;
		padding: 20px;
		background: var(--md-sys-color-surface-container, #fffbfe);
	}
	.meal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16px;
	}
	.meal-name {
		margin: 0;
	}
	.meal-name--today {
		font-size: var(--md-sys-typescale-headline-small-size);
		font-weight: var(--md-sys-typescale-headline-small-weight);
		line-height: var(--md-sys-typescale-headline-small-line-height);
	}
	.items-list {
		list-style: none;
		margin: 0 0 10px;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.item-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 12px;
	}
	.item-main {
		display: flex;
		flex-direction: column;
		gap: 4px;
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
		gap: 16px;
		margin-top: 16px;
	}
	.add-item-label {
		display: flex;
		flex-direction: column;
		gap: 4px;
		font-size: 0.8rem;
		color: var(--md-sys-color-on-surface-variant, #49454f);
	}
	.amount-unit {
		margin-left: 4px;
	}
	.food-name-input {
		box-sizing: border-box;
		width: 100%;
		height: 56px;
		padding: 16px 48px 16px 16px;
		border-radius: 6px;
		border: 1px solid var(--md-sys-color-outline, #79747e);
		background: transparent;
		font: inherit;
		font-size: 1rem;
		color: var(--md-sys-color-on-surface, #1d1b1f);
	}
	.food-name-input::placeholder {
		color: var(--md-sys-color-on-surface-variant, #49454f);
	}
	.food-name-input:focus {
		outline: none;
		border-color: var(--md-sys-color-primary, #6750a4);
		border-width: 2px;
		padding: 15px 47px 15px 15px;
	}
	.food-name-input-clear {
		position: absolute;
		top: 50%;
		right: 12px;
		transform: translateY(-50%);
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		padding: 0;
		border: none;
		background: transparent;
		border-radius: 50%;
		color: var(--md-sys-color-on-surface-variant, #49454f);
		cursor: pointer;
		transition: background-color 0.15s ease, color 0.15s ease;
	}
	.food-name-input-clear:hover {
		background: color-mix(in srgb, var(--md-sys-color-on-surface-variant, #49454f) 12%);
		color: var(--md-sys-color-on-surface, #1d1b1f);
	}
	.food-name-input-clear .material-symbols-outlined {
		font-size: 1.25rem;
	}
	.food-input-wrap {
		position: relative;
		width: 100%;
	}
	/* M3 menu/dropdown: surface container, elevation 2, 4px corners, 8px vertical padding */
	.food-dropdown {
		position: absolute;
		top: calc(100% + 4px);
		left: 0;
		right: 0;
		z-index: 20;
		max-height: 288px;
		overflow-y: auto;
		border-radius: 4px;
		background: var(--md-sys-color-surface-container, #fffbfe);
		box-shadow:
			0 3px 3px -2px rgba(0, 0, 0, 0.2),
			0 2px 2px 0 rgba(0, 0, 0, 0.14),
			0 1px 5px 0 rgba(0, 0, 0, 0.12);
		padding: 8px 0;
	}
	/* M3 list item: 16px horizontal padding, min 48px height, typography body-large / label-large */
	.food-dropdown-item {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 2px;
		width: 100%;
		min-height: 48px;
		padding: 12px 16px;
		border: none;
		background: transparent;
		text-align: left;
		font: inherit;
		font-size: var(--md-sys-typescale-body-large-size, 1rem);
		line-height: var(--md-sys-typescale-body-large-line-height, 1.5rem);
		color: var(--md-sys-color-on-surface, #1d1b1f);
		cursor: pointer;
		transition: background-color 0.15s ease;
	}
	.food-dropdown-item:hover,
	.food-dropdown-item:focus-visible {
		background: color-mix(in srgb, var(--md-sys-color-primary, #6750a4) 8%, transparent);
	}
	.food-dropdown-item:focus {
		outline: none;
	}
	.food-dropdown-item__primary {
		font-weight: var(--md-sys-typescale-body-large-weight, 400);
	}
	.food-dropdown-item__secondary {
		font-size: var(--md-sys-typescale-body-medium-size, 0.875rem);
		line-height: var(--md-sys-typescale-body-medium-line-height, 1.25rem);
		color: var(--md-sys-color-on-surface-variant, #49454f);
	}
	.food-dropdown-empty {
		padding: 12px 16px;
		font-size: var(--md-sys-typescale-body-medium-size, 0.875rem);
		color: var(--md-sys-color-on-surface-variant, #49454f);
	}
	md-filled-button {
		width: 100%;
		margin-top: 8px;
	}
</style>
