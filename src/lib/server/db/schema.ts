import {
	pgTable,
	text,
	timestamp,
	pgEnum,
	numeric,
	date,
	index
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export * from './auth.schema';
import { user } from './auth.schema';

// Enums (spec §3.1)
export const supermarketEnum = pgEnum('supermarket', ['Mercadona', 'Carrefour']);
export const servingUnitEnum = pgEnum('serving_unit', ['g', 'ml', 'piece', 'serving']);
export const userRoleEnum = pgEnum('user_role', ['admin', 'user']);

// Food catalog (spec §3.3)
export const foodEntries = pgTable(
	'food_entries',
	{
		id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
		name: text('name').notNull(),
		brand: text('brand'),
		supermarket: supermarketEnum('supermarket'),
		ingredients: text('ingredients'),
		comment: text('comment'),
		servingAmount: numeric('serving_amount', { precision: 10, scale: 2 }).default('100').notNull(),
		servingUnit: servingUnitEnum('serving_unit').default('g').notNull(),
		caloriesKcal: numeric('calories_kcal', { precision: 10, scale: 2 }).notNull(),
		fatG: numeric('fat_g', { precision: 10, scale: 2 }).notNull(),
		saturatedFatG: numeric('saturated_fat_g', { precision: 10, scale: 2 }).notNull(),
		carbohydrateG: numeric('carbohydrate_g', { precision: 10, scale: 2 }).notNull(),
		sugarsG: numeric('sugars_g', { precision: 10, scale: 2 }).notNull(),
		fiberG: numeric('fiber_g', { precision: 10, scale: 2 }).notNull(),
		proteinG: numeric('protein_g', { precision: 10, scale: 2 }).notNull(),
		saltG: numeric('salt_g', { precision: 10, scale: 2 }).notNull(),
		createdByUserId: text('created_by_user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		createdAt: timestamp('created_at').defaultNow().notNull()
	},
	(table) => [index('food_entries_created_by_user_id_idx').on(table.createdByUserId)]
);

// Meals (spec §3.4)
export const meals = pgTable(
	'meals',
	{
		id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		date: date('date').notNull(),
		name: text('name'),
		createdAt: timestamp('created_at').defaultNow().notNull()
	},
	(table) => [
		index('meals_user_id_idx').on(table.userId),
		index('meals_user_id_date_idx').on(table.userId, table.date)
	]
);

// Meal items (spec §3.4)
export const mealItems = pgTable(
	'meal_items',
	{
		id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
		mealId: text('meal_id')
			.notNull()
			.references(() => meals.id, { onDelete: 'cascade' }),
		foodEntryId: text('food_entry_id')
			.notNull()
			.references(() => foodEntries.id, { onDelete: 'cascade' }),
		amount: numeric('amount', { precision: 10, scale: 2 }).default('0').notNull(),
		unit: servingUnitEnum('unit').notNull(),
		createdAt: timestamp('created_at').defaultNow().notNull()
	},
	(table) => [
		index('meal_items_meal_id_idx').on(table.mealId),
		index('meal_items_food_entry_id_idx').on(table.foodEntryId)
	]
);

// Relations
export const foodEntriesRelations = relations(foodEntries, ({ one }) => ({
	createdByUser: one(user, {
		fields: [foodEntries.createdByUserId],
		references: [user.id]
	})
}));

export const mealsRelations = relations(meals, ({ one, many }) => ({
	user: one(user, {
		fields: [meals.userId],
		references: [user.id]
	}),
	mealItems: many(mealItems)
}));

export const mealItemsRelations = relations(mealItems, ({ one }) => ({
	meal: one(meals, {
		fields: [mealItems.mealId],
		references: [meals.id]
	}),
	foodEntry: one(foodEntries, {
		fields: [mealItems.foodEntryId],
		references: [foodEntries.id]
	})
}));
