<script lang="ts">
	import { tick } from 'svelte';
	import { page } from '$app/stores';
	import { formatNumber } from '$lib/utils/format';
	import '@material/web/textfield/filled-text-field.js';
	import '@material/web/button/filled-button.js';
	import '@material/web/button/outlined-button.js';
	import '@material/web/button/text-button.js';
	import '@material/web/iconbutton/icon-button.js';
	import '@material/web/menu/menu.js';
	import '@material/web/menu/menu-item.js';
	import '@material/web/dialog/dialog.js';

	let { data } = $props();
	let deleteMealTarget = $state<{ id: string; name: string | null } | null>(null);
	let deleteMealDialogOpen = $state(false);

	function openDeleteMeal(meal: { id: string; name: string | null }) {
		deleteMealTarget = meal;
		deleteMealDialogOpen = true;
	}
	function closeDeleteMeal() {
		deleteMealTarget = null;
		deleteMealDialogOpen = false;
	}
	const today = $derived(data.today as string);
	const meals = $derived(data.meals ?? []);
	const dailyTotals = $derived(data.dailyTotals ?? {});
	const foods = $derived(data.foods ?? []);
	const selectedUnits = $state<Record<string, string>>({});
	const selectedFoodIdByMeal = $state<Record<string, string>>({});
	const foodInputValueByMeal = $state<Record<string, string>>({});
	const foodMenuWidthByMeal = $state<Record<string, number>>({});
	let openFoodDropdownMealId = $state<string | null>(null);
	const amountErrorByMeal = $state<Record<string, string>>({});

	function normalizeDecimal(value: string): string {
		const trimmed = value.trim().replace(',', '.');
		if (!trimmed) return '';
		if (!/^\d+(\.\d+)?$/.test(trimmed)) return '';
		return trimmed;
	}

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

	function selectFood(
		mealId: string,
		food: { id: string; name: string; brand?: string | null; servingUnit?: string }
	) {
		const label = foodLabel(food);
		foodInputValueByMeal[mealId] = label;
		selectedUnits[mealId] = food.servingUnit ?? '';
		selectedFoodIdByMeal[mealId] = food.id;
		openFoodDropdownMealId = null;
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

	// Scroll to new meal when returning from createMeal redirect
	$effect(() => {
		const scrollParam = $page.url.searchParams.get('scrollToMeal');
		if (scrollParam && meals.length > 0) {
			const scrollToMeal = () => {
				const card = document.querySelector('.meal-card');
				if (card) {
					card.scrollIntoView({ behavior: 'smooth', block: 'start' });
					history.replaceState(null, '', '/');
				}
			};
			tick()
				.then(() => requestAnimationFrame(() => requestAnimationFrame(scrollToMeal)));
		}
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
				<span class="totals-label">Sugars</span>
				<span class="totals-value">
					<span class="totals-value-number">{formatNumber(dailyTotals.sugarsG)}</span>
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
				<md-filled-text-field
					name="name"
					class="meal-name-input"
					label="Meal name (optional)"
					autocomplete="off"
				></md-filled-text-field>
				<input type="hidden" name="day" value="today" />
				<md-filled-button type="submit">Add meal</md-filled-button>
			</form>
		</header>

		{#if meals.length === 0}
			<div class="empty-state">
				<span class="empty-state-icon material-symbols-outlined" aria-hidden="true">restaurant</span>
				<p class="empty-text">Nothing logged yet today.</p>
			</div>
		{:else}
			<ul class="meals-list">
				{#each meals as meal}
					<li class="meal-card">
						<header class="meal-header">
							<div>
								<h4 class="meal-name meal-name--today">{meal.name || 'Meal'}</h4>
							</div>
								<md-icon-button
									type="button"
									aria-label="Delete meal"
									onclick={() => openDeleteMeal({ id: meal.id, name: meal.name })}
								>
									<span class="material-symbols-outlined">delete</span>
								</md-icon-button>
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
											</p>
											{#if item.food?.brand}
												<p class="item-brand">{item.food.brand}</p>
											{/if}
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
								const form = e.currentTarget as HTMLFormElement;
								if (!selectedFoodIdByMeal[meal.id]) {
									e.preventDefault();
									foodInputValueByMeal[meal.id] = '';
									return;
								}
								const amountInput = form.elements.namedItem('amount') as HTMLInputElement | null;
								if (amountInput) {
									const raw = amountInput.value;
									const normalized = normalizeDecimal(raw);
									if (!normalized && raw.trim() !== '') {
										e.preventDefault();
										amountErrorByMeal[meal.id] = 'Enter a valid amount (numbers only).';
										return;
									}
									amountErrorByMeal[meal.id] = '';
									amountInput.value = normalized;
								} else {
									amountErrorByMeal[meal.id] = '';
								}
							}}
							onkeydown={(e) => {
								if (e.key !== 'Enter') return;
								if (document.activeElement instanceof HTMLTextAreaElement) return;
								const target = e.target as HTMLElement | null;
								if (target && target.closest('.food-input-wrap') && !selectedFoodIdByMeal[meal.id]) {
									e.preventDefault();
									return;
								}
								e.preventDefault();
								(e.currentTarget as HTMLFormElement).requestSubmit();
							}}
						>
							<input type="hidden" name="mealId" value={meal.id} />
							<input type="hidden" name="foodEntryId" value={selectedFoodIdByMeal[meal.id] ?? ''} />
							<div class="add-item-label">
								<div class="food-input-wrap">
									<md-filled-text-field
										id={`food-input-${meal.id}`}
										name="food"
										label="Select food"
										type="text"
										autocomplete="off"
										aria-label="Food name"
										aria-expanded={openFoodDropdownMealId === meal.id}
										aria-haspopup="listbox"
										aria-autocomplete="list"
										class="food-name-input"
										required
										no-asterisk
										value={foodInputValueByMeal[meal.id] ?? ''}
										oninput={(e) =>
											handleFoodInput(meal.id, (e.currentTarget as HTMLInputElement).value)}
										onclick={() => {
											const el = document.getElementById(
												`food-input-${meal.id}`
											) as HTMLElement | null;
											if (el) {
												foodMenuWidthByMeal[meal.id] = el.getBoundingClientRect().width;
											}
											openFoodDropdownMealId =
												openFoodDropdownMealId === meal.id ? null : meal.id;
										}}
										onkeydown={(e) => {
											if (e.key === 'Enter' || e.key === 'ArrowDown') {
												e.preventDefault();
												const el = document.getElementById(
													`food-input-${meal.id}`
												) as HTMLElement | null;
												if (el) {
													foodMenuWidthByMeal[meal.id] =
														el.getBoundingClientRect().width;
												}
												openFoodDropdownMealId = meal.id;
											}
										}}
									></md-filled-text-field>
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
									<md-menu
										anchor={`food-input-${meal.id}`}
										menu-positioning="popover"
										role="listbox"
										style={`min-width: ${foodMenuWidthByMeal[meal.id] ?? 0}px; max-width: ${foodMenuWidthByMeal[meal.id] ?? 0}px;`}
										open={openFoodDropdownMealId === meal.id}
										onclosed={() => {
											openFoodDropdownMealId = null;
										}}
									>
										{#each filteredFoodsForMeal(meal.id) as food (food.id)}
											<md-menu-item
												type="button"
												role="option"
												onclick={() => selectFood(meal.id, food)}
											>
												<div class="food-dropdown-item__primary" slot="headline">
													{food.name}
												</div>
												{#if food.brand}
													<div class="food-dropdown-item__secondary" slot="supporting-text">
														{food.brand}
													</div>
												{/if}
											</md-menu-item>
										{/each}
										{#if filteredFoodsForMeal(meal.id).length === 0}
											<md-menu-item disabled>
												<div class="food-dropdown-empty" slot="headline">
													No foods match
												</div>
											</md-menu-item>
										{/if}
									</md-menu>
								</div>
							</div>
							<div class="add-item-label">
								<md-filled-text-field
									aria-label={`Amount${selectedUnits[meal.id] ? ` (${selectedUnits[meal.id]})` : ''}`}
									name="amount"
									label={`Amount${selectedUnits[meal.id] ? ` (${selectedUnits[meal.id]})` : ''}`}
									type="text"
									required
									no-asterisk
									step="0.01"
									inputmode="decimal"
									min="0.01"
									error={Boolean(amountErrorByMeal[meal.id])}
									errorText={amountErrorByMeal[meal.id] ?? ''}
									onchange={(e) => {
										const input = e.target as HTMLInputElement | null;
										if (!input) return;
										const raw = input.value;
										const normalized = normalizeDecimal(raw);
										if (!normalized && raw.trim() !== '') {
											amountErrorByMeal[meal.id] =
												'Enter a valid amount (numbers only).';
										} else {
											amountErrorByMeal[meal.id] = '';
										}
										input.value = normalized;
									}}
								></md-filled-text-field>
							</div>
							<md-text-button type="submit">Add item</md-text-button>
						</form>
					</li>
				{/each}
			</ul>
		{/if}
	</section>
</div>

<md-dialog
	open={deleteMealDialogOpen}
	onclosed={() => {
		deleteMealDialogOpen = false;
		deleteMealTarget = null;
	}}
>
	<div slot="headline">Delete this meal?</div>
	<form slot="content" method="dialog">
		<p>You can't undo this.</p>
	</form>
	<div slot="actions">
		<md-text-button type="button" onclick={closeDeleteMeal}>Cancel</md-text-button>
		{#if deleteMealTarget}
			<form method="POST" action="?/deleteMeal">
				<input type="hidden" name="mealId" value={deleteMealTarget.id} />
				<md-filled-button type="submit">Delete</md-filled-button>
			</form>
		{/if}
	</div>
</md-dialog>

<style>
	.today-page {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}
	.today-header {
		flex-direction: column;
		align-items: flex-start;
		gap: 8px;
	}
	.today-title {
		margin: 0;
	}
	.today-date {
		margin: 0;
		font-size: var(--md-sys-typescale-headline-small-size);
		color: var(--md-sys-color-on-surface-variant);
	}
	.today-totals {
		padding: 20px 20px;
		border-radius: 24px;
		background: color-mix(in srgb, var(--md-sys-color-surface-container), transparent 0%);
	}
	.totals-row {
		display: flex;
		justify-content: space-between;
		margin-bottom: 8px;
	}
	.totals-label {
		font-size: 0.8rem;
	}
	.totals-value {
		display: inline-flex;
		align-items: baseline;
		gap: 4px;
		font-weight: 600;
	}
	.totals-value-number {
		font-size: var(--md-sys-typescale-title-medium-size, 1.125rem);
	}
	.totals-value-unit {
		font-size: 0.8rem;
	}
	.totals-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
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
		color: var(--md-sys-color-primary);
		font-size: 0.9rem;
		cursor: pointer;
	}
	.link-button.danger {
		color: var(--md-sys-color-error);
	}
	.link-button.small {
		font-size: 0.8rem;
	}
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: 48px 0;
		gap: 16px;
	}
	.empty-state-icon {
		font-size: 48px;
		color: var(--md-sys-color-primary);
		opacity: 0.3;
	}
	.empty-text,
	.meal-empty {
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
	.meal-card {
		scroll-margin-top: 20px;
		border-radius: 24px;
		padding: 20px;
		background: var(--md-sys-color-surface-container);
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
	.items-list {
		list-style: none;
		margin: 0 0 0px;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.item-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 12px;
		padding: 16px;
		background: var(--md-sys-color-surface);
		border-radius: 16px;
	}
	.item-main {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}
	.item-name {
		margin: 0;
		font-size: var(--md-sys-typescale-title-medium-size, 1.125rem);
		font-weight: var(--md-sys-typescale-title-medium-weight, 500);
	}
	.item-brand {
		margin: 0;
		font-size: 0.875rem;
		color: var(--md-sys-color-on-surface-variant);
	}
	.item-meta {
		margin: 0;
		font-size: var(--md-sys-typescale-body-large-size, 1rem);
		color: var(--md-sys-color-on-surface-variant);
	}
	.add-item-form {
		display: flex;
		flex-direction: column;
		gap: 16px;
		margin-top: 24px;
	}
	.add-item-label {
		display: flex;
		flex-direction: column;
		gap: 4px;
		font-size: 0.8rem;
		color: var(--md-sys-color-on-surface-variant);
	}
	.amount-unit {
		margin-left: 4px;
	}
	.food-name-input {
		width: 100%;
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
		color: var(--md-sys-color-on-surface-variant);
		cursor: pointer;
		transition: background-color 0.15s ease, color 0.15s ease;
	}
	.food-name-input-clear:hover {
		background: color-mix(in srgb, var(--md-sys-color-on-surface-variant) 12%);
		color: var(--md-sys-color-on-surface);
	}
	.food-name-input-clear .material-symbols-outlined {
		font-size: 1.25rem;
	}
	.food-input-wrap {
		position: relative;
		width: 100%;
	}
	.food-dropdown-item__primary {
		font-weight: var(--md-sys-typescale-body-large-weight, 400);
	}
	.food-dropdown-item__secondary {
		font-size: var(--md-sys-typescale-body-medium-size, 0.875rem);
		line-height: var(--md-sys-typescale-body-medium-line-height, 1.25rem);
		color: var(--md-sys-color-on-surface-variant);
	}
	.food-dropdown-empty {
		font-size: var(--md-sys-typescale-body-medium-size, 0.875rem);
		color: var(--md-sys-color-on-surface-variant);
	}
	md-filled-button {
		width: 100%;
		margin-top: 0px;
	}
</style>
