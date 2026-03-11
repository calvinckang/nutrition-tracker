<script lang="ts">
	import { goto } from '$app/navigation';
	import '@material/web/button/filled-button.js';
	import '@material/web/button/outlined-button.js';

	let { data } = $props();
	let name = $state('');
	let brand = $state('');
	let supermarket = $state('');
	let ingredients = $state('');
	let comment = $state('');
	let servingAmount = $state('100');
	let servingUnit = $state('g');
	let caloriesKcal = $state('');
	let fatG = $state('');
	let saturatedFatG = $state('');
	let carbohydrateG = $state('');
	let sugarsG = $state('');
	let fiberG = $state('');
	let proteinG = $state('');
	let saltG = $state('');
</script>

<svelte:head>
	<title>Add a food – Nutrimaxxing</title>
</svelte:head>

<div class="form-page">
	<h1 class="form-heading">Add a food</h1>
	<form method="POST">
		<div class="form-section">
			<label class="form-label" for="name">Name</label>
			<input id="name" class="form-input" type="text" name="name" bind:value={name} required />
			<label class="form-label" for="brand">Brand (optional)</label>
			<input id="brand" class="form-input" type="text" name="brand" bind:value={brand} />
			<label class="form-label">Supermarket (optional)</label>
			<select name="supermarket" class="form-select" bind:value={supermarket}>
				<option value="">—</option>
				<option value="Mercadona">Mercadona</option>
				<option value="Carrefour">Carrefour</option>
			</select>
			<label class="form-label" for="ingredients">Ingredients (optional)</label>
			<textarea id="ingredients" class="form-input" name="ingredients" bind:value={ingredients} rows="2"></textarea>
			<label class="form-label" for="comment">Comment (optional)</label>
			<input id="comment" class="form-input" type="text" name="comment" bind:value={comment} />
		</div>
		<div class="form-section">
			<h2 class="form-subheading">Serving</h2>
			<label class="form-label" for="servingAmount">Serving amount</label>
			<input id="servingAmount" class="form-input" type="number" name="servingAmount" bind:value={servingAmount} inputmode="decimal" step="0.01" />
			<label class="form-label">Serving unit</label>
			<select name="servingUnit" class="form-select" bind:value={servingUnit}>
				<option value="g">g</option>
				<option value="ml">ml</option>
				<option value="piece">piece</option>
				<option value="serving">serving</option>
			</select>
		</div>
		<div class="form-section">
			<h2 class="form-subheading">Per serving</h2>
			<label class="form-label" for="caloriesKcal">Calories (kcal)</label>
			<input id="caloriesKcal" class="form-input" type="number" name="caloriesKcal" bind:value={caloriesKcal} inputmode="decimal" step="0.01" required />
			<label class="form-label" for="fatG">Fat (g)</label>
			<input id="fatG" class="form-input" type="number" name="fatG" bind:value={fatG} inputmode="decimal" step="0.01" required />
			<p class="form-nutrient-sub">of which Saturated (g)</p>
			<label class="form-label" for="saturatedFatG">Saturated fat (g)</label>
			<input id="saturatedFatG" class="form-input" type="number" name="saturatedFatG" bind:value={saturatedFatG} inputmode="decimal" step="0.01" required />
			<label class="form-label" for="carbohydrateG">Carbohydrate (g)</label>
			<input id="carbohydrateG" class="form-input" type="number" name="carbohydrateG" bind:value={carbohydrateG} inputmode="decimal" step="0.01" required />
			<p class="form-nutrient-sub">of which Sugars (g)</p>
			<label class="form-label" for="sugarsG">Sugars (g)</label>
			<input id="sugarsG" class="form-input" type="number" name="sugarsG" bind:value={sugarsG} inputmode="decimal" step="0.01" required />
			<label class="form-label" for="fiberG">Fiber (g)</label>
			<input id="fiberG" class="form-input" type="number" name="fiberG" bind:value={fiberG} inputmode="decimal" step="0.01" required />
			<label class="form-label" for="proteinG">Protein (g)</label>
			<input id="proteinG" class="form-input" type="number" name="proteinG" bind:value={proteinG} inputmode="decimal" step="0.01" required />
			<label class="form-label" for="saltG">Salt (g)</label>
			<input id="saltG" class="form-input" type="number" name="saltG" bind:value={saltG} inputmode="decimal" step="0.01" required />
		</div>
		<div class="form-actions">
			<md-outlined-button type="button" onclick={() => goto('/foods')}>Cancel</md-outlined-button>
			<md-filled-button type="submit">Save</md-filled-button>
		</div>
	</form>
</div>

<style>
	.form-page {
		max-width: 480px;
		margin: 0 auto;
	}
	.form-heading {
		margin: 0 0 24px;
		font-size: 1.5rem;
		font-weight: 500;
	}
	.form-section {
		margin-bottom: 24px;
	}
	.form-subheading {
		margin: 0 0 12px;
		font-size: 1rem;
		font-weight: 500;
		color: var(--md-sys-color-on-surface-variant, #49454f);
	}
	.form-label {
		display: block;
		margin-bottom: 4px;
		font-size: 0.75rem;
		color: var(--md-sys-color-on-surface-variant, #49454f);
	}
	.form-select {
		width: 100%;
		padding: 12px 16px;
		border: 1px solid var(--md-sys-color-outline, #79747e);
		border-radius: 4px;
		font-size: 1rem;
		margin-bottom: 16px;
		box-sizing: border-box;
	}
	.form-nutrient-sub {
		margin: 0 0 4px 8px;
		font-size: 0.75rem;
		color: var(--md-sys-color-on-surface-variant, #49454f);
	}
	.form-input {
		width: 100%;
		padding: 12px 16px;
		border: 1px solid var(--md-sys-color-outline, #79747e);
		border-radius: 4px;
		font-size: 1rem;
		margin-bottom: 16px;
		box-sizing: border-box;
	}
	.form-actions {
		display: flex;
		gap: 12px;
		justify-content: flex-end;
		margin-top: 24px;
	}
</style>
