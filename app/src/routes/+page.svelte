<script lang="ts">
	let { data } = $props();
</script>

<div class="container">
	<header>
		<h1>Training Portal</h1>
		<p class="subtitle">Required and optional training courses for all employees</p>
	</header>

	<div class="training-list">
		{#each data.trainings as training (training.id)}
			<div class="training-card">
				<div class="card-header">
					<h2>{training.title}</h2>
					{#if training.required}
						<span class="badge required">Required</span>
					{:else}
						<span class="badge optional">Optional</span>
					{/if}
				</div>
				<p class="description">{training.description}</p>
				<div class="meta">
					<span class="category">{training.category}</span>
					<span class="duration">{training.duration}</span>
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.container {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
	}

	header {
		margin-bottom: 2rem;
	}

	h1 {
		font-size: 1.75rem;
		font-weight: 700;
		color: #111;
		margin: 0;
	}

	.subtitle {
		color: #666;
		margin: 0.25rem 0 0;
		font-size: 0.95rem;
	}

	.training-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.training-card {
		border: 1px solid #e2e2e2;
		border-radius: 8px;
		padding: 1.25rem;
		background: #fff;
	}

	.card-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		margin-bottom: 0.5rem;
	}

	h2 {
		font-size: 1rem;
		font-weight: 600;
		color: #111;
		margin: 0;
	}

	.badge {
		font-size: 0.7rem;
		font-weight: 600;
		padding: 0.2rem 0.5rem;
		border-radius: 4px;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		white-space: nowrap;
	}

	.badge.required {
		background: #fef2f2;
		color: #b91c1c;
	}

	.badge.optional {
		background: #f0f9ff;
		color: #1d4ed8;
	}

	.description {
		color: #555;
		font-size: 0.875rem;
		line-height: 1.5;
		margin: 0 0 0.75rem;
	}

	.meta {
		display: flex;
		gap: 1rem;
		font-size: 0.8rem;
		color: #888;
	}

	.category {
		background: #f5f5f5;
		padding: 0.15rem 0.5rem;
		border-radius: 4px;
	}
</style>
