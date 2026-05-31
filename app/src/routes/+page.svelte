<script lang="ts">
	import { base } from '$app/paths';
	import type { Pack } from '$lib/packs';

	let { data } = $props();
	const packs = $derived<Pack[]>(data.packs);
</script>

<div class="container">
	<header class="page-header">
		<div>
			<p class="eyebrow">Quiz Lab</p>
			<h1>Pick a pack</h1>
			<p class="subtitle">Choose a published trivia pack and jump straight into a round.</p>
		</div>
	</header>

	<section class="pack-section" aria-labelledby="packs-title">
		<div class="section-heading">
			<div>
				<p class="eyebrow">Published packs</p>
				<h2 id="packs-title">Play existing quizzes</h2>
			</div>
			<span>{packs.length} packs</span>
		</div>

		<div class="pack-grid">
			{#each packs as pack (pack.id)}
				<a class="pack-card" href="{base}/play/{pack.id}">
					<div class="pack-header">
						<h3>{pack.title}</h3>
						<span class="category">{pack.category}</span>
					</div>
					<p class="description">{pack.description}</p>
					<div class="meta">
						<span>{pack.questions.length} questions</span>
						<span class="play">Play -></span>
					</div>
				</a>
			{/each}
		</div>
	</section>
</div>

<style>
	.container {
		max-width: 1080px;
		margin: 0 auto;
		padding: 2rem;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
		color: #141414;
	}

	.page-header,
	.section-heading,
	.pack-header,
	.meta {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.page-header {
		margin-bottom: 2rem;
	}

	.eyebrow {
		margin: 0 0 0.35rem;
		color: #0f766e;
		font-size: 0.74rem;
		font-weight: 800;
		letter-spacing: 0;
		text-transform: uppercase;
	}

	h1,
	h2,
	h3,
	p {
		margin-top: 0;
	}

	h1 {
		margin-bottom: 0.45rem;
		font-size: 2.75rem;
		font-weight: 850;
		line-height: 1;
		letter-spacing: 0;
	}

	h2 {
		margin-bottom: 0;
		font-size: 1.25rem;
		line-height: 1.2;
		letter-spacing: 0;
	}

	h3 {
		margin: 0;
		font-size: 1.05rem;
		line-height: 1.3;
		letter-spacing: 0;
	}

	.subtitle {
		max-width: 54ch;
		margin-bottom: 0;
		color: #555;
		line-height: 1.55;
	}

	.pack-section {
		border-top: 1px solid #e6e6e6;
		padding-top: 1.5rem;
	}

	.section-heading {
		margin-bottom: 1rem;
	}

	.section-heading > span {
		color: #666;
		font-size: 0.9rem;
		font-weight: 700;
	}

	.pack-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1rem;
	}

	.pack-card {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		border: 1px solid #dedede;
		border-radius: 8px;
		background: #fff;
		padding: 1rem;
		color: inherit;
		text-decoration: none;
		transition: border-color 120ms ease, box-shadow 120ms ease, transform 120ms ease;
	}

	.pack-card:hover {
		border-color: #1d4ed8;
		box-shadow: 0 10px 24px rgba(20, 20, 20, 0.08);
		transform: translateY(-2px);
	}

	.category {
		flex-shrink: 0;
		border-radius: 6px;
		background: #effcf8;
		color: #0f766e;
		padding: 0.2rem 0.45rem;
		font-size: 0.68rem;
		font-weight: 800;
		letter-spacing: 0;
		text-transform: uppercase;
		white-space: nowrap;
	}

	.description {
		flex: 1;
		margin-bottom: 0;
		color: #555;
		font-size: 0.92rem;
		line-height: 1.5;
	}

	.meta {
		color: #777;
		font-size: 0.85rem;
	}

	.play {
		color: #1d4ed8;
		font-weight: 800;
		white-space: nowrap;
	}

	.pack-card:hover .play {
		color: #0f766e;
	}

	@media (max-width: 680px) {
		.container {
			padding: 1.25rem;
		}

		.page-header,
		.section-heading,
		.pack-header,
		.meta {
			align-items: flex-start;
			flex-direction: column;
		}

		h1 {
			font-size: 2rem;
		}

	}
</style>
