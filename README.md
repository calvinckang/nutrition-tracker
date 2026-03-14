# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project
npx sv create my-app
```

To recreate this project with the same configuration:

```sh
# recreate this project
pnpm dlx sv@0.12.5 create --template minimal --types ts --add prettier eslint vitest="usages:unit,component" playwright sveltekit-adapter="adapter:netlify" drizzle="database:postgresql+postgresql:neon" better-auth="demo:password" --install pnpm .
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## Deploying to Netlify

For sign-up and password-reset emails to work in production, set these in **Netlify → Site settings → Environment variables** (and redeploy):

- **RESEND_API_KEY** – Your [Resend](https://resend.com) API key (required for sending verification and reset emails).
- **EMAIL_FROM** – Sender address, e.g. `Nutrimaxxing <noreply@yourdomain.com>` (optional; defaults to Resend’s onboarding address).
- **ORIGIN** – Your site URL, e.g. `https://your-app.netlify.app` (required for auth redirects).
- **BETTER_AUTH_SECRET** – Same value as in your local `.env`.
- **DATABASE_URL** – Your Neon (or other Postgres) connection string.
