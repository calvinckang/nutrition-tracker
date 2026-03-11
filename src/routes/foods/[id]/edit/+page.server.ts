import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { foodEntries } from '$lib/server/db/schema';
import { roundTo2 } from '$lib/utils/format';

const SERVING_UNITS = ['g', 'ml', 'piece', 'serving'] as const;
const SUPERMARKETS = ['Mercadona', 'Carrefour'] as const;

function parseNum(v: unknown): number {
	const n = typeof v === 'string' ? parseFloat(v) : Number(v);
	return Number.isNaN(n) ? 0 : roundTo2(n);
}

export async function load({ params, locals }) {
	if (locals.role !== 'admin') throw redirect(302, '/foods');
	const [row] = await db.select().from(foodEntries).where(eq(foodEntries.id, params.id));
	if (!row) throw redirect(302, '/foods');
	return {
		food: {
			id: row.id,
			name: row.name,
			brand: row.brand,
			supermarket: row.supermarket,
			ingredients: row.ingredients,
			comment: row.comment,
			servingAmount: row.servingAmount,
			servingUnit: row.servingUnit,
			caloriesKcal: row.caloriesKcal,
			fatG: row.fatG,
			saturatedFatG: row.saturatedFatG,
			carbohydrateG: row.carbohydrateG,
			sugarsG: row.sugarsG,
			fiberG: row.fiberG,
			proteinG: row.proteinG,
			saltG: row.saltG
		}
	};
}

export const actions = {
	default: async ({ request, params, locals }) => {
		if (locals.role !== 'admin') return fail(403, { error: 'Forbidden' });
		const data = await request.formData();
		const name = data.get('name');
		if (typeof name !== 'string' || !name.trim()) return fail(400, { error: 'Name is required' });

		const brandRaw = data.get('brand');
		const ingredientsRaw = data.get('ingredients');
		const commentRaw = data.get('comment');
		const supermarketRaw = data.get('supermarket');
		const servingUnitRaw = data.get('servingUnit');
		const validUnit: (typeof SERVING_UNITS)[number] =
			typeof servingUnitRaw === 'string' && SERVING_UNITS.includes(servingUnitRaw as (typeof SERVING_UNITS)[number])
				? (servingUnitRaw as (typeof SERVING_UNITS)[number])
				: 'g';
		const validSupermarket: (typeof SUPERMARKETS)[number] | null =
			typeof supermarketRaw === 'string' && SUPERMARKETS.includes(supermarketRaw as (typeof SUPERMARKETS)[number])
				? (supermarketRaw as (typeof SUPERMARKETS)[number])
				: null;

		await db
			.update(foodEntries)
			.set({
				name: name.trim(),
				brand: typeof brandRaw === 'string' ? brandRaw.trim() || null : null,
				supermarket: validSupermarket,
				ingredients: typeof ingredientsRaw === 'string' ? ingredientsRaw.trim() || null : null,
				comment: typeof commentRaw === 'string' ? commentRaw.trim() || null : null,
				servingAmount: String(parseNum(data.get('servingAmount')) || 100),
				servingUnit: validUnit,
				caloriesKcal: String(parseNum(data.get('caloriesKcal'))),
				fatG: String(parseNum(data.get('fatG'))),
				saturatedFatG: String(parseNum(data.get('saturatedFatG'))),
				carbohydrateG: String(parseNum(data.get('carbohydrateG'))),
				sugarsG: String(parseNum(data.get('sugarsG'))),
				fiberG: String(parseNum(data.get('fiberG'))),
				proteinG: String(parseNum(data.get('proteinG'))),
				saltG: String(parseNum(data.get('saltG')))
			})
			.where(eq(foodEntries.id, params.id));

		throw redirect(302, '/foods?toast=saved');
	}
};
