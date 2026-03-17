import { redirect } from '@sveltejs/kit';
import { getHistoryChunk } from '$lib/server/history';

export async function load({ locals }) {
	const user = locals.user;
	if (!user?.id) throw redirect(302, '/sign-in');

	const { days, hasMore, nextCursor, today } = await getHistoryChunk(user.id);

	return {
		today,
		days,
		hasMore,
		nextCursor
	};
}
