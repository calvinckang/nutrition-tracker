import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { building } from '$app/environment';
import { eq } from 'drizzle-orm';
import { env } from '$env/dynamic/private';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { user as userTable } from '$lib/server/db/auth.schema';
import { svelteKitHandler } from 'better-auth/svelte-kit';

// #region agent log
const DEBUG_LOG = (data: Record<string, unknown>) => {
	const payload = { sessionId: '726253', location: 'hooks.server.ts', message: 'auth request', data, timestamp: Date.now(), hypothesisId: 'H1-H5' };
	fetch('http://127.0.0.1:7583/ingest/e7e4ebaa-41fd-47cb-b68d-1ef6657021b9', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '726253' }, body: JSON.stringify(payload) }).catch(() => {});
	console.log('[debug auth]', JSON.stringify(data));
};
// #endregion

const AUTH_PATHS = ['/sign-in', '/sign-up', '/forgot-password', '/check-email', '/reset-password'];
const APP_PATHS = ['/', '/history', '/foods', '/settings'];

function isAuthPath(pathname: string) {
	return AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
}
function isAppPath(pathname: string) {
	return APP_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

export const handle: Handle = async ({ event, resolve }) => {
	const pathname = event.url.pathname;

	// Let Better Auth handle its API routes first (avoids 404 when handler runs after our logic)
	if (pathname.startsWith('/api/auth')) {
		// #region agent log
		DEBUG_LOG({
			ORIGIN: env.ORIGIN ?? '(undefined)',
			requestOrigin: event.request.headers.get('origin') ?? '(none)',
			pathname,
			hasDatabaseUrl: !!env.DATABASE_URL
		});
		// #endregion
		const response = await svelteKitHandler({ event, resolve, auth, building });
		// #region agent log
		DEBUG_LOG({ pathname, responseStatus: response?.status });
		// #endregion
		return response;
	}

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

	if (session && isAuthPath(pathname)) throw redirect(302, '/');
	if (!session && isAppPath(pathname)) throw redirect(302, '/sign-in');

	return svelteKitHandler({ event, resolve, auth, building });
};
