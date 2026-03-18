# Nutrimaxxing

A nutrition tracking app. Log meals, track daily macros (protein, carbs, fat), and manage your personal food database.

This guide will walk you through setting up the project locally or deploying it—even if you're new to development.

---

## What You'll Need

Before starting, you'll need:

1. **Node.js** — The software that runs JavaScript. Download it from [nodejs.org](https://nodejs.org) (choose the LTS version).
2. **pnpm** — A package manager that installs the project's dependencies. After installing Node.js, open a terminal and run:
   ```sh
   npm install -g pnpm
   ```
3. **A code editor** — For example [VS Code](https://code.visualstudio.com) or Cursor.

---

## Setting Up Locally (Run on Your Computer)

### Step 1: Install dependencies

Open a terminal in the project folder and run:

```sh
pnpm install
```

This downloads all the libraries the app needs.

### Step 2: Create your environment file

The app needs a few configuration values stored in a `.env` file.

1. Copy the example file:
   ```sh
   cp .env.example .env
   ```
2. Open `.env` in your editor and fill in the values (see below).

| Variable | What it is | How to get it |
|----------|------------|---------------|
| `DATABASE_URL` | A connection string to your database. The app stores all data (users, meals, foods) here. | Sign up at [Neon](https://neon.tech) (free tier). Create a project, then copy the connection string from the dashboard. |
| `BETTER_AUTH_SECRET` | A secret key that secures user logins. | Generate a random string of 32+ characters (e.g. use [randomkeygen.com](https://randomkeygen.com) or any password generator). |
| `ORIGIN` | The URL where the app runs. | For local development, use: `http://localhost:5173` |

### Step 3: Set up the database

The app uses a PostgreSQL database. After you've added `DATABASE_URL` to `.env`, run:

```sh
pnpm db:push
```

This creates the tables and structure the app needs in your database.

### Step 4: Start the development server

```sh
pnpm dev
```

The app will be available at **http://localhost:5173**. Open that URL in your browser.

To automatically open in a new tab:

```sh
pnpm dev -- --open
```

---

## Deploying to Netlify (Make It Live on the Web)

Netlify hosts your app so others can use it online. You'll need a [Netlify](https://netlify.com) account and to connect your GitHub repo.

### Environment variables on Netlify

In **Netlify → Your site → Site settings → Environment variables**, add these:

| Variable | What it does | How to get it |
|----------|--------------|---------------|
| `DATABASE_URL` | Same as local—connects the live app to your database. | Use the same Neon connection string. |
| `BETTER_AUTH_SECRET` | Same as local—keeps user sessions secure. | Use the same secret as in your `.env`. |
| `ORIGIN` | The public URL of your app. | Your Netlify URL, e.g. `https://your-app-name.netlify.app` |
| `RESEND_API_KEY` | Lets the app send emails (signup verification, password reset). | Sign up at [Resend](https://resend.com), create an API key, paste it here. |
| `EMAIL_FROM` | The "From" address for those emails. | Optional. Example: `Nutrimaxxing <noreply@yourdomain.com>` |

After adding variables, redeploy the site for changes to take effect.

---

## Useful Commands Reference

| Command | What it does |
|---------|--------------|
| `pnpm dev` | Starts the app locally so you can develop and preview changes. |
| `pnpm build` | Creates a production-ready version of the app. |
| `pnpm preview` | Lets you preview the production build on your computer. |
| `pnpm db:push` | Updates your database with the current schema (structure). |
| `pnpm db:studio` | Opens Drizzle Studio—a visual tool to view and edit database content. |
| `pnpm lint` | Checks code style and formatting. |
| `pnpm format` | Auto-formats code. |
| `pnpm test` | Runs automated tests. |

---

## Tech Stack (For Developers)

- SvelteKit (Svelte 5) + TypeScript  
- Drizzle ORM + PostgreSQL (Neon)  
- Better Auth  
- Resend (emails)  
- Material Web components  
- PWA support  

---

## License

Private project.
