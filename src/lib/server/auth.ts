import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { eq } from 'drizzle-orm';
import { env } from '$env/dynamic/private';
import { getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import { user as userTable } from '$lib/server/db/auth.schema';
import { sendEmail } from '$lib/server/email';

// #region agent log
fetch('http://127.0.0.1:7583/ingest/e7e4ebaa-41fd-47cb-b68d-1ef6657021b9', {
	method: 'POST',
	headers: {
		'Content-Type': 'application/json',
		'X-Debug-Session-Id': 'cf7b24'
	},
	body: JSON.stringify({
		sessionId: 'cf7b24',
		runId: 'run1',
		hypothesisId: 'H1',
		location: 'src/lib/server/auth.ts:11',
		message: 'Better Auth initializing with ORIGIN',
		data: {
			originEnvDefined: typeof env.ORIGIN === 'string' && env.ORIGIN.length > 0
		},
		timestamp: Date.now()
	})
}).catch(() => {});
// #endregion

export const auth = betterAuth({
	baseURL: env.ORIGIN,
	basePath: '/api/auth',
	secret: env.BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, { provider: 'pg' }),
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
		sendResetPassword: async ({ user, url }) => {
			void sendEmail({
				to: user.email,
				subject: 'Reset your password',
				text: `Click the link to set a new password: ${url}`
			});
		}
	},
	emailVerification: {
		sendOnSignUp: true,
		sendVerificationEmail: async ({ user, url }) => {
			void sendEmail({
				to: user.email,
				subject: 'Verify your email',
				text: `Click the link to confirm your account: ${url}`
			});
		},
		autoSignInAfterVerification: true
	},
	databaseHooks: {
		user: {
			create: {
				after: async (user) => {
					const adminEmails = ['calvinchris87@gmail.com', 'calvinckang@gmail.com'];
					if (user.email && adminEmails.includes(user.email)) {
						await db.update(userTable).set({ role: 'admin' }).where(eq(userTable.id, user.id));
					}
				}
			}
		}
	},
	// getRequestEvent() is async in SvelteKit 2; plugin types expect sync — cast to satisfy
	plugins: [sveltekitCookies((() => getRequestEvent()) as Parameters<typeof sveltekitCookies>[0])]
});
