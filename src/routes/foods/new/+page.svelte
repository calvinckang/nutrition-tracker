<script lang="ts">
	import { goto } from '$app/navigation';
	import '@material/web/button/filled-button.js';
	import '@material/web/button/outlined-button.js';
	import '@material/web/textfield/outlined-text-field.js';
	import '@material/web/select/outlined-select.js';
	import '@material/web/select/select-option.js';

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
	<header class="page-header">
		<h2 class="form-heading">Add a food</h2>
	</header>
	<form
		method="POST"
		onkeydown={(e) => {
			if (e.key !== 'Enter') return;
			if (document.activeElement instanceof HTMLTextAreaElement) return;
			e.preventDefault();
			(e.currentTarget as HTMLFormElement).requestSubmit();
		}}
	>
		<div class="form-section">
			<h3 class="form-subheading">Food</h3>
			<md-outlined-text-field
				id="name"
				name="name"
				label="Name"
				type="text"
				value={name}
				oninput={(e) => (name = (e.currentTarget as HTMLInputElement).value)}
				required
				no-asterisk
			></md-outlined-text-field>
			<md-outlined-text-field
				id="brand"
				name="brand"
				label="Brand (optional)"
				type="text"
				value={brand}
				oninput={(e) => (brand = (e.currentTarget as HTMLInputElement).value)}
			></md-outlined-text-field>
			<md-outlined-select
				name="supermarket"
				label="Supermarket (optional)"
				value={supermarket}
				oninput={(e) => (supermarket = (e.currentTarget as HTMLSelectElement).value)}
			>
				<md-select-option value="">
					<div slot="headline">—</div>
				</md-select-option>
				<md-select-option value="Mercadona">
					<div slot="headline">Mercadona</div>
				</md-select-option>
				<md-select-option value="Carrefour">
					<div slot="headline">Carrefour</div>
				</md-select-option>
			</md-outlined-select>
			<md-outlined-text-field
				id="ingredients"
				name="ingredients"
				label="Ingredients (optional)"
				textarea
				rows="2"
				value={ingredients}
				oninput={(e) => (ingredients = (e.currentTarget as HTMLInputElement).value)}
			></md-outlined-text-field>
			<md-outlined-text-field
				id="comment"
				name="comment"
				label="Comment (optional)"
				type="text"
				value={comment}
				oninput={(e) => (comment = (e.currentTarget as HTMLInputElement).value)}
			></md-outlined-text-field>
		</div>
		<div class="form-section">
			<h3 class="form-subheading">Serving</h3>
			<md-outlined-text-field
				id="servingAmount"
				name="servingAmount"
				label="Serving amount"
				type="number"
				value={servingAmount}
				oninput={(e) => (servingAmount = (e.currentTarget as HTMLInputElement).value)}
				inputmode="decimal"
				step="0.01"
			></md-outlined-text-field>
			<md-outlined-select
				name="servingUnit"
				label="Serving unit"
				value={servingUnit}
				oninput={(e) => (servingUnit = (e.currentTarget as HTMLSelectElement).value)}
			>
				<md-select-option value="g">
					<div slot="headline">g</div>
				</md-select-option>
				<md-select-option value="ml">
					<div slot="headline">ml</div>
				</md-select-option>
				<md-select-option value="piece">
					<div slot="headline">piece</div>
				</md-select-option>
				<md-select-option value="serving">
					<div slot="headline">serving</div>
				</md-select-option>
			</md-outlined-select>
		</div>
		<div class="form-section">
			<h3 class="form-subheading">Per serving</h3>
			<md-outlined-text-field
				id="caloriesKcal"
				name="caloriesKcal"
				label="Calories (kcal)"
				type="number"
				value={caloriesKcal}
				oninput={(e) => (caloriesKcal = (e.currentTarget as HTMLInputElement).value)}
				inputmode="decimal"
				step="0.01"
				required
				no-asterisk
			></md-outlined-text-field>
			<div class="form-row-tight">
				<md-outlined-text-field
					id="fatG"
					name="fatG"
					label="Fat (g)"
					type="number"
					value={fatG}
					oninput={(e) => (fatG = (e.currentTarget as HTMLInputElement).value)}
					inputmode="decimal"
					step="0.01"
					required
					no-asterisk
				></md-outlined-text-field>
				<p class="form-nutrient-sub">of which</p>
				<md-outlined-text-field
					id="saturatedFatG"
					name="saturatedFatG"
					label="Saturated fat (g)"
					type="number"
					value={saturatedFatG}
					oninput={(e) => (saturatedFatG = (e.currentTarget as HTMLInputElement).value)}
					inputmode="decimal"
					step="0.01"
					required
					no-asterisk
				></md-outlined-text-field>
			</div>
			<div class="form-row-tight">
				<md-outlined-text-field
					id="carbohydrateG"
					name="carbohydrateG"
					label="Carbohydrate (g)"
					type="number"
					value={carbohydrateG}
					oninput={(e) => (carbohydrateG = (e.currentTarget as HTMLInputElement).value)}
					inputmode="decimal"
					step="0.01"
					required
					no-asterisk
				></md-outlined-text-field>
				<p class="form-nutrient-sub">of which</p>
				<md-outlined-text-field
					id="sugarsG"
					name="sugarsG"
					label="Sugars (g)"
					type="number"
					value={sugarsG}
					oninput={(e) => (sugarsG = (e.currentTarget as HTMLInputElement).value)}
					inputmode="decimal"
					step="0.01"
					required
					no-asterisk
				></md-outlined-text-field>
			</div>
			<md-outlined-text-field
				id="fiberG"
				name="fiberG"
				label="Fiber (g)"
				type="number"
				value={fiberG}
				oninput={(e) => (fiberG = (e.currentTarget as HTMLInputElement).value)}
				inputmode="decimal"
				step="0.01"
				required
				no-asterisk
			></md-outlined-text-field>
			<md-outlined-text-field
				id="proteinG"
				name="proteinG"
				label="Protein (g)"
				type="number"
				value={proteinG}
				oninput={(e) => (proteinG = (e.currentTarget as HTMLInputElement).value)}
				inputmode="decimal"
				step="0.01"
				required
				no-asterisk
			></md-outlined-text-field>
			<md-outlined-text-field
				id="saltG"
				name="saltG"
				label="Salt (g)"
				type="number"
				value={saltG}
				oninput={(e) => (saltG = (e.currentTarget as HTMLInputElement).value)}
				inputmode="decimal"
				step="0.01"
				required
				no-asterisk
			></md-outlined-text-field>
		</div>
		<div class="form-actions">
			<md-filled-button type="submit">Save</md-filled-button>
			<md-outlined-button type="button" onclick={() => goto('/foods')}>Cancel</md-outlined-button>
		</div>
	</form>
</div>

<style>
	.form-page {
		width: 100%;
		max-width: 440px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: 24px;
	}
	.form-heading {
		margin: 0;
	}
	.form-section {
		display: flex;
		flex-direction: column;
		gap: 16px;
		margin-bottom: 24px;
		padding: 20px;
		border-radius: 24px;
		background: var(--md-sys-color-surface-container, #fffbfe);
	}
	.form-subheading {
		margin: 0 0 12px;
		font-size: var(--md-sys-typescale-title-medium-size);
		font-weight: var(--md-sys-typescale-title-medium-weight);
		line-height: var(--md-sys-typescale-title-medium-line-height);
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
		margin: 0;
		font-size: 0.75rem;
		color: var(--md-sys-color-on-surface-variant, #49454f);
	}
	.form-row-tight {
		display: flex;
		flex-direction: column;
		row-gap: 8px;
	}
	.form-input {
		width: 100%;
		padding: 12px 16px;
		border: 1px solid var(--md-sys-color-outline, #79747e);
		border-radius: 4px;
		font-size: 1rem;
		box-sizing: border-box;
	}
	.form-page md-outlined-text-field,
	.form-page md-outlined-select {
		width: 100%;
	}
	.form-actions {
		display: flex;
		flex-direction: column;
		gap: 12px;
		justify-content: flex-end;
		margin-top: 24px;
	}
</style>
