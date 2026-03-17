<script lang="ts">
	import { goto } from '$app/navigation';
	import '@material/web/button/filled-button.js';
	import '@material/web/button/outlined-button.js';
	import '@material/web/textfield/filled-text-field.js';
	import '@material/web/select/filled-select.js';
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

let servingAmountError = $state('');
let caloriesKcalError = $state('');
let fatGError = $state('');
let saturatedFatGError = $state('');
let carbohydrateGError = $state('');
let sugarsGError = $state('');
let fiberGError = $state('');
let proteinGError = $state('');
let saltGError = $state('');

function normalizeDecimal(value: string): string {
	const trimmed = value.trim().replace(',', '.');
	if (!trimmed) return '';
	if (!/^\d+(\.\d+)?$/.test(trimmed)) return '';
	return trimmed;
}
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
		onsubmit={(e) => {
			const form = e.currentTarget as HTMLFormElement;
			let hasError = false;

			const normalizeAndValidate = (
				name: string,
				required: boolean,
				setError: (msg: string) => void
			) => {
				const input = form.elements.namedItem(name) as HTMLInputElement | null;
				if (!input) return;
				const raw = input.value;
				const normalized = normalizeDecimal(raw);
				if (required && !normalized) {
					hasError = true;
					setError('Enter a valid number.');
					return;
				}
				if (!required && !normalized && raw.trim() !== '') {
					hasError = true;
					setError('Enter a valid number.');
					return;
				}
				setError('');
				input.value = normalized;
			};

			normalizeAndValidate('servingAmount', false, (m) => (servingAmountError = m));
			normalizeAndValidate('caloriesKcal', true, (m) => (caloriesKcalError = m));
			normalizeAndValidate('fatG', true, (m) => (fatGError = m));
			normalizeAndValidate('saturatedFatG', true, (m) => (saturatedFatGError = m));
			normalizeAndValidate('carbohydrateG', true, (m) => (carbohydrateGError = m));
			normalizeAndValidate('sugarsG', true, (m) => (sugarsGError = m));
			normalizeAndValidate('fiberG', true, (m) => (fiberGError = m));
			normalizeAndValidate('proteinG', true, (m) => (proteinGError = m));
			normalizeAndValidate('saltG', true, (m) => (saltGError = m));

			if (hasError) {
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
		<div class="form-section">
			<h3 class="form-subheading">Food</h3>
			<md-filled-text-field
				id="name"
				name="name"
				label="Name"
				type="text"
				value={name}
				oninput={(e) => (name = (e.currentTarget as HTMLInputElement).value)}
				required
				no-asterisk
			></md-filled-text-field>
			<md-filled-text-field
				id="brand"
				name="brand"
				label="Brand (optional)"
				type="text"
				value={brand}
				oninput={(e) => (brand = (e.currentTarget as HTMLInputElement).value)}
			></md-filled-text-field>
			<md-filled-select
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
			</md-filled-select>
			<md-filled-text-field
				id="ingredients"
				name="ingredients"
				label="Ingredients (optional)"
				textarea
				rows="2"
				value={ingredients}
				oninput={(e) => (ingredients = (e.currentTarget as HTMLInputElement).value)}
			></md-filled-text-field>
			<md-filled-text-field
				id="comment"
				name="comment"
				label="Comment (optional)"
				type="text"
				value={comment}
				oninput={(e) => (comment = (e.currentTarget as HTMLInputElement).value)}
			></md-filled-text-field>
		</div>
		<div class="form-section">
			<h3 class="form-subheading">Serving</h3>
			<md-filled-text-field
				id="servingAmount"
				name="servingAmount"
				label="Serving amount"
				type="text"
				value={servingAmount}
				oninput={(e) => (servingAmount = (e.currentTarget as HTMLInputElement).value)}
				inputmode="decimal"
				step="0.01"
				error={Boolean(servingAmountError)}
				errorText={servingAmountError}
				onchange={(e) => {
					const input = e.target as HTMLInputElement | null;
					if (!input) return;
					const raw = input.value;
					const normalized = normalizeDecimal(raw);
					if (!normalized && raw.trim() !== '') {
						servingAmountError = 'Enter a valid number.';
					} else {
						servingAmountError = '';
					}
					input.value = normalized;
					servingAmount = input.value;
				}}
			></md-filled-text-field>
			<md-filled-select
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
			</md-filled-select>
		</div>
		<div class="form-section">
			<h3 class="form-subheading">Per serving</h3>
			<md-filled-text-field
				id="caloriesKcal"
				name="caloriesKcal"
				label="Calories (kcal)"
				type="text"
				value={caloriesKcal}
				oninput={(e) => (caloriesKcal = (e.currentTarget as HTMLInputElement).value)}
				inputmode="decimal"
				step="0.01"
				required
				no-asterisk
				error={Boolean(caloriesKcalError)}
				errorText={caloriesKcalError}
				onchange={(e) => {
					const input = e.target as HTMLInputElement | null;
					if (!input) return;
					const raw = input.value;
					const normalized = normalizeDecimal(raw);
					if (!normalized) {
						caloriesKcalError = 'Enter a valid number.';
					} else {
						caloriesKcalError = '';
					}
					input.value = normalized;
					caloriesKcal = input.value;
				}}
			></md-filled-text-field>
			<div class="form-row-tight">
				<md-filled-text-field
					id="fatG"
					name="fatG"
					label="Fat (g)"
					type="text"
					value={fatG}
					oninput={(e) => (fatG = (e.currentTarget as HTMLInputElement).value)}
					inputmode="decimal"
					step="0.01"
					required
					no-asterisk
					error={Boolean(fatGError)}
					errorText={fatGError}
					onchange={(e) => {
						const input = e.target as HTMLInputElement | null;
						if (!input) return;
						const raw = input.value;
						const normalized = normalizeDecimal(raw);
						if (!normalized) {
							fatGError = 'Enter a valid number.';
						} else {
							fatGError = '';
						}
						input.value = normalized;
						fatG = input.value;
					}}
				></md-filled-text-field>
				<p class="form-nutrient-sub">of which</p>
				<md-filled-text-field
					id="saturatedFatG"
					name="saturatedFatG"
					label="Saturated fat (g)"
					type="text"
					value={saturatedFatG}
					oninput={(e) => (saturatedFatG = (e.currentTarget as HTMLInputElement).value)}
					inputmode="decimal"
					step="0.01"
					required
					no-asterisk
					error={Boolean(saturatedFatGError)}
					errorText={saturatedFatGError}
					onchange={(e) => {
						const input = e.target as HTMLInputElement | null;
						if (!input) return;
						const raw = input.value;
						const normalized = normalizeDecimal(raw);
						if (!normalized) {
							saturatedFatGError = 'Enter a valid number.';
						} else {
							saturatedFatGError = '';
						}
						input.value = normalized;
						saturatedFatG = input.value;
					}}
				></md-filled-text-field>
			</div>
			<div class="form-row-tight">
				<md-filled-text-field
					id="carbohydrateG"
					name="carbohydrateG"
					label="Carbohydrate (g)"
					type="text"
					value={carbohydrateG}
					oninput={(e) => (carbohydrateG = (e.currentTarget as HTMLInputElement).value)}
					inputmode="decimal"
					step="0.01"
					required
					no-asterisk
					error={Boolean(carbohydrateGError)}
					errorText={carbohydrateGError}
					onchange={(e) => {
						const input = e.target as HTMLInputElement | null;
						if (!input) return;
						const raw = input.value;
						const normalized = normalizeDecimal(raw);
						if (!normalized) {
							carbohydrateGError = 'Enter a valid number.';
						} else {
							carbohydrateGError = '';
						}
						input.value = normalized;
						carbohydrateG = input.value;
					}}
				></md-filled-text-field>
				<p class="form-nutrient-sub">of which</p>
				<md-filled-text-field
					id="sugarsG"
					name="sugarsG"
					label="Sugars (g)"
					type="text"
					value={sugarsG}
					oninput={(e) => (sugarsG = (e.currentTarget as HTMLInputElement).value)}
					inputmode="decimal"
					step="0.01"
					required
					no-asterisk
					error={Boolean(sugarsGError)}
					errorText={sugarsGError}
					onchange={(e) => {
						const input = e.target as HTMLInputElement | null;
						if (!input) return;
						const raw = input.value;
						const normalized = normalizeDecimal(raw);
						if (!normalized) {
							sugarsGError = 'Enter a valid number.';
						} else {
							sugarsGError = '';
						}
						input.value = normalized;
						sugarsG = input.value;
					}}
				></md-filled-text-field>
			</div>
			<md-filled-text-field
				id="fiberG"
				name="fiberG"
				label="Fiber (g)"
			type="text"
				value={fiberG}
				oninput={(e) => (fiberG = (e.currentTarget as HTMLInputElement).value)}
				inputmode="decimal"
				step="0.01"
				required
				no-asterisk
			error={Boolean(fiberGError)}
			errorText={fiberGError}
			onchange={(e) => {
				const input = e.target as HTMLInputElement | null;
				if (!input) return;
				const raw = input.value;
				const normalized = normalizeDecimal(raw);
				if (!normalized) {
					fiberGError = 'Enter a valid number.';
				} else {
					fiberGError = '';
				}
				input.value = normalized;
				fiberG = input.value;
			}}
			></md-filled-text-field>
			<md-filled-text-field
				id="proteinG"
				name="proteinG"
				label="Protein (g)"
			type="text"
				value={proteinG}
				oninput={(e) => (proteinG = (e.currentTarget as HTMLInputElement).value)}
				inputmode="decimal"
				step="0.01"
				required
				no-asterisk
			error={Boolean(proteinGError)}
			errorText={proteinGError}
			onchange={(e) => {
				const input = e.target as HTMLInputElement | null;
				if (!input) return;
				const raw = input.value;
				const normalized = normalizeDecimal(raw);
				if (!normalized) {
					proteinGError = 'Enter a valid number.';
				} else {
					proteinGError = '';
				}
				input.value = normalized;
				proteinG = input.value;
			}}
			></md-filled-text-field>
			<md-filled-text-field
				id="saltG"
				name="saltG"
				label="Salt (g)"
			type="text"
				value={saltG}
				oninput={(e) => (saltG = (e.currentTarget as HTMLInputElement).value)}
				inputmode="decimal"
				step="0.01"
				required
				no-asterisk
			error={Boolean(saltGError)}
			errorText={saltGError}
			onchange={(e) => {
				const input = e.target as HTMLInputElement | null;
				if (!input) return;
				const raw = input.value;
				const normalized = normalizeDecimal(raw);
				if (!normalized) {
					saltGError = 'Enter a valid number.';
				} else {
					saltGError = '';
				}
				input.value = normalized;
				saltG = input.value;
			}}
			></md-filled-text-field>
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
	.form-page md-filled-text-field,
	.form-page md-filled-select {
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
