import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { foodEntries } from '$lib/server/db/schema';

export async function load({ locals }) {
	const rows = await db.select().from(foodEntries).orderBy(foodEntries.name);
	return {
		foods: rows.map((r) => ({
			id: r.id,
			name: r.name,
			brand: r.brand,
			supermarket: r.supermarket,
			servingAmount: r.servingAmount,
			servingUnit: r.servingUnit,
			caloriesKcal: r.caloriesKcal,
			fatG: r.fatG,
			saturatedFatG: r.saturatedFatG,
			carbohydrateG: r.carbohydrateG,
			sugarsG: r.sugarsG,
			fiberG: r.fiberG,
			proteinG: r.proteinG,
			saltG: r.saltG
		})),
		role: locals.role ?? 'user'
	};
}

export const actions = {
	delete: async ({ request, locals }) => {
		if (locals.role !== 'admin') {
			return fail(403, { error: 'Forbidden' });
		}
		const data = await request.formData();
		const id = data.get('id');
		if (typeof id !== 'string' || !id) {
			return fail(400, { error: 'Missing food id' });
		}
		await db.delete(foodEntries).where(eq(foodEntries.id, id));
		throw redirect(302, '/foods?toast=deleted');
	}
};
