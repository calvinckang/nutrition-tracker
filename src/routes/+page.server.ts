import { redirect, fail } from '@sveltejs/kit';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { meals, mealItems, foodEntries } from '$lib/server/db/schema';
import { roundTo2 } from '$lib/utils/format';

function todayDateOnly() {
	const now = new Date();
	return now.toISOString().slice(0, 10); // YYYY-MM-DD
}

function yesterdayDateOnly() {
	const d = new Date();
	d.setDate(d.getDate() - 1);
	return d.toISOString().slice(0, 10);
}

function toNumber(value: string | number | null): number {
	if (value === null) return 0;
	const n = typeof value === 'string' ? parseFloat(value) : value;
	return Number.isNaN(n) ? 0 : n;
}

export async function load({ locals }) {
	const user = locals.user;
	if (!user?.id) throw redirect(302, '/sign-in');

	const userId = user.id;
	const today = todayDateOnly();

	// Load today's meals with items and their foods
	const rows = await db.query.meals.findMany({
		where: and(eq(meals.userId, userId), eq(meals.date, today)),
		with: {
			mealItems: {
				with: {
					foodEntry: true
				}
			}
		},
		orderBy: desc(meals.createdAt)
	});

	const mealsData = rows.map((meal) => {
		let totals = {
			caloriesKcal: 0,
			fatG: 0,
			saturatedFatG: 0,
			carbohydrateG: 0,
			sugarsG: 0,
			fiberG: 0,
			proteinG: 0,
			saltG: 0
		};

		const items = meal.mealItems.map((item) => {
			const food = item.foodEntry;
			if (food) {
				const servingAmount = toNumber(food.servingAmount);
				const amount = toNumber(item.amount);
				const factor = servingAmount > 0 ? amount / servingAmount : 0;

				const add = (key: keyof typeof totals, foodValue: string | number | null) => {
					const v = toNumber(foodValue) * factor;
					totals[key] = roundTo2(totals[key] + v);
				};

				add('caloriesKcal', food.caloriesKcal);
				add('fatG', food.fatG);
				add('saturatedFatG', food.saturatedFatG);
				add('carbohydrateG', food.carbohydrateG);
				add('sugarsG', food.sugarsG);
				add('fiberG', food.fiberG);
				add('proteinG', food.proteinG);
				add('saltG', food.saltG);
			}

			return {
				id: item.id,
				amount: item.amount,
				unit: item.unit,
				food: food
					? {
							id: food.id,
							name: food.name,
							brand: food.brand
					  }
					: null
			};
		});

		return {
			id: meal.id,
			name: meal.name,
			date: meal.date,
			items,
			totals
		};
	});

	const dailyTotals = mealsData.reduce(
		(acc, meal) => {
			for (const key of Object.keys(acc) as (keyof typeof acc)[]) {
				acc[key] = roundTo2(acc[key] + meal.totals[key]);
			}
			return acc;
		},
		{
			caloriesKcal: 0,
			fatG: 0,
			saturatedFatG: 0,
			carbohydrateG: 0,
			sugarsG: 0,
			fiberG: 0,
			proteinG: 0,
			saltG: 0
		}
	);

	// All foods for picker (admin-created catalog, but everyone can read)
	const foods = await db
		.select({
			id: foodEntries.id,
			name: foodEntries.name,
			brand: foodEntries.brand,
			servingUnit: foodEntries.servingUnit
		})
		.from(foodEntries)
		.orderBy(foodEntries.name);

	return {
		today,
		yesterday: yesterdayDateOnly(),
		meals: mealsData,
		dailyTotals,
		foods
	};
}

export const actions = {
	createMeal: async ({ request, locals }) => {
		const user = locals.user;
		if (!user?.id) return fail(401, { error: 'Not signed in' });

		const form = await request.formData();
		const which = form.get('day');
		const date =
			which === 'yesterday'
				? yesterdayDateOnly()
				: todayDateOnly(); // default to today

		const nameRaw = form.get('name');
		const name = typeof nameRaw === 'string' && nameRaw.trim() ? nameRaw.trim() : null;

		await db.insert(meals).values({
			userId: user.id,
			date,
			name
		});

		throw redirect(302, '/?scrollToMeal=1');
	},

	addItem: async ({ request, locals }) => {
		const user = locals.user;
		if (!user?.id) return fail(401, { error: 'Not signed in' });

		const form = await request.formData();
		const mealId = form.get('mealId');
		const foodEntryId = form.get('foodEntryId');
		const amountRaw = form.get('amount');

		if (typeof mealId !== 'string' || typeof foodEntryId !== 'string') {
			return fail(400, { error: 'Missing meal or food' });
		}

		const amount = typeof amountRaw === 'string' ? parseFloat(amountRaw.replace(',', '.')) : NaN;
		if (!Number.isFinite(amount) || amount <= 0) {
			return fail(400, { error: 'Amount must be greater than 0' });
		}

		// Ensure meal belongs to user
		const [mealRow] = await db
			.select({ id: meals.id })
			.from(meals)
			.where(and(eq(meals.id, mealId), eq(meals.userId, user.id)));
		if (!mealRow) return fail(404, { error: 'Meal not found' });

		// Get serving unit from food entry
		const [food] = await db
			.select({ id: foodEntries.id, servingUnit: foodEntries.servingUnit })
			.from(foodEntries)
			.where(eq(foodEntries.id, foodEntryId));
		if (!food) return fail(404, { error: 'Food not found' });

		await db.insert(mealItems).values({
			mealId,
			foodEntryId,
			amount: String(roundTo2(amount)),
			unit: food.servingUnit
		});

		throw redirect(302, '/');
	},

	deleteMeal: async ({ request, locals }) => {
		const user = locals.user;
		if (!user?.id) return fail(401, { error: 'Not signed in' });
		const form = await request.formData();
		const mealId = form.get('mealId');
		if (typeof mealId !== 'string') return fail(400, { error: 'Missing meal id' });

		await db.delete(meals).where(and(eq(meals.id, mealId), eq(meals.userId, user.id)));
		throw redirect(302, '/');
	},

	deleteItem: async ({ request, locals }) => {
		const user = locals.user;
		if (!user?.id) return fail(401, { error: 'Not signed in' });
		const form = await request.formData();
		const itemId = form.get('itemId');
		if (typeof itemId !== 'string') return fail(400, { error: 'Missing item id' });

		// Ensure item belongs to a meal of this user
		const [row] = await db
			.select({ id: mealItems.id })
			.from(mealItems)
			.innerJoin(meals, eq(mealItems.mealId, meals.id))
			.where(and(eq(mealItems.id, itemId), eq(meals.userId, user.id)));
		if (!row) return fail(404, { error: 'Item not found' });

		await db.delete(mealItems).where(eq(mealItems.id, itemId));
		throw redirect(302, '/');
	}
};

