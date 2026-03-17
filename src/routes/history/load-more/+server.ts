import { json } from '@sveltejs/kit';
import { getHistoryChunk } from '$lib/server/history';

export async function GET({ locals, url }) {
	const user = locals.user;
	if (!user?.id) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const before = url.searchParams.get('before');
	const { days, hasMore, nextCursor } = await getHistoryChunk(user.id, before);

	return json({ days, hasMore, nextCursor });
}
