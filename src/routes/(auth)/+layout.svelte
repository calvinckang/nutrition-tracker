<script lang="ts">
	import '../../app.css';
	import '@material/web/button/filled-button.js';
	import '@material/web/button/outlined-button.js';
	import '@material/web/textfield/outlined-text-field.js';

	let { children } = $props();
</script>

<div class="auth-layout">
	{@render children()}
</div>

<style>
	.auth-layout {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100dvh;
		padding: 24px;
	}
</style>
