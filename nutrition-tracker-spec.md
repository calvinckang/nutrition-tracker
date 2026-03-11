## Nutrimaxxing – Product & Data Spec

Nutrimaxxing is a nutrition tracker that calculates calories and macronutrients for your meals based on ingredient weights and food labels. The app displays total daily intake by totaling all meals logged throughout the day and provides a weekly view to track nutrition over time.

### 1. Overview

- **Platform**: Mobile-first web app, built as a **Progressive Web App (PWA)**.
- **Framework**: **SvelteKit** frontend.
- **Backend**: **Neon** (serverless Postgres) with **Drizzle ORM**.
- **Auth**: **Better Auth** (email/password).
- **Email (verification & forgot password)**: **Resend** (env: `RESEND_API_KEY`).
- **Hosting**: Deployed on **Netlify** via GitHub.
- **Package manager**: Always use **pnpm** (not npm) for installs, scripts, and tooling.
- **Primary use case**: Track daily and weekly nutrition (calories and macros) based on ingredient weights and food labels.
- **MVP input**: All nutrition values are entered **manually from labels** (future: camera/scan).
- **App name**: Use **Nutrimaxxing** as the app name throughout the UI, copy, and technical references (package name, emails, etc.).
- **Favicon**: Use the **peach emoji** (🍑) as the favicon (implementation: emoji favicon).
- **Icons**: Use the **Google Material Symbols icon library** (Material Design 3) for all in-app icons. Load via [Google Fonts – Material Symbols](https://developers.google.com/fonts/docs/material_symbols) or use Material Web’s `md-icon` with the same symbol set; keep style (e.g. outlined/rounded) consistent across the app.

### 2. Roles & Permissions

- **User roles**:
  - `admin`
  - `user`
- **Admin**:
  - Only **admin** can **create, edit, and delete food entries** (the food catalog).
  - Initially, the **only admin** is the app creator: `calvinckang@gmail.com`.
- **Users (all roles)**:
  - Can **sign up** and **sign in** with email/password.
  - **Email verification** is required on sign up (user must verify email before signing in). **Block access** until the user has verified their email; show a clear **“Check your email”** screen.
  - **Forgot password**: Include a “Forgot password?” flow in the MVP (e.g. user enters email, receives a link to set a new password).
  - Can **create, edit, and delete their own meal logs** (meals and meal items).
  - Cannot modify the global food catalog unless they are admin (but can **view** the full catalog read-only).

### 3. Data Model (Conceptual)

#### 3.1 Shared types

- **Supermarket**
  - Enum: `'Mercadona' | 'Carrefour'`
- **ServingUnit**
  - Enum: `'g' | 'ml' | 'piece' | 'serving'`
- **UserRole**
  - Enum: `'admin' | 'user'`

#### 3.2 Users

- **users**
  - `id`: string/uuid (PK, from Better Auth)
  - `email`: string (unique)
  - `role`: `'admin' | 'user'` (default `'user'`)
  - `created_at`: timestamp
- **Admin assignment rule**
  - On user creation, if `email === 'calvinckang@gmail.com'`, set `role = 'admin'`; otherwise `role = 'user'`.

#### 3.3 Food catalog

**Nutrients per serving**:

- `caloriesKcal`: number – **kcal**
- `fatG`: number – g
- `saturatedFatG`: number – g (part of `fatG`)
- `carbohydrateG`: number – g
- `sugarsG`: number – g (part of `carbohydrateG`)
- `fiberG`: number – g
- `proteinG`: number – g
- `saltG`: number – g

**Food entry (conceptual type)**:

- `id`: string/uuid
- `name`: string
- Optional metadata:
  - `brand?`: string
  - `supermarket?`: `'Mercadona' | 'Carrefour'`
  - `ingredients?`: string (free text)
  - `comment?`: string (free text)
- Serving definition:
  - `servingAmount`: number – default **100**
  - `servingUnit`: `ServingUnit` – default **'g'**
- Nutritional information per **serving**:
  - `nutrients`: the nutrient fields listed above
- Audit:
  - `createdByUserId`: FK → `users.id`
  - `createdAt`: timestamp

**DB table sketch (`food_entries`)**:

- `id` (PK)
- `name` (not null)
- `brand` (nullable)
- `supermarket` (nullable, enum)
- `ingredients` (nullable)
- `comment` (nullable)
- `serving_amount` (numeric, default 100)
- `serving_unit` (enum, default `'g'`)
- `calories_kcal` (numeric)
- `fat_g` (numeric)
- `saturated_fat_g` (numeric)
- `carbohydrate_g` (numeric)
- `sugars_g` (numeric)
- `fiber_g` (numeric)
- `protein_g` (numeric)
- `salt_g` (numeric)
- `created_by_user_id` (FK → users)
- `created_at` (timestamp)

#### 3.4 Meals & meal items

- **Meal**
  - Logical **container** for one eating occasion on a specific date.
  - Example: “Breakfast” on 10 March 2026.
- **Meal item**
  - One line within a meal: which food and how much.
  - Example: “Oatmeal, 50 g” or “Protein bar, 1 piece”.

**Meal (conceptual type)**:

- `id`: string/uuid
- `userId`: string (FK → `users.id`)
- `date`: string – stored as **ISO date** (`YYYY-MM-DD`) in DB
  - Represents the log date (no time-of-day semantics for now).
  - In UI, always formatted as `DD Month YYYY` (e.g. `"10 March 2026"`).
- `name?`: string | null
  - Input is **empty by default**.
  - If empty or whitespace on submit, store as `null` or empty string.
  - In the UI, when falsy, display **"Meal"** as the default label.
- `createdAt`: timestamp

**Meal date selection UX**:

- On the meal log form:
  - Date field is a **select** offering only:
    - `Today` (default)
    - `Yesterday`
  - Internally resolved to the correct `YYYY-MM-DD` value based on the user’s current local date.
  - UI display uses `DD Month YYYY`.

**MealItem (conceptual type)**:

- `id`: string/uuid
- `mealId`: string (FK → `meals.id`)
- `foodEntryId`: string (FK → `food_entries.id`)
- `amount`: number
  - Default **0** when adding a food to a meal.
  - **Validation**: require **amount > 0** before saving; user cannot submit a meal item with zero or negative amount.
- `unit`: `ServingUnit`
  - **Not editable** by the user.
  - Always copied from `FoodEntry.servingUnit` at the time the item is created.
- `createdAt`: timestamp

**DB table sketch (`meals`)**:

- `id` (PK)
- `user_id` (FK → users)
- `date` (date)
- `name` (nullable)
- `created_at` (timestamp)

**DB table sketch (`meal_items`)**:

- `id` (PK)
- `meal_id` (FK → meals)
- `food_entry_id` (FK → food_entries)
- `amount` (numeric, default 0)
- `unit` (enum `ServingUnit`)
- `created_at` (timestamp)

#### 3.5 Nutrient scaling logic

For a given `MealItem`:

- Assume `unit` matches `FoodEntry.servingUnit` for MVP.
- Let:
  - `servingAmount` = `FoodEntry.servingAmount`
  - `amount` = `MealItem.amount`
  - `factor = amount / servingAmount`
- For each nutrient `N` in the food entry:
  - `N_for_item = food.nutrients[N] * factor`
- Daily and per-meal totals are computed in code by summing all `N_for_item` values across relevant items.
- **Recalculation**: Use the food entry’s **current** nutrients when displaying or totaling past logs. If a food entry is edited later (e.g. calories corrected), all meal items that reference it will reflect the updated values; past logs are not snapshotted.

### 4. Permissions & Access Control

- **Food entries (catalog)**:
  - **All authenticated users** can **view** the full food catalog (read-only) so they can see nutrition and choose foods when logging meals.
  - Only users with `role === 'admin'` can:
    - Create new food entries.
    - Edit existing food entries.
    - Delete food entries.
- **Meals and meal items (user logs)**:
  - Any authenticated user can:
    - Create meals and meal items under their own `user_id`.
    - Edit their own meals and meal items.
    - Delete their own meals and meal items.
  - Users must never see or modify meals belonging to other users.
- Enforcement:
  - In server routes / API handlers, always scope queries by `user_id` and `role`:
    - For meals/meal_items: `WHERE user_id = currentUserId`.
    - For food_entries mutations: require `role = 'admin'`.

### 5. UI & UX Guidelines

#### 5.1 General

- **Mobile-first** layout and interactions.
- Built as a **PWA**:
  - Installable on mobile home screens.
  - Service worker caches the app shell and static assets.
- **Offline (MVP)**: **Online-only**. Sign up and sign in require a data connection. Creating or editing meals and meal items also requires a connection; if the user is offline, show feedback (e.g. “You’re offline”) and do not allow saving. Offline-capable meal logging is a future enhancement.
- **Typography**: Use **TASA Orbiter** as the primary app typeface. Load via a web font provider (e.g. CDN-hosted `@fontsource/tasa-orbiter`) and apply it as the default font family for all app text, layered on top of the base Material Design 3 typography system.
- **Delete confirmations**: Before deleting a food entry, meal, or meal item, show a **confirmation dialog** (e.g. “Delete this meal?” with Cancel / Delete). Use M3 dialog.
- **Food catalog list (MVP)**: Use a **simple scrollable list** for the Foods screen; no search or filter in the first version.

#### 5.2 Nutrition fields layout

- Label units explicitly:
  - `Calories (kcal)`
  - `Fat (g)`
    - `of which Saturated (g)`
  - `Carbohydrate (g)`
    - `of which Sugars (g)`
  - `Fiber (g)`
  - `Protein (g)`
  - `Salt (g)`
- Make it visually clear that:
  - **Saturated fat** is part of **fat**.
  - **Sugars** are part of **carbohydrate**.
- Suggested visual treatment:
  - Use an **“of which ...”** prefix on the dependent rows.
  - Slight indentation and/or slightly smaller font or lighter color for:
    - `of which Saturated (g)`
    - `of which Sugars (g)`

#### 5.3 Serving and amounts

- **Food entry form**:
  - Default `servingAmount = 100`, `servingUnit = 'g'`.
  - Both are editable by the admin.
- **Meal item form** (add food to meal):
  - When user selects a food:
    - `amount` defaults to **0**.
    - `unit` is set to `foodEntry.servingUnit`.
  - The **unit is displayed but not editable**.
  - User can only enter the `amount`.
  - **Validation**: require **amount > 0** before save; show helper/error text (M3) if user tries to submit 0 or negative.

#### 5.4 Meal naming

- Meal name input is **optional** and empty by default.
- On submit:
  - If the name is empty or whitespace, store `null`/empty string.
  - In UI, when no name is present, display **"Meal"**.

#### 5.5 Date presentation

- Internally / in database:
  - Use a `date` column (or `YYYY-MM-DD` string).
- In the UI:
  - Always render dates as **DD Month YYYY**, e.g. `"10 March 2026"`.
  - Date values shown to the user are derived from the stored date via a formatting utility.

#### 5.6 Numeric precision and display

Applies to nutrient values and amounts (e.g. serving amount, meal item amount).

- **Input**: Round to **2 decimal places** on blur or on save. Any finer input (e.g. 50.256) is rounded to 2 decimals (e.g. 50.26); do not reject.
- **Storage**: Store with at most **2 decimal places** (e.g. `numeric(10,2)` or equivalent).
- **Display**: Trim trailing zeros; do not show decimals when there are none.
  - Whole numbers: **12** (not 12.00).
  - One decimal when needed: **12.5** (not 12.50).
  - Two decimals only when needed: **12.34**.

#### 5.7 Voice & copy

- **Tone**: Casual but not overly friendly; avoid technical words or jargon.
- Use the following example copy (and similar phrasing) for consistency. Implement with M3 components (snackbar, banner, dialog).

**Email verification & access blocking**

- **After sign-up (blocking screen)**  
  - Heading: “Check your email”  
  - Body: “We’ve sent you a link to confirm your account. Click it and you’re good to go.”  
  - Subtext: “Didn’t get it? Check spam or resend.”
- **Resend verification**  
  - Button: “Resend email”  
  - After tap: “Sent. Check your inbox.”

**Empty states**

- **No meals today**: “Nothing logged yet today.” + CTA “Add a meal”
- **No meals this week (History)**: “No meals this week.” + CTA “Log a meal” (optional)
- **No foods in catalog**: “No foods in the list yet.” + CTA “Add a food” (admin); for non-admin, adjust as needed (e.g. “No foods in the list yet.”)

**Feedback (snackbar / short)**

- Meal or food saved: “Saved.” or “Meal saved.” / “Food saved.”
- Deleted: “Deleted.” or “Removed.”
- Offline: “You’re offline. Connect to save changes.”
- Something went wrong: “Something went wrong. Try again.” (avoid “Error” or “Request failed”)

**Confirmation dialogs**

- **Delete meal**: Title “Delete this meal?” / Body “You can’t undo this.” / Actions “Cancel” | “Delete”
- **Delete food entry**: Title “Delete this food?” / Body “You can’t undo this. It will stay removed from past meals too.” / Actions “Cancel” | “Delete”
- **Delete meal item**: Title “Remove this item?” / Body “You can’t undo this.” / Actions “Cancel” | “Remove”

**Auth**

- **Forgot password screen**: Heading “Forgot password?” / Body “Enter your email and we’ll send you a link to set a new one.” / Button “Send link”
- **After forgot-password submit**: “Check your email for the link to reset your password.”
- **Sign-in failure**: “Email or password doesn’t look right. Try again.”
- **Sign-up failure (e.g. email taken)**: “That email is already in use. Try signing in or use another email.”

### 6. Future Enhancements (Non-MVP)

- **Camera-based input**:
  - OCR / photo scanning of nutrition labels.
  - Barcode scanning to look up foods via external APIs (e.g., Open Food Facts).
- **Additional micronutrients**:
  - Add more fields for vitamins/minerals once the base flows are stable.
- **More flexible dates**:
  - Full date picker instead of only “Today” / “Yesterday”.
- **Role management UI**:
  - Allow admin to promote/demote users to/from admin role.
- **Offline meal logging (Option B)**:
  - Once signed in, allow users to add or edit meals and meal items without a data connection; store changes locally (e.g. IndexedDB) and sync to the server when back online. Requires sync logic, conflict handling, and possibly background sync.

### 7. UI Framework & Material Design Usage

- **UI library**: Use **Material Web** (official Material Design 3 web components) directly in Svelte.
- **Icons**: Use the **Google Material Symbols icon library** (Material Design 3) for all UI icons (navigation, actions, empty states, etc.). Integrate via Google Fonts Material Symbols or `md-icon`; use one style (e.g. outlined or rounded) consistently.
- **Wrapper strategy**:
  - Use Material Web components in Svelte `.svelte` files (e.g. `md-outlined-text-field`, `md-filled-button`, `md-outlined-card`, `md-list-item`, `md-fab`, `md-navigation-bar`, `md-top-app-bar`, `md-dialog`).
  - Optionally create thin Svelte wrappers only for repeated patterns (e.g. `AppScaffold`, `PrimaryButton`) to reduce duplication, but avoid building a large custom design system.
- **Fidelity to M3**:
  - Default to Material Web’s out-of-the-box M3 tokens for color, type, and shape.
  - It is acceptable if this is not a perfect match to “M3 Expressive” as long as components follow the general M3 look and feel.
  - Further customization (theme builder, advanced tokens, motion) can be added later as polish.
- **Validations and feedback (M3)**:
  - Use **Material Design 3** (Material Web) for all validation and feedback:
    - **Validation**: e.g. `supporting-text` (helper/error text) on text fields, required/pattern/range checks, and inline error state the components support.
    - **Feedback**: **Snackbar** (e.g. “Meal saved”), **banner** or **dialog** for alerts (e.g. “You’re offline”, “Email not verified”). No custom-only toasts; use M3 components.

### 8. Theming: Light/Dark Mode & User Preference

- **Default behavior**:
  - Respect the system preference via `prefers-color-scheme`:
    - If the app mode is `system`, derive effective theme as:
      - `dark` if `prefers-color-scheme: dark`,
      - otherwise `light`.
- **User setting**:
  - Store a user-facing theme mode: `system` | `light` | `dark`.
  - Persist this choice in local storage and/or user profile.
  - Compute an **effective** theme (`light` or `dark`) based on this mode and the system preference.
- **Application**:
  - Apply the effective theme by setting an attribute such as `data-theme="light"` or `data-theme="dark"` on the root element (`<html>` or `<body>`).
  - Use this attribute to control `color-scheme` and any theme-specific CSS (e.g. different Material token sets per theme).
- **Where to change theme**:
  - Provide the theme selection UI **only** in the **Settings** screen (see §9). Do **not** show a global theme toggle on every page.
  - Options: “System default” | “Light” | “Dark” (e.g. as a submenu or select).

### 9. Screen & Component Structure (First Draft)

- **Global layout**:
  - **Top app bar**: **Only** the app title (h1). No icon; no theme toggle or sign-out on the bar. Keep the top bar minimal.
  - **Bottom navigation bar** for primary destinations: Today, History, Foods, Settings (Settings is the 4th item).
  - Main content in the middle, sized for mobile first.
- **Today screen**:
  - Header with current day (formatted as **DD Month YYYY**) and total calories.
  - Summary card using `md-outlined-card` showing macro totals (Protein, Carbs, Fat).
  - For each meal:
    - One `md-outlined-card` per meal.
    - Inside, a `md-list` of `md-list-item` rows for each meal item (food name, amount + unit, kcal).
  - A floating action button (`md-fab`) to add a new meal (or open a dialog/bottom sheet).
- **History / week view**:
  - **Current week** only: **Monday–Sunday**.
  - Per day: show **calories + macros** (e.g. protein, carbs, fat).
- **Settings screen**:
  - Contains **Theme** and **Sign out** only for MVP.
  - **Theme**: Opens a submenu or control to choose **Light**, **Dark**, or **System** (see §8). Implement with a Material Web select or list. Theme is changed **only** here.
  - **Sign out**: Available **only** in this screen (not in the top bar). Place under Theme or in the same screen.
  - Optional later: show signed-in email, “About” or version.

### 10. Build Plan (Stages)

Build in this order. Deploy at multiple checkpoints (not only at the end).


| Stage | Name                     | What it covers                                                                                                                                                                           |
| ----- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1** | **Scaffold**             | SvelteKit, deps, Material Web, PWA baseline, theme (light/dark), layout shell (top bar + bottom nav), routing skeleton.                                                                  |
| **2** | **Database**             | Neon + Drizzle: schema (auth-related + `food_entries`, `meals`, `meal_items`, profiles/roles), migrations.                                                                               |
| **3** | **Auth (user accounts)** | Better Auth: sign up, sign in, sign out, **forgot password**, email verification (block until verified), session, role from email (`calvinckang@gmail.com` = admin), route protection. |
| **4** | **Build**                | Features + UI in sub-stages **4a → 4b → 4c → 4d** (see below). Server logic (load functions, form actions) lives here. No separate public API for MVP.                                   |
| **5** | **Deploy (final)**       | Optional polish (motion, performance).                                                                                                                                                   |


**Build sub-stages (implementation order: 4a → 4b → 4c → 4d)**:

- **4a** – Food catalog (admin CRUD for food entries).
- **4b** – Today + meal log (meals, items, date Today/Yesterday, totals).
- **4c** – History / week view.
- **4d** – Settings (theme in Account, etc.).

**Deployment checkpoints** (deploy multiple times):


| After                    | What’s live                                      | Why deploy here                                          |
| ------------------------ | ------------------------------------------------ | -------------------------------------------------------- |
| **1. Scaffold**          | Shell: layout, theme, nav, no auth/data          | Confirm Netlify + repo; see app and theme on a real URL. |
| **2. Database**          | Same shell; DB + migrations exist                | Optional: verify Neon + migrations in prod.              |
| **3. Auth**              | Sign up, sign in, sign out, protected routes     | Validate Better Auth, secrets, and DB in production.     |
| **4a. Food catalog**     | Admin can add/edit/delete food entries           | Start populating the catalog in prod.                    |
| **4b. Today + meal log** | Full core flow: log meals, add items, see totals | Main MVP; app is usable end-to-end.                      |
| **4c. History**          | Week view / history                              | Feature-complete for MVP.                                |
| **4d. Settings**         | Theme + account settings                         | Polish and final MVP.                                    |
| **5. Deploy (final)**    | Optional: motion, performance, SEO               | Last pass before v1.                                     |


