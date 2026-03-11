import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { eq } from 'drizzle-orm';
import { env } from '$env/dynamic/private';
import { getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import { user as userTable } from '$lib/server/db/auth.schema';
import { sendEmail } from '$lib/server/email';

export const auth = betterAuth({
	baseURL: env.ORIGIN,
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
					if (user.email === 'calvinchris87@gmail.com') {
						await db.update(userTable).set({ role: 'admin' }).where(eq(userTable.id, user.id));
					}
				}
			}
		}
	},
	plugins: [sveltekitCookies(getRequestEvent)]
});
