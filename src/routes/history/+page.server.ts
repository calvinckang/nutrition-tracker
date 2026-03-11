import { redirect } from '@sveltejs/kit';
import { and, desc, eq, gte, lte } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { meals, mealItems, foodEntries } from '$lib/server/db/schema';
import { roundTo2 } from '$lib/utils/format';

function todayDateOnly() {
	const now = new Date();
	return now.toISOString().slice(0, 10);
}

function startOfWindow(days: number) {
	const d = new Date();
	d.setDate(d.getDate() - (days - 1));
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
	const startDate = startOfWindow(7); // last 7 days including today

	const rows = await db.query.meals.findMany({
		where: and(eq(meals.userId, userId), gte(meals.date, startDate), lte(meals.date, today)),
		with: {
			mealItems: {
				with: { foodEntry: true }
			}
		},
		orderBy: [desc(meals.date), desc(meals.createdAt)]
	});

	const byDate = new Map<
		string,
		{
			date: string;
			meals: {
				id: string;
				name: string | null;
				items: {
					id: string;
					amount: string | number | null;
					unit: string;
					food: { id: string; name: string; brand: string | null } | null;
				}[];
				totals: {
					caloriesKcal: number;
					fatG: number;
					saturatedFatG: number;
					carbohydrateG: number;
					sugarsG: number;
					fiberG: number;
					proteinG: number;
					saltG: number;
				};
			}[];
			totals: {
				caloriesKcal: number;
				fatG: number;
				saturatedFatG: number;
				carbohydrateG: number;
				sugarsG: number;
				fiberG: number;
				proteinG: number;
				saltG: number;
			};
		}
	>();

	for (const meal of rows) {
		const key = meal.date;
		if (!byDate.has(key)) {
			byDate.set(key, {
				date: key,
				meals: [],
				totals: {
					caloriesKcal: 0,
					fatG: 0,
					saturatedFatG: 0,
					carbohydrateG: 0,
					sugarsG: 0,
					fiberG: 0,
					proteinG: 0,
					saltG: 0
				}
			});
		}
		const entry = byDate.get(key)!;

		let mealTotals = {
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

				const add = (key: keyof typeof mealTotals, foodValue: string | number | null) => {
					const v = toNumber(foodValue) * factor;
					mealTotals[key] = roundTo2(mealTotals[key] + v);
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

		entry.meals.push({
			id: meal.id,
			name: meal.name,
			items,
			totals: mealTotals
		});

		for (const key of Object.keys(entry.totals) as (keyof typeof entry.totals)[]) {
			entry.totals[key] = roundTo2(entry.totals[key] + mealTotals[key]);
		}
	}

	const days = Array.from(byDate.values()).sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

	return {
		today,
		startDate,
		days
	};
}

