<script lang="ts">
	import { SHOW_FLOW_TAB } from '$lib/ideas.js';

	type Tab = 'overview' | 'details' | 'flow';
	let activeTab = $state<Tab>('overview');
</script>

<div class="container">
	<h1>Ideas</h1>

	<div class="tabs">
		<button
			class="tab-btn"
			class:active={activeTab === 'overview'}
			onclick={() => (activeTab = 'overview')}
		>Overview</button>
		<button
			class="tab-btn"
			class:active={activeTab === 'details'}
			onclick={() => (activeTab = 'details')}
		>Details</button>
		<!-- Flow tab: code preserved, hidden from UI until re-enabled via SHOW_FLOW_TAB -->
		<button
			class="tab-btn flow-tab"
			class:active={activeTab === 'flow'}
			class:tab-hidden={!SHOW_FLOW_TAB}
			onclick={() => (activeTab = 'flow')}
		>Flow</button>
	</div>

	{#if activeTab === 'overview'}
		<div class="tab-content">
			<h2>Overview</h2>
			<p>Manage and track product ideas across validation stages.</p>
		</div>
	{/if}

	{#if activeTab === 'details'}
		<div class="tab-content">
			<h2>Details</h2>
			<p>Detailed view and editing for individual ideas.</p>
		</div>
	{/if}

	{#if activeTab === 'flow'}
		<div class="tab-content">
			<h2>Flow</h2>
			<p>Visualize how ideas progress through validation stages.</p>
		</div>
	{/if}
</div>

<style>
	.container {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
	}

	h1 {
		font-size: 1.75rem;
		font-weight: 700;
		color: #111;
		margin: 0 0 1.5rem;
	}

	.tabs {
		display: flex;
		gap: 0;
		border-bottom: 1px solid #e2e2e2;
		margin-bottom: 1.5rem;
	}

	.tab-btn {
		background: none;
		border: none;
		border-bottom: 2px solid transparent;
		padding: 0.6rem 1rem;
		font-size: 0.9rem;
		font-weight: 500;
		color: #666;
		cursor: pointer;
		margin-bottom: -1px;
	}

	.tab-btn:hover {
		color: #111;
	}

	.tab-btn.active {
		color: #1d4ed8;
		border-bottom-color: #1d4ed8;
	}

	.tab-hidden {
		display: none;
	}

	.tab-content {
		padding: 1rem 0;
	}

	.tab-content h2 {
		font-size: 1.1rem;
		font-weight: 600;
		color: #333;
		margin: 0 0 0.75rem;
	}

	.tab-content p {
		color: #555;
		font-size: 0.875rem;
		line-height: 1.5;
	}
</style>
