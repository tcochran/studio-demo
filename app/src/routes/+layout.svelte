<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/state';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<nav class="top-nav">
	<a href="/" class:active={page.url.pathname === '/'}>Training</a>
	<a href="/champions" class:active={page.url.pathname === '/champions'}>Champions</a>
</nav>

{@render children()}

<style>
	.top-nav {
		max-width: 800px;
		margin: 0 auto;
		padding: 1rem 2rem 0;
		display: flex;
		gap: 1.5rem;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
		border-bottom: 1px solid #e2e2e2;
	}

	.top-nav a {
		text-decoration: none;
		color: #666;
		font-size: 0.9rem;
		font-weight: 500;
		padding-bottom: 0.75rem;
		border-bottom: 2px solid transparent;
	}

	.top-nav a:hover {
		color: #111;
	}

	.top-nav a.active {
		color: #1d4ed8;
		border-bottom-color: #1d4ed8;
	}
</style>
