<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { base } from '$app/paths';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<header class="site-header">
	<nav class="top-nav" aria-label="Primary">
		<a class="brand" href="{base}/">Quiz Lab</a>
		<div class="nav-links">
			<a href="{base}/">Packs</a>
			<a href="{base}/create">Create quiz</a>
			<a href="https://github.com/routeburn-alpha/product-demo-template" rel="noopener" target="_blank">
				GitHub
			</a>
		</div>
	</nav>
</header>

{@render children()}

<style>
	:global(body) {
		margin: 0;
		background: #fafafa;
	}

	.site-header {
		border-bottom: 1px solid #e6e6e6;
		background: #fff;
	}

	.top-nav {
		max-width: 1080px;
		margin: 0 auto;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.8rem 2rem;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
	}

	.brand {
		font-weight: 800;
		font-size: 1rem;
		color: #111;
		text-decoration: none;
		letter-spacing: -0.01em;
	}

	.nav-links {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 0.35rem;
	}

	.nav-links a {
		border-radius: 8px;
		color: #555;
		padding: 0.55rem 0.7rem;
		font-size: 0.85rem;
		font-weight: 700;
		text-decoration: none;
	}

	.nav-links a:hover {
		background: #f4f7fb;
		color: #1d4ed8;
	}

	@media (max-width: 560px) {
		.top-nav {
			align-items: flex-start;
			flex-direction: column;
			padding: 0.85rem 1.25rem;
		}

		.nav-links {
			display: grid;
			grid-template-columns: repeat(3, minmax(0, 1fr));
			width: 100%;
		}

		.nav-links a {
			text-align: center;
		}
	}
</style>
