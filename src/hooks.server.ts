import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { building } from '$app/environment';
import { eq } from 'drizzle-orm';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { user as userTable } from '$lib/server/db/auth.schema';
import { svelteKitHandler } from 'better-auth/svelte-kit';

const AUTH_PATHS = ['/sign-in', '/sign-up', '/forgot-password', '/check-email', '/reset-password'];
const APP_PATHS = ['/', '/history', '/foods', '/settings'];

function isAuthPath(pathname: string) {
	return AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
}
function isAppPath(pathname: string) {
	return APP_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

export const handle: Handle = async ({ event, resolve }) => {
	const session = await auth.api.getSession({ headers: event.request.headers });
	if (session) {
		event.locals.session = session.session;
		event.locals.user = session.user;
		const [row] = await db
			.select({ role: userTable.role })
			.from(userTable)
			.where(eq(userTable.id, session.user.id));
		event.locals.role = (row?.role as 'admin' | 'user') ?? 'user';
	}

	const pathname = event.url.pathname;
	if (session && isAuthPath(pathname)) throw redirect(302, '/');
	if (!session && isAppPath(pathname)) throw redirect(302, '/sign-in');

	return svelteKitHandler({ event, resolve, auth, building });
};
