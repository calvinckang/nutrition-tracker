import { and, desc, eq, gte, lte } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { meals } from '$lib/server/db/schema';
import { roundTo2 } from '$lib/utils/format';

const WINDOW_DAYS = 7;

function todayDateOnly(): string {
	const now = new Date();
	return now.toISOString().slice(0, 10);
}

function shiftDate(iso: string, deltaDays: number): string {
	const d = new Date(iso + 'T00:00:00');
	d.setDate(d.getDate() + deltaDays);
	return d.toISOString().slice(0, 10);
}

function toNumber(value: string | number | null): number {
	if (value === null) return 0;
	const n = typeof value === 'string' ? parseFloat(value) : value;
	return Number.isNaN(n) ? 0 : n;
}

export type HistoryDay = {
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
};

export type HistoryChunkResult = {
	days: HistoryDay[];
	hasMore: boolean;
	nextCursor: string | null;
	today: string;
};

export async function getHistoryChunk(
	userId: string,
	before?: string | null
): Promise<HistoryChunkResult> {
	const today = todayDateOnly();

	let endDate: string;
	let startDate: string;

	if (!before) {
		endDate = today;
		startDate = shiftDate(today, -(WINDOW_DAYS - 1));
	} else {
		endDate = shiftDate(before, -1);
		startDate = shiftDate(endDate, -(WINDOW_DAYS - 1));
	}

	const rows = await db.query.meals.findMany({
		where: and(eq(meals.userId, userId), gte(meals.date, startDate), lte(meals.date, endDate)),
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
			meals: HistoryDay['meals'];
			totals: HistoryDay['totals'];
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

	const days = Array.from(byDate.values()).sort((a, b) =>
		a.date < b.date ? 1 : a.date > b.date ? -1 : 0
	);

	const dayBeforeStart = shiftDate(startDate, -1);
	const hasMore = await db.query.meals.findFirst({
		where: and(eq(meals.userId, userId), lte(meals.date, dayBeforeStart)),
		columns: { id: true }
	}).then(Boolean);

	const nextCursor = hasMore ? startDate : null;

	return {
		days,
		hasMore,
		nextCursor,
		today
	};
}
