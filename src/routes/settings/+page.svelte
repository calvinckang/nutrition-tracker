<script lang="ts">
	import { goto } from '$app/navigation';
	import { authClient } from '$lib/auth-client';
	import '@material/web/button/outlined-button.js';

	async function signOut() {
		await authClient.signOut();
		goto('/sign-in');
	}
</script>

<h2>Settings</h2>
<p>Theme control will go here (Stage 4d).</p>
<md-outlined-button onclick={signOut} onkeydown={(e: KeyboardEvent) => e.key === 'Enter' && signOut()} role="button" tabindex="0">Sign out</md-outlined-button>
